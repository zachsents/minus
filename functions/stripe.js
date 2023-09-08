import { onCall } from "firebase-functions/v2/https"
import { Stripe } from "stripe"
import { stripeKey } from "./init.js"
import { getStripeCustomerId } from "./modules/stripe.js"


/**
 * Might not need most of this. Going to try to use payment links everywhere that
 * I can.
 */

export const onRequestStripeSetupIntent = onCall({
    secrets: [stripeKey],
}, async (req) => {

    const stripe = new Stripe(stripeKey.value())

    const customerId = await getStripeCustomerId(req)

    const intent = await stripe.setupIntents.create({
        payment_method_types: ["card"],
        customer: customerId,
        usage: "off_session",
    })

    return {
        id: intent.id,
        clientSecret: intent.client_secret,
    }
})


export const onRequestPaymentMethods = onCall({
    secrets: [stripeKey],
}, async (req) => {

    const stripe = new Stripe(stripeKey.value())

    const customerId = await getStripeCustomerId(req)

    const paymentMethods = await stripe.customers.listPaymentMethods(customerId, {
        type: "card",
    })

    return paymentMethods.data
})


// export const onRequestChangePlanForScript = onCall({
//     secrets: [stripeKey],
// }, async (req) => {

//     if (!(await ownsScript(req.auth.uid, req.data.scriptId)))
//         throw new HttpsError("permission-denied", "You do not own this script")

//     const stripe = new Stripe(stripeKey.value())

//     let siPaymentMethod
//     if (req.data.setupIntent) {
//         const intent = await stripe.setupIntents.retrieve(req.data.setupIntent)
//         siPaymentMethod = intent.payment_method
//     }

//     await changePlanForOrganization(stripe, {
//         orgId: req.data.scriptId,
//         plan: req.data.plan,
//         paymentMethod: req.data.paymentMethod || siPaymentMethod,
//     })
// })