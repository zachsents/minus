import { getCountFromServer } from "firebase/firestore"
import { useQuery } from "react-query"


/**
 * Provides the count of documents in a Firestore query.
 * 
 * Note: Count queries don't support realtime updates, so this hook uses polling to update the count.
 * 
 * @export
 * @param {import("firebase/firestore").CollectionReference | import("firebase/firestore").Query} reference
 * @param {object} options
 * @param {number} [options.pollInterval=10000] The interval, in milliseconds, at which to poll the query.
 * @param {string} [options.queryKey=""] The query key to use for React Query.
 */
export function useFirestoreCount(reference, {
    pollInterval = 10000,
    queryKey = "",
} = {}) {

    const query = useQuery({
        queryKey: ["firestore-count", queryKey],
        queryFn: async () => {
            const snapshot = await getCountFromServer(reference)
            return snapshot.data().count
        },
        refetchInterval: pollInterval,
        enabled: !!reference,
    })

    return [query.data, query]
}