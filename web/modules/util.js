import { customAlphabet } from "nanoid"
import { alphanumeric } from "nanoid-dictionary"
import { useEffect, useState } from "react"


const _uniqueId = customAlphabet(alphanumeric, 10)
export const uniqueId = (prefix = "") => `${prefix}${_uniqueId()}`


/**
 * An extension on Lodash's _.get function, but allows for special syntax.
 * If one of the path segments contains an "=", it will be interpreted as 
 * a key-value pair, and it will find the object in the array with the
 * matching key-value pair.
 *
 * @param {*} object
 * @param {string} path
 */
export function _get(object, path) {
    const segments = path.split(".")

    return segments.reduce((result, segment) => {
        if (segment.includes("=")) {
            const [key, value] = segment.split("=")
            return result.find(item => item[key] == value)
        } else {
            return result?.[segment]
        }
    }, object)
}

/**
 * An extension on Lodash's _.set function, but allows for special syntax.
 * If one of the path segments contains an "=", it will be interpreted as
 * a key-value pair, and it will find the object in the array with the
 * matching key-value pair.
 * 
 * @param {*} object 
 * @param {string} path 
 * @param {*} value 
 */
export function _set(object, path, value) {
    const segments = path.split(".")
    const lastSegment = segments.pop()

    const selectedObject = segments.reduce((result, segment) => {
        if (segment.includes("=")) {
            const [key, value] = segment.split("=")
            const found = result.find(item => item[key] == value)

            if (found)
                return found

            const newObj = { [key]: value }
            result.push(newObj)

            return newObj
        } else {
            result[segment] ??= {}
            return result[segment]
        }
    }, object)

    selectedObject[lastSegment] = value
}


export function useIsClient() {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    return isClient
}

