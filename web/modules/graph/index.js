import { Button, Stack, Text, Tooltip } from "@mantine/core"
import { useDebouncedValue, useHotkeys } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import _ from "lodash"
import { useCallback, useEffect, useMemo, useState } from "react"
import { TbAlertTriangle, TbSwitch3 } from "react-icons/tb"
import { addEdge, useReactFlow, useStore, useStoreApi } from "reactflow"
import { DATA_TYPE_LABELS, typesMatch } from "shared/constants"
import { INTERFACE_ID_PREFIX } from "../constants"
import { useEditorStoreProperty } from "../editor-store"
import { graphEquality, useUndoRedo } from "../undo"
import { useUpdateWorkflowGraph, useWorkflowGraph } from "../workflows"
import { getDefinition } from "./nodes"
import { projectAbsoluteScreenPointToRF } from "./projection"


export function useGraphUndoRedo(nodes, edges, setNodes, setEdges) {

    const graphState = useMemo(() => ({ nodes, edges }), [nodes, edges])

    const setGraphState = useCallback(({ nodes, edges }) => {
        setNodes(nodes)
        setEdges(edges)
    }, [setNodes, setEdges])

    const [, undo, redo] = useUndoRedo(graphState, setGraphState, {
        debounce: 200,
        equality: graphEquality,
    })
    const [, setUndo] = useEditorStoreProperty("undo")
    const [, setRedo] = useEditorStoreProperty("undo")

    useEffect(() => {
        setUndo(undo)
        setRedo(redo)
    }, [undo, redo])

    useHotkeys([
        ["mod+z", undo],
        ["mod+y", redo],
    ])

    return [undo, redo]
}


export function usePaneContextMenu() {
    const rf = useReactFlow()

    const [, setPaneContextMenuOpened] = useEditorStoreProperty("paneContextMenuOpened")
    const [, setPaneContextMenuPosition] = useEditorStoreProperty("paneContextMenuPosition")

    const paneContextMenuHandler = useCallback(ev => {
        ev.preventDefault()

        setPaneContextMenuOpened(true)
        setPaneContextMenuPosition(projectAbsoluteScreenPointToRF(rf, {
            x: ev.clientX,
            y: ev.clientY,
        }))
    }, [setPaneContextMenuPosition, rf])

    return [paneContextMenuHandler]
}


export function useGraphSaving(nodes, edges, setNodes, setEdges) {

    const [remoteGraph, isGraphLoaded] = useWorkflowGraph()
    const [updateGraph] = useUpdateWorkflowGraph()
    const [canSave, setCanSave] = useState(false)

    useEffect(() => {
        if (isGraphLoaded) {
            setCanSave(true)

            const { nodes: newNodes, edges: newEdges } = merge({ nodes, edges }, remoteGraph, ["selected"])

            setNodes(newNodes)
            setEdges(newEdges)
            console.debug("Merged from remote", remoteGraph)
        }
    }, [remoteGraph])

    const convertedGraph = useMemo(() => convertGraphForRemote({ nodes, edges }), [nodes, edges])
    const [debouncedConvertedGraph] = useDebouncedValue(convertedGraph, 500)

    useEffect(() => {
        if (canSave) {
            updateGraph({ nodes, edges })
            console.debug("Updating remote graph")
        }
    }, [debouncedConvertedGraph])
}


export function useOnConnectCallback(setEdges) {

    const rf = useReactFlow()

    return useCallback(params => {
        if (params.source == params.target)
            return

        let sourceType = "any", targetType = "any"

        if (params.sourceHandle.startsWith(INTERFACE_ID_PREFIX)) {
            const sourceNode = rf.getNode(params.source)
            const sourceNodeDef = getDefinition(params.source, rf)
            const sourceInterface = sourceNode?.data?.outputs?.find(o => o.id === params.sourceHandle)
            const sourceInterfaceDef = sourceNodeDef?.outputs?.[sourceInterface.definition]
            sourceType = sourceInterfaceDef?.type
        }

        if (params.targetHandle.startsWith(INTERFACE_ID_PREFIX)) {
            const targetNode = rf.getNode(params.target)
            const targetNodeDef = getDefinition(params.target, rf)
            const targetInterface = targetNode?.data?.inputs?.find(i => i.id === params.targetHandle)
            const targetInterfaceDef = targetNodeDef?.inputs?.[targetInterface.definition]
            targetType = targetInterfaceDef?.type
        }

        console.debug("Tried to connect", sourceType, "with", targetType)

        const connect = (options = {}) => setEdges(edges => addEdge({
            ...params,
            ...options,
        }, edges))

        if (typesMatch(sourceType, targetType))
            return connect()

        const notifId = `type-mismatch-${params.source}-${params.sourceHandle}-${params.target}-${params.targetHandle}`

        notifications.show({
            id: notifId,
            title: "Types don't match.",
            message: <Stack spacing="xs" align="flex-start">
                <Text>A {DATA_TYPE_LABELS[sourceType]} output can&apos;t be connected to a {DATA_TYPE_LABELS[targetType]} input.</Text>

                <Tooltip label="This could prevent your workflow from functioning normally.">
                    <Button
                        onClick={() => {
                            connect({ data: { forced: true } })
                            notifications.hide(notifId)
                        }}
                        variant="subtle" compact color="red" leftIcon={<TbAlertTriangle />}
                    >
                        Connect anyway
                    </Button>
                </Tooltip>
            </Stack>,
            icon: <TbSwitch3 />,
            color: "red",
        })
    }, [setEdges])
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
 * Hook to assign a node ID to a property in ReactFlow's store. 
 * @param {string} property
 */
export function useRFStoreProperty(property) {
    const storeApi = useStoreApi()
    const value = useStore(s => s[property])
    const setValue = useCallback(value => storeApi.setState({ [property]: value }), [property, storeApi])

    return [value, setValue]
}


/**
 * @param {string} graphStr
 */
export function convertGraphFromRemote(graphStr) {
    try {
        const graph = JSON.parse(graphStr)
        return graph
    }
    catch (err) {
        return {
            nodes: [],
            edges: [],
        }
    }
}


/**
 * @param {{ nodes: import("reactflow").Node[], edges: import("reactflow").Edge[] }} graph
 */
export function convertGraphForRemote(graph) {
    return JSON.stringify({
        nodes: graph.nodes.map(n => _.omit(n, ["selected"])),
        edges: graph.edges.map(e => _.omit(e, ["selected"])),
    })
}


function merge(destination, source, keepDestinationProps = []) {

    if (Array.isArray(source)) {
        const usingIds = source.every(el => "id" in el)

        if (usingIds)
            return source.map(sourceItem => merge(destination?.find(destItem => destItem.id === sourceItem.id), sourceItem, keepDestinationProps))

        return source.map((sourceItem, i) => merge(destination?.[i], sourceItem, keepDestinationProps))
    }

    if (typeof source === "object" && source !== null) {
        const result = Object.fromEntries(
            Object.entries(source).map(([key, value]) => [key, merge(destination?.[key], value, keepDestinationProps)])
        )
        keepDestinationProps.forEach(prop => result[prop] = destination?.[prop])
        return result
    }

    return source
}