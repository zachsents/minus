import admin from "firebase-admin"
import { FieldValue } from "firebase-admin/firestore"
import { ORGANIZATIONS_COLLECTION } from "shared/constants/firebase.js"


/** @typedef {string} UserID */

/** @typedef {string} OrganizationID */


/**
 * @typedef {object} Organization
 * 
 * @property {string} name
 * @property {UserID} owner
 * @property {UserID[]} admins
 * @property {UserID[]} members
 * @property {import("firebase-admin/firestore").DocumentReference[]} workflows
 * 
 * @property {UserID} createdFor Every account is started with a personal organization
 * 
 * @property {import("firebase-admin").firestore.Timestamp} createdAt
 */


/**
 * @param {Partial<Organization>} [data={}]
 */
export async function createOrganization({
    name = "New Organization",
    ...data
} = {}) {
    return admin.firestore().collection(ORGANIZATIONS_COLLECTION).add({
        name,
        ...data,

        createdAt: FieldValue.serverTimestamp(),
    })
}


/**
 * @param {OrganizationID} organizationId
 * @param {UserID} userId
 * @param {"member" | "admin"} rank
 */
export async function changeUserPermissions(organizationId, userId, rank) {
    await admin.firestore().collection(ORGANIZATIONS_COLLECTION).doc(organizationId).update({
        admins: rank === "admin" ? FieldValue.arrayUnion(userId) : FieldValue.arrayRemove(userId),
        members: rank === "member" ? FieldValue.arrayUnion(userId) : FieldValue.arrayRemove(userId),
    })
}
