import { WORKFLOWS_COLLECTION, WORKFLOW_TRIGGERS_COLLECTION, WORKFLOW_VERSIONS_COLLECTION } from "shared/constants/firebase.js"
import { db } from "../index.js"
import { HttpsError } from "firebase-functions/v2/https"


/** @typedef {string} WorkflowID */


/**
 * @typedef {object} Workflow
 * 
 * @property {string} name
 * @property {boolean} isEnabled
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