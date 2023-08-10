import { useMemo } from "react"
import { useDebouncedNodeProperty, useDefinition, useNodeProperty, useNodePropertyValue, useUpdateNode } from "./nodes"
import { INPUT_MODE, INTERFACE_ID_PREFIX } from "../constants"
import { useCallback } from "react"
import { uniqueId } from "../util"
import _ from "lodash"


export function useNodeInputs(nodeId) {
    const inputsObj = useNodePropertyValue(nodeId, "data.inputs")
    return useMemo(() => Object.values(inputsObj ?? {}), [inputsObj])
}


export function useInputValue(nodeId, inputId, defaultValue) {
    if (inputId == null)
        console.warn("useInputValue called with null inputId")

    return useNodeProperty(nodeId, `data.inputs.${inputId}.value`, defaultValue)
}


export function useDebouncedInputValue(nodeId, inputId, {
    defaultValue,
    debounce,
} = {}) {
    if (inputId == null)
        console.warn("useDebouncedInputValue called with null inputId")

    return useDebouncedNodeProperty(nodeId, `data.inputs.${inputId}.value`, {
        defaultValue,
        debounce,
    })
}


export function useInputValidation(nodeId, inputId) {

    const nodeDefinition = useDefinition(nodeId)

    const input = useNodePropertyValue(nodeId, `data.inputs.${inputId}`)
    const inputs = useNodeInputs(nodeId)

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


export function useDerivedInputs(nodeId, inputId) {

    const nodeDefinition = useDefinition(nodeId)
    const input = useNodePropertyValue(nodeId, `data.inputs.${inputId}`)
    const inputs = useNodeInputs(nodeId)
    const updateNode = useUpdateNode()

    return useCallback(() => {
        const inputDefinition = nodeDefinition?.inputs[input.definition]
        const derivedInputs = inputDefinition?.deriveInputs?.(input)

        if (!derivedInputs?.length)
            return

        const newInputs = derivedInputs.map(derivedInput => {
            const mergeEntries = Object.entries(derivedInput.merge)
            const matchingInput = inputs.find(i => mergeEntries.every(([key, value]) => i[key] == value))

            if (matchingInput)
                return _.merge({}, matchingInput, derivedInput.data ?? {})

            const newInput = {
                id: uniqueId(INTERFACE_ID_PREFIX),
                derived: true,
                mode: inputDefinition?.defaultMode,
                ...derivedInput.merge,
                ...derivedInput.data,
            }

            const newInputDefinition = nodeDefinition?.inputs[newInput.definition]
            if (newInputDefinition?.group) {
                const inputCount = inputs.filter(i => i.definition == newInput.definition).length
                if (inputCount >= newInputDefinition?.groupMax)
                    return
            }

            return newInput
        }).filter(Boolean)

        updateNode(_.mapKeys(newInputs, newInput => `data.inputs.${newInput.id}`))

    }, [input, inputs, nodeDefinition])
}
