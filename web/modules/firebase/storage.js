import { getBlob, ref, uploadString } from "firebase/storage"
import { useMutation, useQuery } from "react-query"
import { fire } from "."


/**
 * @param {string} path
 * @param {{ key: *[] } & import("react-query").UseQueryOptions} [options]
 * @return {*} 
 */
export function useStorageFileContent(path, {
    key = [],
    ...options
} = {}) {

    const query = useQuery({
        queryKey: ["get-storage-file-content", path, ...key],
        queryFn: async () => {
            try {
                const blob = await getBlob(ref(fire.storage, path))
                return blob.text()
            }
            catch (err) {
                if (err.code === "storage/object-not-found")
                    return null

                throw err
            }
        },
        enabled: !!path,
        ...options,
    })

    return [query.data, query]
}


/**
 * @param {string} path
 * @return {[import("react-query").UseMutateFunction, import("react-query").MutationResult]} 
 */
export function useSetStorageFileContent(path) {
    const mutation = useMutation(content => uploadString(ref(fire.storage, path), content))
    return [mutation.mutate, mutation]
}