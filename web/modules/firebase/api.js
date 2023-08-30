import { httpsCallable } from "firebase/functions"
import { fire } from "."
import { useMutation, useQuery } from "react-query"


export async function api(route, params = {}) {
    const { data } = await httpsCallable(fire.functions, "api")({
        route,
        params,
    })
    return data
}


/**
 * @param {string} route
 * @param {object} [defaultParams={}]
 * @param {import("react-query").UseMutationOptions} [mutationOptions={}]
 */
export function useAPI(route, defaultParams = {}, mutationOptions = {}) {
    const { mutateAsync, ...query } = useMutation(params => api(route, {
        ...defaultParams,
        ...params,
    }), mutationOptions)
    return [mutateAsync, query]
}


/**
 * @param {string} route
 * @param {object} params
 * @param {import("react-query").UseQueryOptions} [queryOptions={}]
 */
export function useAPIQuery(route, params, queryOptions = {}) {
    const { data, ...query } = useQuery({
        queryKey: [route, params],
        queryFn: () => api(route, params),
        enabled: !!route && !!params,
        ...queryOptions,
    })
    return [data, query]
}