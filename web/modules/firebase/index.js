import { getAnalytics } from "firebase/analytics"
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getFunctions } from "firebase/functions"
import { getStorage } from "firebase/storage"


const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: "xxx",
    projectId: "xxx",
    storageBucket: "xxx",
    messagingSenderId: "xxx",
    appId: "xxx",
    measurementId: "xxx"
}


// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = global.window && getAnalytics(app)
const db = getFirestore(app)
const storage = getStorage(app)
const auth = getAuth(app)
const functions = getFunctions(app)


// if (process.env.NODE_ENV == "development" || process.env.NODE_ENV == "test") {
//     // connectFunctionsEmulator(functions, "localhost", functionsEmulatorPort)
//     if (!db._settingsFrozen)
//         connectFirestoreEmulator(db, "localhost", 8080)
// }


export const fire = {
    app,
    analytics,
    db,
    storage,
    auth,
    functions,
}

export * from "./use-count-query"
