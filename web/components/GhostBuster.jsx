import { useDebouncedValue } from "@mantine/hooks"
import { useEffect } from "react"
import { useReactFlow, useStore } from "reactflow"
import { shallow } from "zustand/shallow"


export default function GhostBuster() {

    const rf = useReactFlow()

    const handleMap = useStore(state => Object.fromEntries(
        [...state.nodeInternals.values()].map(node => {
            const handleBounds = node[Symbol.for("internals")].handleBounds

            const getId = handle => handle.id
            return [
                node.id,
                [...(handleBounds?.source?.map(getId) ?? []), ...(handleBounds?.target?.map(getId) ?? [])],
            ]
        })
    ), (a, b) => {
        return shallow(Object.keys(a), Object.keys(b)) &&
            shallow(Object.values(a).flat(), Object.values(b).flat())
    })

    const [debouncedHandleMap] = useDebouncedValue(handleMap, 100)

    useEffect(() => {
        const remove = rf.getEdges().filter(edge => {
            const sourceExists = handleMap[edge.source]?.includes(edge.sourceHandle)
            const targetExists = handleMap[edge.target]?.includes(edge.targetHandle)
            return !(sourceExists && targetExists)
        })
        if (remove.length > 0) {
            console.debug("[GhostBuster] Removing edges:", remove.map(e => e.id).join(", "))
            rf.deleteElements({ edges: remove })
        }
    }, [rf, debouncedHandleMap])
}
