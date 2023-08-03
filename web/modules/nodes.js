import { produce } from "immer"
import _ from "lodash"
import WebDefinitions from "nodes/web"
import { useCallback, useEffect, useMemo } from "react"
import { useNodeId, useReactFlow, useStore, useStoreApi } from "reactflow"
import { INPUT_MODE } from "./constants"
import { _get, _set, uniqueId } from "./util"
import { NODE_TYPE } from "shared/constants"


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


/**
 * @param {import("reactflow").ReactFlowInstance} rf
 * @param {string} definitionId
 * @param {object} position
 * @param {number} position.x
 * @param {number} position.y
 * @param {object} data
 */
export function createActionNode(rf, definitionId, { x = 0, y = 0 } = {}, data = {}) {
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
export function useCreateActionNode(definitionId, { x = 0, y = 0 } = {}, data = {}) {
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

    return useCallback(
        () => rf.setNodes(nodes => nodes.filter(n => n.id !== nodeId)),
        [nodeId, rf]
    )
}


/**
 * @param {string} nodeId
 * @param {object} offset
 * @param {number} offset.x
 * @param {number} offset.y
 */
export function useDuplicateNode(nodeId, { x: xOffset = 50, y: yOffset = 50 } = {}) {
    const rf = useReactFlow()

    if (nodeId === undefined)
        nodeId = useNodeId()

    return useCallback(() => {
        const node = rf.getNode(nodeId)

        if (!node)
            return console.warn(`Node ${nodeId} not found`)

        const newNode = structuredClone(node)
        newNode.id = uniqueId()
        newNode.position.x += xOffset
        newNode.position.y += yOffset

        rf.setNodes(produce(draft => {
            draft.push(newNode)
            draft.find(n => n.id === nodeId).selected = false
        }))

        return newNode
    }, [rf, nodeId])
}