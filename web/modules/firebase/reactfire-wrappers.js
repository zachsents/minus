import { doc } from "firebase/firestore"
import { useFirestoreDocData as useFirestoreDocDataRF } from "reactfire"
import { fire } from "."


export function useFirestoreDocData(docRef) {
    return useFirestoreDocDataRF(docRef || doc(fire.db, "placeholder", "placeholder"), {
        idField: "id",
    })
}