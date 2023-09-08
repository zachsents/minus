

import { HttpsError } from "firebase-functions/v2/https"
import { db } from "./init.js"
import { ORGANIZATIONS_COLLECTION, STRIPE_CUSTOMERS_COLLECTION } from "shared/firebase.js"


/**
 * @param {{ auth: { uid: string } } | string} reqOrUid
 */
export async function getStripeCustomerId(reqOrUid) {
    const uid = typeof reqOrUid === "string" ? reqOrUid : reqOrUid.auth.uid
    const userDoc = await db.collection(STRIPE_CUSTOMERS_COLLECTION).doc(uid).get()
    return userDoc.data().stripeId
}


/**
 * @param {import("stripe").Stripe} stripe
 * @param {string} orgId
 */
export async function getSubscriptionForOrganization(stripe, orgId, retrieve = true) {

    const owner = await db.collection(ORGANIZATIONS_COLLECTION).doc(orgId).get()
        .then(doc => doc.data().owner)

    const subscriptionId = await db.collection(STRIPE_CUSTOMERS_COLLECTION)
        .doc(owner).collection("subscriptions")
        .where("metadata.orgId", "==", orgId)
        .get()
        .then(snapshot => {
            if (snapshot.empty)
                throw new HttpsError("not-found", "No subscription found for this organization")
            return snapshot.docs[0].id
        })

    return retrieve ?
        stripe.subscriptions.retrieve(subscriptionId) :
        subscriptionId
}


/**
 * @param {import("stripe").Stripe} stripe
 * @param {object} parameters
 * @param {string} parameters.orgId
 * @param {string} parameters.plan
 * @param {string} parameters.paymentMethod Payment method ID that belongs to the customer
 */
// export async function changePlanForOrganization(stripe, { orgId, plan, paymentMethod } = {}) {

//     const subscription = await getSubscriptionForOrganization(stripe, orgId)

//     // const requestedPriceId = PLAN_STRIPE_PRICE_ID[plan]

//     // if (subscription.items.data[0].price.id === requestedPriceId)
//     //     throw new HttpsError("already-exists", "You are already subscribed to this plan")

//     // await stripe.subscriptions.update(subscription.id, {
//     //     proration_behavior: "none",
//     //     billing_cycle_anchor: "unchanged",
//     //     items: [{
//     //         id: subscription.items.data[0].id,
//     //         price: requestedPriceId,
//     //     }],
//     //     default_payment_method: paymentMethod,
//     // })

//     // TO DO: reimplment this with pricing structure
// }