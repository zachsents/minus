import { useClipboard } from "@mantine/hooks"
import { produce } from "immer"
import _ from "lodash"
import WebDefinitions from "nodes/web"
import { useCallback, useEffect, useMemo, useState } from "react"
import { getRectOfNodes, useNodeId, useOnSelectionChange, useReactFlow, useStore, useStoreApi, useUpdateNodeInternals, useViewport } from "reactflow"
import { NODE_TYPE } from "shared/constants"
import { shallow } from "zustand/shallow"
import { GRAPH_MIME_TYPE, INPUT_MODE } from "./constants"
import { _get, _set, uniqueId } from "./util"


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

        _set(node, path, value)
    }))
}


export function useNode(nodeId) {
    if (nodeId === undefined)
        nodeId = useNodeId()

    return useStore(state => state.nodeInternals.get(nodeId))
}


/**
 * @param {string} nodeId
 * @param {string} path
 * @return {[ any, (value: any) => void ]}
 */
export function useNodeProperty(nodeId, path, defaultValue) {
    if (nodeId === undefined)
        nodeId = useNodeId()

    const rf = useReactFlow()

    const value = useStore(state => _get(state.nodeInternals.get(nodeId), path))

    const setValue = useCallback(value => setNodeProperty(nodeId, path, value, rf), [nodeId, path, rf])

    useEffect(() => {
        if (defaultValue !== undefined && value === undefined)
            setValue(defaultValue)
    }, [setValue])

    return [value, setValue]
}


export function useInterfaceProperty(nodeId, dataKey, interfaceId, path, defaultValue) {
    return useNodeProperty(nodeId, `data.${dataKey}.id=${interfaceId}.${path}`, defaultValue)
}


export function useInputProperty(nodeId, inputId, path, defaultValue) {
    return useInterfaceProperty(nodeId, "inputs", inputId, path, defaultValue)
}

export function useOutputProperty(nodeId, outputId, path, defaultValue) {
    return useInterfaceProperty(nodeId, "outputs", outputId, path, defaultValue)
}


export function useInputValue(nodeId, inputId) {
    if (inputId == null)
        console.warn("useInputValue called with null inputId")

    return useNodeProperty(nodeId, `data.inputs.id=${inputId}.value`)
}


export function useInputValidation(nodeId, inputId) {

    const nodeDefinition = useDefinition(nodeId)

    const [input] = useNodeProperty(nodeId, `data.inputs.id=${inputId}`)
    const [inputs] = useNodeProperty(nodeId, `data.inputs`)

    const error = useMemo(() => {
        const inputDefinition = nodeDefinition?.inputs[input.definition]

        const inputValidation = inputDefinition?.validateInput?.(input, inputs)
        if (inputValidation)
            return inputValidation

        if (input.mode != INPUT_MODE.CONFIGURATION)
            return false

        const configValidation = inputDefinition?.validateConfiguration?.(input.value)
        if (configValidation)
            return configValidation
    }, [input, inputs, nodeDefinition])

    return error
}


export function useNodeHasValidationErrors(nodeId) {

    const nodeDefinition = useDefinition(nodeId)

    const [inputs] = useNodeProperty(nodeId, `data.inputs`)

    const hasErrors = useMemo(() => inputs?.map(input => {
        const inputDefinition = nodeDefinition?.inputs[input.definition]

        const inputValidation = inputDefinition?.validateInput?.(input, inputs)
        if (inputValidation)
            return inputValidation

        if (input.mode != INPUT_MODE.CONFIGURATION)
            return false

        const configValidation = inputDefinition?.validateConfiguration?.(input.value)
        if (configValidation)
            return configValidation
    }).some(Boolean), [inputs, nodeDefinition])

    return hasErrors
}


export function useDerivedInputs(nodeId, inputId) {

    const nodeDefinition = useDefinition(nodeId)
    const [input] = useNodeProperty(nodeId, `data.inputs.id=${inputId}`)
    const [inputs, setInputs] = useNodeProperty(nodeId, `data.inputs`)

    return useCallback(() => {
        const inputDefinition = nodeDefinition?.inputs[input.definition]
        const derivedInputs = inputDefinition?.deriveInputs?.(input)

        if (!derivedInputs?.length)
            return

        setInputs(produce(inputs, draft => {

            derivedInputs.forEach(derivedInput => {
                const mergeEntries = Object.entries(derivedInput.merge)
                const matchingInput = draft.find(i => mergeEntries.every(([key, value]) => i[key] == value))

                if (matchingInput)
                    return _.merge(matchingInput, derivedInput.data ?? {})

                const newInput = {
                    id: uniqueId(),
                    derived: true,
                    mode: inputDefinition?.defaultMode,
                    ...derivedInput.merge,
                    ...derivedInput.data,
                }

                const newInputDefinition = nodeDefinition?.inputs[newInput.definition]
                if (newInputDefinition?.group) {
                    const inputCount = draft.filter(i => i.definition == newInput.definition).length
                    if (inputCount >= newInputDefinition?.groupMax)
                        return
                }

                draft.push(newInput)
            })
        }))
    }, [input, inputs, nodeDefinition, setInputs])
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


export function projectViewportCenter(rf) {
    const rfPane = global.document.getElementById("reactflow")

    return rf.project({
        x: rfPane.offsetWidth / 2,
        y: rfPane.offsetHeight / 2,
    })
}


/**
 * @param {import("reactflow").ReactFlowInstance} rf
 * @param {string} definitionId
 * @param {object} position
 * @param {number} position.x
 * @param {number} position.y
 * @param {object} data
 */
export function createActionNode(rf, definitionId, { x, y } = {}, data = {}) {

    if (x == null || y == null) {
        const center = projectViewportCenter(rf)
        x ??= center.x
        y ??= center.y
    }

    const newNode = {
        id: uniqueId(),
        type: NODE_TYPE.ACTION,
        position: { x, y },
        data: {
            definition: definitionId,
            ...data,
        },
    }

    rf?.setNodes(nodes => [...nodes, newNode])

    return newNode
}

/**
 * @param {string} definitionId
 * @param {object} position
 * @param {number} position.x
 * @param {number} position.y
 * @param {object} data
 */
export function useCreateActionNode(definitionId, { x, y } = {}, data = {}) {
    const rf = useReactFlow()

    return useCallback(
        () => createActionNode(rf, definitionId, { x, y }, data),
        [rf, definitionId, x, y, data]
    )
}


/**
 * @param {string} nodeId
 */
export function useDeleteNode(nodeId) {
    const rf = useReactFlow()

    if (nodeId === undefined)
        nodeId = useNodeId()

    return useCallback(() => rf.deleteElements({ nodes: [rf.getNode(nodeId)] }), [nodeId, rf])
}


/**
 * @param {import("reactflow").Node[] | string[]} nodes
 * @param {import("reactflow").Edge[] | string[]} edges
 */
export function useDeleteElements(nodes, edges) {
    const rf = useReactFlow()

    const nodeObjects = nodes?.every(n => typeof n === "string") ?
        nodes?.map(n => rf.getNode(n)) :
        nodes
    const edgeObjects = edges?.every(e => typeof e === "string") ?
        edges?.map(e => rf.getEdge(e)) :
        edges

    return useCallback(() => rf.deleteElements({
        nodes: nodeObjects,
        edges: edgeObjects,
    }), [nodes, edges, rf])
}

/**
 * @typedef {object} DuplicateElementsOptions
 * @property {number} xOffset Overrides the default offset
 * @property {number} yOffset Overrides the default offset
 * @property {number} offset Offset used on both axes if xOffset and yOffset are not specified
 * @property {object} position Overrides offset
 * @property {boolean} deselect Deselects the original elements
 */


/**
 * @param {import("reactflow").ReactFlowInstance} rf
 * @param {import("reactflow").Node[]} nodes
 * @param {import("reactflow").Edge[]} edges
 * @param {DuplicateElementsOptions} options
 */
function duplicateElements(rf, nodes, edges, {
    xOffset,
    yOffset,
    offset = 50,
    position,
    deselect = true,
} = {}) {

    const rect = getRectOfNodes(nodes)
    const positionOffsetX = position ? position.x - rect.x : 0
    const positionOffsetY = position ? position.y - rect.y : 0

    const nodeIdMap = {}
    const newNodes = nodes?.map(n => {
        const newNode = structuredClone(n)
        newNode.id = uniqueId()
        newNode.position.x += position ? positionOffsetX : (xOffset ?? offset)
        newNode.position.y += position ? positionOffsetY : (yOffset ?? offset)
        nodeIdMap[n.id] = newNode.id
        return newNode
    }) ?? []

    const newEdges = edges?.map(e => {
        const newEdge = structuredClone(e)
        newEdge.id = uniqueId()
        newEdge.source = nodeIdMap[e.source]
        newEdge.target = nodeIdMap[e.target]

        if (!newEdge.source || !newEdge.target)
            return

        return newEdge
    }).filter(Boolean) ?? []

    const newNodeIds = newNodes.map(n => n.id)
    const newEdgeIds = newEdges.map(e => e.id)

    rf.setNodes(produce(draft => {
        newNodes.forEach(n => draft.push(n))

        if (deselect)
            draft.forEach(n => n.selected = newNodeIds.includes(n.id))
    }))

    rf.setEdges(produce(draft => {
        newEdges.forEach(e => draft.push(e))

        if (deselect)
            draft.forEach(e => e.selected = newEdgeIds.includes(e.id))
    }))
}


/**
 * @param {string} nodeId
 * @param {DuplicateElementsOptions} options
 */
export function useDuplicateNode(nodeId, options) {
    const rf = useReactFlow()
    const node = useNode(nodeId)

    return useCallback(() => duplicateElements(rf, [node], [], options), [rf, node])
}


/**
 * @param {import("reactflow").Node[]} nodes
 * @param {import("reactflow").Edge[]} edges
 * @param {DuplicateElementsOptions} options
 */
export function useDuplicateElements(nodes, edges, options) {
    const rf = useReactFlow()

    return useCallback(() => duplicateElements(rf, nodes, edges, options), [rf, nodes, edges])
}


/**
 * @param {string} nodeId
 */
export function useIsOnlyNodeSelected(nodeId) {

    if (nodeId === undefined)
        nodeId = useNodeId()

    return useStore(state => {
        if (state.edges.some(e => e.selected))
            return false

        const selected = [...state.nodeInternals.values()].filter(n => n.selected)
        return selected.length === 1 && selected[0].id === nodeId
    })
}


export function useSelection() {

    const [selectedNodes, setSelectedNodes] = useState([])
    const [selectedEdges, setSelectedEdges] = useState([])

    useOnSelectionChange({
        onChange: ({ nodes, edges }) => {
            setSelectedNodes(nodes)
            setSelectedEdges(edges)
        }
    })

    const selected = useMemo(() => [...selectedNodes, ...selectedEdges], [selectedNodes, selectedEdges])

    return {
        selectedNodes,
        selectedEdges,
        selected,
    }
}

export function useSelectionRect() {

    const selectedNodes = useStore(state => [...state.nodeInternals.values()].filter(n => n.selected), shallow)
    const rect = useMemo(() => getRectOfNodes(selectedNodes), [selectedNodes])

    const viewport = useViewport()

    const screenRect = useMemo(() => ({
        x: rect.x * viewport.zoom + viewport.x,
        y: rect.y * viewport.zoom + viewport.y,
        width: rect.width * viewport.zoom,
        height: rect.height * viewport.zoom,
    }), [rect, viewport])

    return {
        viewport: rect,
        screen: screenRect,
    }
}


export function useUpdateInternals(nodeId) {
    if (nodeId === undefined)
        nodeId = useNodeId()

    const update = useUpdateNodeInternals()

    return useCallback(() => update(nodeId), [nodeId, update])
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

    return useCallback(ev => {
        const textContent = ev.clipboardData.getData("text/plain")

        if (!textContent.startsWith(GRAPH_MIME_TYPE))
            return

        const { nodes, edges } = JSON.parse(textContent.replace(GRAPH_MIME_TYPE, ""))

        const center = projectViewportCenter(rf)
        const rect = getRectOfNodes(nodes)

        duplicateElements(rf, nodes, edges, {
            position: {
                x: center.x - rect.width / 2,
                y: center.y - rect.height / 2,
            },
        })
    }, [])
}


export function useCopyNodeToClipboard(nodeId) {
    const node = useNode(nodeId)
    return useCopyElementsToClipboard([node], [])
}
