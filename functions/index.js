import admin from "firebase-admin"
import { setGlobalOptions } from "firebase-functions/v2"

admin.initializeApp()
setGlobalOptions({ maxInstances: 10 })

export const db = admin.firestore()

export * from "./api/index.js"
export * from "./users.js"