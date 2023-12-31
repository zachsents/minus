import { produce } from "immer"
import _ from "lodash"
import WebDefinitions from "nodes/web"
import { useCallback, useEffect, useMemo } from "react"
import { useNodeId, useReactFlow, useStore, useUpdateNodeInternals } from "reactflow"
import { MODIFIER_ID_PREFIX, NODE_TYPE } from "shared"
import { INPUT_MODE, INTERFACE_ID_PREFIX, NODE_ID_PREFIX } from "../constants"
import { _get, _set, uniqueId } from "../util"
import { useNodeInputs } from "./interfaces"
import { projectViewportCenterToRF } from "./projection"


/**
 * @param {string | import("reactflow").Node} nodeOrNodeId
 * @param {import("reactflow").ReactFlowInstance} rf
 */
export function getDefinition(nodeOrNodeId, rf) {
    if (typeof nodeOrNodeId === "string")
        nodeOrNodeId = rf.getNode(nodeOrNodeId)

    return WebDefinitions.get(nodeOrNodeId?.data?.definition)
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
 * Sets a property of a node using a path.
 * @param {import("reactflow").ReactFlowInstance} rf
 * @param {string} nodeId
 * @param {string} path
 * @param {*} value
 */
export function setNodeProperty(rf, nodeId, path, value) {
    rf.setNodes(produce(draft => {
        const node = draft.find(n => n.id === nodeId)

        if (node === undefined)
            throw new Error(`Node ${nodeId} not found`)

        _set(node, path, value)
    }))
}


/**
 * Hook that provides the value of a node property.
 * @param {string} nodeId
 * @param {string} path
 */
export function useNodePropertyValue(nodeId, path) {
    if (nodeId === undefined)
        nodeId = useNodeId()

    return useStore(state => _get(state.nodeInternals.get(nodeId), path))
}


/**
 * Hook that provides a setter for a node property.
 * @param {string} nodeId
 * @param {string} path
 * @return {(value: any) => void} 
 */
export function useSetNodeProperty(nodeId, path) {
    if (nodeId === undefined)
        nodeId = useNodeId()

    const rf = useReactFlow()

    return useCallback(value => setNodeProperty(rf, nodeId, path, value), [nodeId, path, rf])
}


/**
 * Hook that provides the value of a node property and a setter.
 * @param {string} nodeId
 * @param {string} path
 * @param {*} [defaultValue]
 * @return {[ any, (value: any) => void ]}
 */
export function useNodeProperty(nodeId, path, defaultValue) {
    if (nodeId === undefined)
        nodeId = useNodeId()

    const value = useNodePropertyValue(nodeId, path)
    const setValue = useSetNodeProperty(nodeId, path)

    useEffect(() => {
        if (defaultValue !== undefined && value === undefined)
            setValue(defaultValue)
    }, [setValue])

    return [value, setValue]
}


export function useNodeHasValidationErrors(nodeId) {

    const nodeDefinition = useDefinition(nodeId)

    const inputs = useNodeInputs(nodeId)

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
        const center = projectViewportCenterToRF(rf)
        x ??= center.x
        y ??= center.y
    }

    const definition = WebDefinitions.get(definitionId)

    const createInput = (defId, def, extra = {}) => ({
        id: uniqueId(INTERFACE_ID_PREFIX),
        definition: defId,
        mode: def.defaultMode,
        ...extra,
    })

    const createOutput = (defId) => ({
        id: uniqueId(INTERFACE_ID_PREFIX),
        definition: defId,
    })

    const newNode = {
        id: uniqueId(NODE_ID_PREFIX),
        type: NODE_TYPE.ACTION,
        position: { x, y },
        data: _.merge({
            definition: definitionId,
            inputs: Object.entries(definition.inputs).flatMap(([id, input]) => {
                if (input.group)
                    return Array(input.groupMin).fill().map(() => createInput(id, input, {
                        name: `New ${input.name}`
                    }))

                return createInput(id, input)
            }),
            outputs: Object.entries(definition.outputs).flatMap(([id, output]) => {
                if (output.group)
                    return Array(output.groupMin).fill().map(() => createOutput(id))

                return createOutput(id)
            }),
        }, data),
    }

    rf?.setNodes(nodes => [...nodes, newNode])

    return newNode
}


export function useUpdateInternals(nodeId) {
    if (nodeId === undefined)
        nodeId = useNodeId()

    const update = useUpdateNodeInternals()

    return useCallback(() => update(nodeId), [nodeId, update])
}


export function useModifier(nodeId) {
    const [modifier, setModifier] = useNodeProperty(nodeId, "data.modifier")

    const setNewModifier = useCallback((modifierType, data = {}) => setModifier({
        id: uniqueId(MODIFIER_ID_PREFIX),
        type: modifierType,
        ...data,
    }), [setModifier])

    const clearModifier = useCallback(() => setModifier(null), [setModifier])

    return [modifier, setNewModifier, clearModifier]
}


export function useDisabled(nodeId) {
    if (nodeId === undefined)
        nodeId = useNodeId()

    const [disabled, setDisabled] = useNodeProperty(nodeId, "data.disabled", false)

    const findUpstreamDisabled = (state, nodeId) => {
        const incomingNodeIds = state.edges
            .filter(e => e.target === nodeId)
            .map(e => e.source)

        const upstreamDisabled = incomingNodeIds.some(id => state.nodeInternals.get(id)?.data?.disabled)
        if (upstreamDisabled)
            return true

        return incomingNodeIds.some(id => findUpstreamDisabled(state, id))
    }

    const isUpstreamDisabled = useStore(state => findUpstreamDisabled(state, nodeId))

    const message = disabled ?
        "This node is disabled." :
        isUpstreamDisabled ?
            "This node is disabled because one of its upstream nodes is disabled." :
            null

    return [disabled, isUpstreamDisabled, setDisabled, message]
}

