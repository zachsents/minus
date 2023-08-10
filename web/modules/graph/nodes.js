import { useDebouncedValue } from "@mantine/hooks"
import _ from "lodash"
import WebDefinitions from "nodes/web"
import { useEffect, useState } from "react"
import { useNodeId, useReactFlow, useStore, useUpdateNodeInternals } from "reactflow"
import { MODIFIER_ID_PREFIX, NODE_TYPE } from "shared/constants"
import { projectViewportCenterToRF } from "."
import { INPUT_MODE, INTERFACE_ID_PREFIX, NODE_ID_PREFIX } from "../constants"
import { _get, uniqueId } from "../util"
import { useUpdateWorkflowGraph } from "../workflows"
import { useMemo } from "react"
import { useNodeInputs } from "./inputs"
import { useCallback } from "react"


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
 * @param {string} nodeId
 * @param {string} path
 * @return {[ any, (value: any) => void ]}
 */
export function useNodeProperty(nodeId, path, defaultValue) {
    if (nodeId === undefined)
        nodeId = useNodeId()

    const value = useStore(state => _get(state.nodeInternals.get(nodeId), path))

    const [updateGraph] = useUpdateWorkflowGraph()
    const setValue = useCallback(value => updateGraph(`nodes.${nodeId}.${path}`, value), [nodeId, path])

    useEffect(() => {
        if (defaultValue !== undefined && value === undefined)
            setValue(defaultValue)
    }, [setValue])

    return [value, setValue]
}


/**
 * @param {string} nodeId
 * @param {string} path
 */
export function useNodePropertyValue(nodeId, path) {
    if (nodeId === undefined)
        nodeId = useNodeId()

    const value = useStore(state => _get(state.nodeInternals.get(nodeId), path))
    return value
}


export function useUpdateNodeProperty(nodeId, path) {
    if (nodeId === undefined)
        nodeId = useNodeId()

    const [updateGraph] = useUpdateWorkflowGraph()
    const setValue = useCallback(value => updateGraph(`nodes.${nodeId}.${path}`, value), [nodeId, path])

    return setValue
}


export function useUpdateNode(nodeId) {
    if (nodeId === undefined)
        nodeId = useNodeId()

    const [updateGraph] = useUpdateWorkflowGraph()
    const updateNode = useCallback(
        updateObj => updateGraph(_.mapKeys(updateObj, (_, key) => `nodes.${nodeId}.${key}`)),
        [nodeId]
    )

    return updateNode
}


/**
 * @param {string} nodeId
 * @param {string} path
 * @param {object} options
 * @param {any} options.defaultValue
 * @param {number} options.debounce
 * @return {[ any, (value: any) => void ]}
 */
export function useDebouncedNodeProperty(nodeId, path, {
    defaultValue,
    debounce = 500,
} = {}) {
    const [value, setValue] = useNodeProperty(nodeId, path, defaultValue)

    const [tempValue, setTempValue] = useState(value)
    const [debouncedValue] = useDebouncedValue(tempValue, debounce)

    // This might need to be disabled
    useEffect(() => {
        setTempValue(value)
    }, [value])

    useEffect(() => {
        setValue(tempValue)
    }, [debouncedValue])

    return [tempValue, setTempValue]
}


export function useNodeInterfaces(nodeId, dataKey) {
    const interfacesObj = useNodePropertyValue(nodeId, `data.${dataKey}`)
    return useMemo(() => Object.values(interfacesObj ?? {}), [interfacesObj])
}


export function useNodeOutputs(nodeId) {
    const outputsObj = useNodePropertyValue(nodeId, "data.outputs")
    return useMemo(() => Object.values(outputsObj ?? {}), [outputsObj])
}


export function useInterfaceProperty(nodeId, dataKey, interfaceId, path, defaultValue) {
    return useNodeProperty(nodeId, `data.${dataKey}.${interfaceId}.${path}`, defaultValue)
}


export function useCreateEntryInNode(nodeId, path, idPrefix = "") {
    if (nodeId === undefined)
        nodeId = useNodeId()

    const [updateGraph] = useUpdateWorkflowGraph()
    const addEntry = (data = {}) => {
        const entryId = uniqueId(idPrefix)
        const entry = {
            id: entryId,
            ...data,
        }
        updateGraph(`nodes.${nodeId}.${path}.${entryId}`, entry)
        return entry
    }

    return addEntry
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
            inputs: _.keyBy(Object.entries(definition.inputs).flatMap(([id, input]) => {
                if (input.group)
                    return Array(input.groupMin).fill().map(() => createInput(id, input, {
                        name: `New ${input.name}`
                    }))

                return createInput(id, input)
            }), "id"),
            outputs: _.keyBy(Object.entries(definition.outputs).flatMap(([id, output]) => {
                if (output.group)
                    return Array(output.groupMin).fill().map(() => createOutput(id))

                return createOutput(id)
            }), "id"),
        }, data),
    }

    return newNode
}


export function useAddActionNode() {

    const rf = useReactFlow()
    const [updateGraph] = useUpdateWorkflowGraph()

    const addNode = (definitionId, position, data) => {
        const newNode = createActionNode(rf, definitionId, position, data)
        updateGraph(`nodes.${newNode.id}`, newNode)
    }

    return addNode
}


export function useNodeHasValidationErrors(nodeId) {

    const nodeDefinition = useDefinition(nodeId)

    const inputs = useNodeInputs(nodeId)

    const hasErrors = useMemo(() => inputs.map(input => {
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

