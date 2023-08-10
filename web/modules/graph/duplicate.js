import { getRectOfNodes, useReactFlow } from "reactflow"
import { uniqueId } from "../util"
import { EDGE_ID_PREFIX, GRAPH_MIME_TYPE, NODE_ID_PREFIX } from "../constants"
import { useCallback } from "react"
import { useUpdateWorkflowGraph } from "../workflows"
import _ from "lodash"
import { useClipboard } from "@mantine/hooks"
import { projectViewportCenterToRF } from "."


/**
 * @typedef {object} DuplicateElementsOptions
 * @property {number} xOffset Overrides the default offset
 * @property {number} yOffset Overrides the default offset
 * @property {number} offset Offset used on both axes if xOffset and yOffset are not specified
 * @property {object} position Overrides offset
 */


/**
 * @param {import("reactflow").ReactFlowInstance} rf
 * @param {import("reactflow").Node[]} nodes
 * @param {import("reactflow").Edge[]} edges
 * @param {DuplicateElementsOptions} options
 */
function createDuplicateElements(nodes, edges, {
    xOffset,
    yOffset,
    offset = 50,
    position,
} = {}) {

    const rect = getRectOfNodes(nodes)
    const positionOffsetX = position ? position.x - rect.x : 0
    const positionOffsetY = position ? position.y - rect.y : 0

    const nodeIdMap = {}
    const newNodes = nodes?.map(n => {
        const newNode = structuredClone(n)
        newNode.id = uniqueId(NODE_ID_PREFIX)
        newNode.position.x += position ? positionOffsetX : (xOffset ?? offset)
        newNode.position.y += position ? positionOffsetY : (yOffset ?? offset)
        nodeIdMap[n.id] = newNode.id
        return newNode
    }) ?? []

    const newEdges = edges?.map(e => {
        const newEdge = structuredClone(e)
        newEdge.id = uniqueId(EDGE_ID_PREFIX)
        newEdge.source = nodeIdMap[e.source]
        newEdge.target = nodeIdMap[e.target]

        if (!newEdge.source || !newEdge.target)
            return

        return newEdge
    }).filter(Boolean) ?? []

    return [newNodes, newEdges]

    // rf.setNodes(produce(draft => {
    //     newNodes.forEach(n => draft.push(n))

    //     if (deselect)
    //         draft.forEach(n => n.selected = newNodeIds.includes(n.id))
    // }))

    // rf.setEdges(produce(draft => {
    //     newEdges.forEach(e => draft.push(e))

    //     if (deselect)
    //         draft.forEach(e => e.selected = newEdgeIds.includes(e.id))
    // }))
}



export function useDuplicateElements() {
    const [updateGraph] = useUpdateWorkflowGraph()

    const duplicateNodes = useCallback((nodes, edges, options) => {
        const [newNodes, newEdges] = createDuplicateElements(nodes, edges, options)

        updateGraph({
            ..._.mapKeys(newNodes, node => `nodes.${node.id}`),
            ..._.mapKeys(newEdges, edge => `edges.${edge.id}`),
            // ...Object.fromEntries(nodes.map(node => [`nodes.${node.id}.selected`, false])),
            // ...Object.fromEntries(edges.map(edge => [`edges.${edge.id}.selected`, false])),
        })
    }, [])

    return duplicateNodes
}


/**
 * @param {import("reactflow").Node[]} nodes
 * @param {import("reactflow").Edge[]} edges
 */
export function useCopyElementsToClipboard(nodes, edges) {
    const rf = useReactFlow()

    const { copy } = useClipboard()

    return useCallback(() => {
        const nodeIds = nodes.map(n => n.id)
        const edgesToCopy = edges.filter(e => nodeIds.includes(e.source) && nodeIds.includes(e.target))

        copy(GRAPH_MIME_TYPE + JSON.stringify({
            nodes,
            edges: edgesToCopy,
        }))
    }, [rf, nodes, edges])
}


export function usePasteElementsFromClipboardCallback() {

    const rf = useReactFlow()
    const duplicate = useDuplicateElements()

    return useCallback(ev => {
        const textContent = ev.clipboardData.getData("text/plain")

        if (!textContent.startsWith(GRAPH_MIME_TYPE))
            return

        const { nodes, edges } = JSON.parse(textContent.replace(GRAPH_MIME_TYPE, ""))

        const center = projectViewportCenterToRF(rf)
        const rect = getRectOfNodes(nodes)

        duplicate(nodes, edges, {
            position: {
                x: center.x - rect.width / 2,
                y: center.y - rect.height / 2,
            },
        })
    }, [])
}