import admin from "firebase-admin"
import { setGlobalOptions } from "firebase-functions/v2"

admin.initializeApp()
setGlobalOptions({ maxInstances: 10 })

export * from "./users.js"