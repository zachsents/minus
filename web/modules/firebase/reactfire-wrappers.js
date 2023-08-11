import { collection, doc } from "firebase/firestore"
import { useFirestoreCollectionData as useFirestoreCollectionDataRF, useFirestoreDocData as useFirestoreDocDataRF } from "reactfire"
import { fire } from "."


export function useFirestoreDocData(docRef) {
    return useFirestoreDocDataRF(docRef || doc(fire.db, "placeholder", "placeholder"), {
        idField: "id",
    })
}


export function useFirestoreCollectionData(collectionRef) {
    return useFirestoreCollectionDataRF(collectionRef || collection(fire.db, "placeholder"), {
        idField: "id",
    })
}