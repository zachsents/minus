import { useRouter } from "next/router"
import { useEffect } from "react"
import { useCallback } from "react"
import { useUser } from "reactfire"


/**
 * @param {import("next/router").NextRouter} router
 * @param {string} path
 */
export function redirectKeepParams(router, path, shallow = false) {
    router[shallow ? "replace" : "push"]({
        path: path,
        query: router.query,
    }, undefined, {
        shallow,
    })
}


export function useQueryParam(param, defaultValue) {
    const router = useRouter()
    const value = router.query[param]

    const setValue = useCallback((newValue) => {
        router.query[param] = newValue
        router.replace(router, undefined, {
            shallow: true,
        })
    })

    useEffect(() => {
        if (router.isReady && value === undefined && defaultValue !== undefined)
            setValue(defaultValue)
    }, [router.isReady])

    return [value, setValue]
}


export function useMustNotBeLoggedIn(redirect = "/dashboard") {

    const router = useRouter()
    const { hasEmitted, data: user } = useUser()

    useEffect(() => {
        if (hasEmitted && user && redirect) {
            router.push(redirect)
        }
    }, [hasEmitted, user, redirect])
}


export function useMustBeLoggedIn(redirect = "/login") {

    const router = useRouter()
    const { hasEmitted, data: user } = useUser()

    useEffect(() => {
        if (hasEmitted && !user && redirect) {
            router.push(redirect)
        }
    }, [hasEmitted, user, redirect])
}