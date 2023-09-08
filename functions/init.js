import admin from "firebase-admin"
import { defineSecret } from "firebase-functions/params"
import { setGlobalOptions } from "firebase-functions/v2"

export const stripeKey = defineSecret("firestore-stripe-payments-STRIPE_API_KEY")

admin.initializeApp()
setGlobalOptions({ maxInstances: 10 })

export const db = admin.firestore()