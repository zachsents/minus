import { updateDoc } from "firebase/firestore"
import { useMutation } from "react-query"

export function useUpdateDoc(ref) {
    const mutation = useMutation(updateData => updateDoc(ref, updateData))
    return [mutation.mutate, mutation]
}