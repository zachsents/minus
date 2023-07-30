import { produce } from "immer"
import _ from "lodash"
import WebDefinitions from "nodes/web"
import { useCallback, useMemo } from "react"
import { useNodeId, useReactFlow, useStore, useStoreApi } from "reactflow"


/**
 * @param {string | import("reactflow").Node} nodeOrNodeId
 * @param {import("reactflow").ReactFlowInstance} rf
 */
export function getDefinition(nodeOrNodeId, rf) {
    if (typeof nodeOrNodeId === "string")
        nodeOrNodeId = rf.getNode(nodeOrNodeId)

    return WebDefinitions.asObject[nodeOrNodeId?.data?.definition]
}


/**
 * @param {string | import("reactflow").Node} [nodeOrNodeId]
 */
export function useDefinition(nodeOrNodeId) {
    const rf = useReactFlow()

    if (nodeOrNodeId === undefined)
        nodeOrNodeId = useNodeId()

    return useMemo(() => getDefinition(nodeOrNodeId, rf), [nodeOrNodeId, rf])
}


/**
 * @param {string} nodeId
 * @param {string} path
 * @param {*} value
 * @param {import("reactflow").ReactFlowInstance} rf
 */
export function setNodeProperty(nodeId, path, value, rf) {
    rf.setNodes(produce(draft => {
        const node = draft.find(n => n.id === nodeId)

        if (node === undefined)
            throw new Error(`Node ${nodeId} not found`)

        _.set(node, path, value)
    }))
}


/**
 * @param {string} nodeId
 * @param {string} path
 */
export function useNodeProperty(nodeId, path) {
    if (nodeId === undefined)
        nodeId = useNodeId()

    const rf = useReactFlow()

    const value = useStore(state => _.get(state.nodeInternals.get(nodeId), path))

    const setValue = useCallback(value => setNodeProperty(nodeId, path, value, rf), [nodeId, path, rf])

    return [value, setValue]
}


/**
 * Hook to assign a node ID to a property in ReactFlow's store. 
 * @param {string} property
 */
export function useStoreProperty(property) {
    const storeApi = useStoreApi()
    const value = useStore(s => s[property])
    const setValue = useCallback(value => storeApi.setState({ [property]: value }), [property, storeApi])

    return [value, setValue]
}

