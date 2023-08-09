import { useMemo } from "react"
import { fire } from "."
import { doc } from "firebase/firestore"


export function useFirestoreDocRef(...pathSegments) {
    return useMemo(() => {
        return doc(fire.db, ...pathSegments.map(seg => seg || "placeholder"))
    }, [pathSegments.join()])
}