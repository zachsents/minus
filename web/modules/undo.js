import { useDebouncedValue } from "@mantine/hooks"
import _ from "lodash"
import { useCallback, useEffect, useReducer } from "react"


/**
 * @param {*} value
 * @param {function} setValue
 * @param {object} options
 * @param {number} [options.historyLimit=10]
 * @param {number} [options.debounce=0]
 * @param {function} [options.equality=(a, b) => a === b]
 */
export function useUndoRedo(value, setValue, {
    historyLimit = 10,
    debounce = 0,
    equality = (a, b) => a === b,
} = {}) {

    const [history, dispatch] = useReducer((state, action) => {

        const canUndo = state.past.length > 0
        const canRedo = state.future.length > 0

        if (action.type == "undo" && canUndo) {
            setValue?.(state.past[0])
            return {
                past: state.past.slice(1),
                future: [state.present, ...state.future],
                present: state.past[0],
            }
        }

        if (action.type == "redo" && canRedo) {
            setValue?.(state.future[0])
            return {
                past: [state.present, ...state.past],
                future: state.future.slice(1),
                present: state.future[0],
            }
        }

        if (action.type == "set" && !equality(action.value, state.present)) {
            return {
                past: [state.present, ...state.past].slice(0, historyLimit),
                future: [],
                present: action.value,
            }
        }

        return state
    }, {
        past: [],
        future: [],
        present: value,
    })

    const [debouncedValue] = useDebouncedValue(value, debounce)

    useEffect(() => {
        dispatch({
            type: "set",
            value: debouncedValue,
        })
    }, [debouncedValue])

    const undo = useCallback(() => dispatch({ type: "undo" }), [])
    const redo = useCallback(() => dispatch({ type: "redo" }), [])

    return [history.present, undo, redo]
}


export const graphEquality = (a, b) => {
    const pickNode = node => _.pick(node, ["position", "data.name", "data.inputs", "data.outputs"])
    const pickEdge = edge => _.pick(edge, ["source", "sourceHandle", "target", "targetHandle"])

    const pickedA = {
        nodes: a.nodes.map(pickNode),
        edges: a.edges.map(pickEdge),
    }

    const pickedB = {
        nodes: b.nodes.map(pickNode),
        edges: b.edges.map(pickEdge),
    }

    return JSON.stringify(pickedA) === JSON.stringify(pickedB)
}