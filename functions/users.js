import admin from "firebase-admin"
import { FieldValue } from "firebase-admin/firestore"
import functions from "firebase-functions"
import { USER_DATA_COLLECTION } from "shared/constants/firebase.js"
import { PLAN } from "shared/constants/plans.js"
import { createOrganization } from "./modules/organizations.js"


export const setupUserAccount = functions.auth.user().onCreate(async (user) => {

    const userDataRef = admin.firestore().collection(USER_DATA_COLLECTION).doc(user.uid)

    await userDataRef.set({
        createdAt: FieldValue.serverTimestamp(),
        createdPersonalOrganization: false,
    })

    await createOrganization({
        name: user.displayName ? `${user.displayName}'s Organization` : "Personal Organization",
        owner: user.uid,
        createdFor: user.uid,
        plan: PLAN.FREE,
    })

    await userDataRef.update({
        createdPersonalOrganization: true,
    })
})