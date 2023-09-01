import { modals, openContextModal } from "@mantine/modals"
import { customAlphabet } from "nanoid"
import { alphanumeric } from "nanoid-dictionary"
import { useEffect, useState } from "react"
import { MODALS } from "./constants"
import { Text } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"


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


/**
 * @param {string} action
 * @param {{ title: string } & import("../components/ConfirmImportantModal.jsx").ConfirmImportantModalProps} options
 */
export function openImportantConfirmModal(action = "", {
    title,
    ...innerProps
} = {}) {
    openContextModal({
        modal: MODALS.IMPORTANT_CONFIRM,
        title: <b className="mr-lg">{title || `Are you sure you want to ${action}?`}</b>,
        innerProps,
    })
}


export function getInitials(str) {
    return str.split(/\s+/).map(word => word[0]).slice(0, 2).join("").toUpperCase()
}


export function confirmFirst(fn, {
    title = "Are you sure?",
    action,
    ...modalProps
} = {}) {
    return (...args) => modals.openConfirmModal({
        title,
        children: <Text size="sm">{action ? `Are you sure you want to ${action}?` : "Are you sure?"}</Text>,
        cancelProps: { variant: "outline" },
        centered: true,
        onConfirm: () => fn(...args),
        labels: {
            confirm: "Yes",
            cancel: "Cancel",
        },
        ...modalProps,
    })
}


/**
 * @param {*} state
 * @param {(newState: any) => void} setState
 * @param {number} debounce
 * @param {object} options
 * @param {(a: any, b: any) => boolean} options.equalityFn
 */
export function useDebouncedSynchronizedState(state, setState, debounce, {
    equalityFn = (a, b) => a == b,
} = {}) {
    const [instantState, setInstantState] = useState(state)

    // Sync: instant state -> debounced
    const [debouncedState] = useDebouncedValue(instantState, debounce)

    // Sync: debounced -> upper state
    useEffect(() => {
        if (!equalityFn(debouncedState, state))
            setState(debouncedState)
    }, [debouncedState])

    // Sync: upper state -> instant state
    useEffect(() => {
        if (!equalityFn(state, instantState))
            setInstantState(state)
    }, [state])

    return [instantState, setInstantState]
}