

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