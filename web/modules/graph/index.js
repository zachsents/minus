import { Button, Stack, Text, Tooltip } from "@mantine/core"
import { useHotkeys } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import { deleteField } from "firebase/firestore"
import { useCallback, useEffect, useMemo } from "react"
import { TbAlertTriangle, TbSwitch3 } from "react-icons/tb"
import { useReactFlow, useStore, useStoreApi, useViewport } from "reactflow"
import { DATA_TYPE_LABELS, typesMatch } from "shared/constants"
import { EDGE_ID_PREFIX, INTERFACE_ID_PREFIX, RF_ELEMENT_ID } from "../constants"
import { useEditorStoreProperty } from "../editor-store"
import { graphEquality, useUndoRedo } from "../undo"
import { uniqueId } from "../util"
import { useUpdateWorkflowGraph, useWorkflowGraph } from "../workflows"
import { getDefinition } from "./nodes"


/**
 * @param {import("reactflow").Node[] | string[]} nodes
 * @param {import("reactflow").Edge[] | string[]} edges
 */
export function useDeleteElements(hookNodes, hookEdges) {
    const rf = useReactFlow()
    const [updateGraph] = useUpdateWorkflowGraph()

    const deleteElements = useCallback((funcNodes, funcEdges) => {
        const nodes = funcNodes ?? hookNodes
        const edges = funcEdges ?? hookEdges

        const nodeIds = nodes?.map(node => typeof node === "string" ? node : node.id) ?? []
        const edgeIdSet = new Set(edges?.map(edge => typeof edge === "string" ? edge : edge.id))

        rf.getEdges().forEach(edge => {
            if (nodeIds.includes(edge.source) || nodeIds.includes(edge.target))
                edgeIdSet.add(edge.id)
        })

        const updateObj = Object.fromEntries([
            ...nodeIds.map(nodeId => [`nodes.${nodeId}`, deleteField()]),
            ...Array.from(edgeIdSet).map(edgeId => [`edges.${edgeId}`, deleteField()]),
        ])

        updateGraph(updateObj)
    }, [hookNodes, hookEdges, rf])

    return deleteElements
}


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

    const [remoteGraph, isRemoteGraphLoaded] = useWorkflowGraph()

    useEffect(() => {
        if (isRemoteGraphLoaded) {

            // const newNodes = mergeElements(nodes, remoteGraph.nodes)
            // const newEdges = mergeElements(edges, remoteGraph.edges)

            setNodes(remoteGraph.nodes)
            setEdges(remoteGraph.edges)
            console.debug("Merged from remote", remoteGraph)
        }
    }, [remoteGraph, isRemoteGraphLoaded])
}


/**
 * @param {object} graph
 * @param {Object.<string, import("reactflow").Node>} graph.nodes
 * @param {Object.<string, import("reactflow").Edge>} graph.edges
 */
export function convertGraphFromRemote(graph) {

    const result = structuredClone(graph)

    if (result?.nodes) {
        result.nodes = Object.values(result.nodes)
        result.nodes.forEach(node => delete node.selected)
    }
    if (result?.edges) {
        result.edges = Object.values(result.edges)
        result.edges.forEach(edge => delete edge.selected)
    }

    return result
}


export function useOnConnectCallback() {

    const rf = useReactFlow()
    const [updateGraph] = useUpdateWorkflowGraph()

    return useCallback(params => {
        if (params.source == params.target)
            return

        let sourceType = "any", targetType = "any"

        if (params.sourceHandle.startsWith(INTERFACE_ID_PREFIX)) {
            const sourceNode = rf.getNode(params.source)
            const sourceNodeDef = getDefinition(params.source, rf)
            const sourceInterface = Object.values(sourceNode?.data?.outputs ?? {}).find(o => o.id === params.sourceHandle)
            const sourceInterfaceDef = sourceNodeDef?.outputs?.[sourceInterface.definition]
            sourceType = sourceInterfaceDef?.type
        }

        if (params.targetHandle.startsWith(INTERFACE_ID_PREFIX)) {
            const targetNode = rf.getNode(params.target)
            const targetNodeDef = getDefinition(params.target, rf)
            const targetInterface = Object.values(targetNode?.data?.inputs ?? {}).find(i => i.id === params.targetHandle)
            const targetInterfaceDef = targetNodeDef?.inputs?.[targetInterface.definition]
            targetType = targetInterfaceDef?.type
        }

        console.debug("Tried to connect", sourceType, "with", targetType)

        const connect = (options = {}) => {
            const id = uniqueId(EDGE_ID_PREFIX)
            updateGraph(`edges.${id}`, {
                ...params,
                ...options,
                id,
            })
        }

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
    }, [])
}


export function useOnNodesDragCallback() {
    const [updateGraph] = useUpdateWorkflowGraph()

    return useCallback((event, node, nodes) => {
        updateGraph(
            Object.fromEntries(nodes.map(node => [`nodes.${node.id}.position`, node.position]))
        )
    }, [])
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
 * @param {import("reactflow").Viewport} viewport
 * @param {object} rect
 * @param {number} rect.x
 * @param {number} rect.y
 * @param {number} [rect.width]
 * @param {number} [rect.height]
 */
export function projectRFToScreen(viewport, { x, y, width, height } = {}) {

    const result = {}

    if (x !== undefined)
        result.x = x * viewport.zoom + viewport.x

    if (y !== undefined)
        result.y = y * viewport.zoom + viewport.y

    if (width !== undefined)
        result.width = width * viewport.zoom

    if (height !== undefined)
        result.height = height * viewport.zoom

    return result
}


export function useProjectRFToScreen(rect) {
    const viewport = useViewport()
    return useMemo(() => rect && projectRFToScreen(viewport, rect), [viewport, rect])
}


export function projectViewportCenterToRF(rf) {
    const rfPane = global.document.getElementById(RF_ELEMENT_ID)

    return rf.project({
        x: rfPane.offsetWidth / 2,
        y: rfPane.offsetHeight / 2,
    })
}


export function projectAbsoluteScreenPointToRF(rf, { x, y }) {
    const rfPane = global.document.getElementById(RF_ELEMENT_ID)

    return rf.project({
        x: x - rfPane.offsetLeft,
        y: y - rfPane.offsetTop,
    })
}