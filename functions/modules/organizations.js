import { FieldValue } from "firebase-admin/firestore"
import { ORGANIZATIONS_COLLECTION, WORKFLOWS_COLLECTION } from "shared/constants/firebase.js"
import { db } from "../index.js"
import { HttpsError } from "firebase-functions/v2/https"


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
 * 
 * @property {UserID} createdFor Every account is started with a personal organization
 */


/**
 * @param {Partial<Organization>} [data={}]
 */
export async function createOrganization({
    name = "New Organization",
    ...data
} = {}) {
    return db.collection(ORGANIZATIONS_COLLECTION).add({
        name,
        color: "primary",
        ...data,

        createdAt: FieldValue.serverTimestamp(),
    })
}


/**
 * @param {OrganizationID} organizationId
 */
export async function deleteOrganization(organizationId) {

    const orgRef = db.collection(ORGANIZATIONS_COLLECTION).doc(organizationId)
    const batch = db.batch()

    db.collection(WORKFLOWS_COLLECTION)
        .where("organization", "==", orgRef).get()
        .then(snapshot => snapshot.docs.forEach(doc => batch.delete(doc.ref)))

    batch.delete(orgRef)

    await batch.commit()
}


/**
 * @param {OrganizationID} organizationId
 * @param {UserID} userId
 * @param {"member" | "admin"} rank
 */
export async function changeUserPermissions(organizationId, userId, rank) {
    await db.collection(ORGANIZATIONS_COLLECTION).doc(organizationId).update({
        admins: rank === "admin" ? FieldValue.arrayUnion(userId) : FieldValue.arrayRemove(userId),
        members: rank === "member" ? FieldValue.arrayUnion(userId) : FieldValue.arrayRemove(userId),
    })
}


/**
 * @param {OrganizationID} organizationId
 * @param {UserID} userId
 */
export async function assertUserMustOwnOrganization(organizationId, userId) {
    const org = await db.collection(ORGANIZATIONS_COLLECTION).doc(organizationId).get()

    if (!org.exists)
        throw new HttpsError("not-found", "Organization not found")

    if (org.data().owner !== userId)
        throw new HttpsError("permission-denied", "You do not own this organization")
}