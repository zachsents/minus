import { FieldValue } from "firebase-admin/firestore"
import { HttpsError } from "firebase-functions/v2/https"
import { WORKFLOWS_COLLECTION, WORKFLOW_TRIGGERS_COLLECTION, WORKFLOW_VERSIONS_COLLECTION } from "shared/firebase.js"
import { db } from "../index.js"
import { organizationRef } from "./organizations.js"


/** @typedef {string} WorkflowID */

/** @typedef {string} UserID */


/**
 * @typedef {object} Workflow
 * 
 * @property {string} name
 * @property {boolean} isEnabled
 * @property {UserID} creator
 * @property {import("firebase-admin/firestore").Timestamp} createdAt
 * @property {import("firebase-admin/firestore").Timestamp} lastEditedAt
 * 
 * @property {import("firebase-admin/firestore").DocumentReference} organization
 * @property {import("firebase-admin/firestore").DocumentReference} currentVersion
 */


/**
 * @param {WorkflowID} workflowId
 */
export function workflowRef(workflowId) {
    return db.collection(WORKFLOWS_COLLECTION).doc(workflowId)
}


/**
 * @param {WorkflowID} workflowId
 * @returns {Promise<Workflow & { id: WorkflowID }>}
 */
export async function getWorkflow(workflowId) {
    const doc = await workflowRef(workflowId).get()

    if (!doc.exists)
        throw new HttpsError("not-found", "Workflow not found")

    return {
        id: doc.id,
        ...doc.data(),
    }
}


/**
 * @param {Partial<Workflow>} [data={}]
 */
export async function createWorkflow({
    name = "New Workflow",
    ...data
} = {}) {
    const workflowRef = db.collection(WORKFLOWS_COLLECTION).doc()
    const versionRef = db.collection(WORKFLOW_VERSIONS_COLLECTION).doc()

    await Promise.all([
        workflowRef.set({
            name,
            ...data,
            createdAt: FieldValue.serverTimestamp(),
            currentVersion: versionRef,
            isEnabled: false,
        }),

        versionRef.set({
            name: "Version 1",
            createdAt: FieldValue.serverTimestamp(),
            graph: JSON.stringify({ nodes: [], edges: [] }),
            workflow: workflowRef,
        })
    ])

    return workflowRef
}


/**
 * @param {WorkflowID} workflowId
 * @param {import("firebase-admin/firestore").WriteBatch} [batch]
 */
export async function deleteWorkflow(workflowId, batch) {

    const passedBatch = !!batch
    batch ??= db.batch()

    const ref = workflowRef(workflowId)

    await Promise.all([
        db.collection(WORKFLOW_TRIGGERS_COLLECTION)
            .where("workflow", "==", ref).get()
            .then(snapshot => snapshot.docs.forEach(doc => batch.delete(doc.ref))),

        db.collection(WORKFLOW_VERSIONS_COLLECTION)
            .where("workflow", "==", ref).get()
            .then(snapshot => snapshot.docs.forEach(doc => batch.delete(doc.ref)))
    ])

    batch.delete(ref)

    if (!passedBatch)
        await batch.commit()
}


/**
 * @param {WorkflowID} workflowId
 * @param {UserID} userId
 */
export async function assertUserMustBeWorkflowCreator(workflowId, userId) {
    const workflow = await getWorkflow(workflowId)
    if (workflow.creator !== userId)
        throw new HttpsError("permission-denied", "User must be workflow creator")
}


/**
 * @param {import("./organizations.js").OrganizationID} orgId
 */
export async function countWorkflowsForOrganization(orgId) {
    const orgRef = organizationRef(orgId)
    const workflowCount = await db.collection(WORKFLOWS_COLLECTION)
        .where("organization", "==", orgRef)
        .count().get()
        .then(snapshot => snapshot.data().count)

    return workflowCount
}