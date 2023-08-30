import { FieldValue } from "firebase-admin/firestore"
import { HttpsError } from "firebase-functions/v2/https"
import { ORGANIZATIONS_COLLECTION, WORKFLOWS_COLLECTION } from "shared/firebase.js"
import { db } from "../index.js"
import { deleteWorkflow } from "./workflows.js"


/** @typedef {string} UserID */

/** @typedef {string} OrganizationID */


/**
 * @typedef {object} Organization
 * 
 * @property {string} name
 * @property {import("firebase-admin").firestore.Timestamp} createdAt
 * @property {string} plan
 * 
 * @property {UserID} owner
 * @property {UserID[]} admins
 * @property {UserID[]} members
 * @property {string[]} pendingInvitations These are email addresses, not UIDs.
 * 
 * @property {UserID} createdFor Every account is started with a personal organization
 */


/**
 * @param {OrganizationID} orgId
 */
export function organizationRef(orgId) {
    return db.collection(ORGANIZATIONS_COLLECTION).doc(orgId)
}


/**
 * @param {OrganizationID} orgId
 * @returns {Promise<Organization & { id: OrganizationID }>}
 */
export async function getOrganization(orgId) {
    const doc = await organizationRef(orgId).get()

    if (!doc.exists)
        throw new HttpsError("not-found", "Organization not found")

    return {
        id: doc.id,
        ...doc.data(),
    }
}


/**
 * @param {Partial<Organization>} [data={}]
 */
export async function createOrganization({
    name = "New Organization",
    ...data
} = {}) {
    return await db.collection(ORGANIZATIONS_COLLECTION).add({
        name,
        color: "primary",
        members: [],
        admins: [],
        ...data,

        createdAt: FieldValue.serverTimestamp(),
    })
}


/**
 * @param {OrganizationID} organizationId
 */
export async function deleteOrganization(organizationId) {

    const orgRef = organizationRef(organizationId)
    const batch = db.batch()

    await Promise.all(
        await db.collection(WORKFLOWS_COLLECTION)
            .where("organization", "==", orgRef).get()
            .then(snapshot => snapshot.docs.map(doc => deleteWorkflow(doc.id, batch)))
    )

    batch.delete(orgRef)

    await batch.commit()
}


/**
 * @param {OrganizationID} organizationId
 * @param {UserID} userId
 * @param {"member" | "admin"} rank
 */
export async function changeUserPermissions(organizationId, userId, rank) {
    await organizationRef(organizationId).update({
        admins: rank === "admin" ? FieldValue.arrayUnion(userId) : FieldValue.arrayRemove(userId),
        members: rank === "member" ? FieldValue.arrayUnion(userId) : FieldValue.arrayRemove(userId),
    })
}


/**
 * @param {OrganizationID} organizationId
 * @param {UserID} userId
 */
export async function assertUserMustOwnOrganization(organizationId, userId) {
    const org = await getOrganization(organizationId)

    if (org.owner !== userId)
        throw new HttpsError("permission-denied", "You do not own this organization")
}


export async function assertUserMustHaveAdminRightsForOrganization(organizationId, userId) {
    const org = await getOrganization(organizationId)

    if (org.owner === userId || org.admins?.includes(userId))
        return

    throw new HttpsError("permission-denied", "You do not have permissions for this organization")
}


export async function assertUserMustBeInOrganization(organizationId, userId) {
    const org = await getOrganization(organizationId)

    if (org.owner === userId || org.admins?.includes(userId) || org.members?.includes(userId))
        return

    throw new HttpsError("permission-denied", "You are not in this organization")
}


export async function assertUserCantBeInOrganization(organizationId, userId) {
    const org = await getOrganization(organizationId)

    if (org.owner === userId || org.admins?.includes(userId) || org.members?.includes(userId))
        throw new HttpsError("permission-denied", "User must not be in this organization")
}
