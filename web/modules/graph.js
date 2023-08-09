import { useDebouncedValue, useHotkeys } from "@mantine/hooks"
import _ from "lodash"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useReactFlow, useViewport } from "reactflow"
import { RF_ELEMENT_ID } from "./constants"
import { useEditorStoreProperty } from "./editor-store"
import { graphEquality, useUndoRedo } from "./undo"
import { useWorkflowGraph } from "./workflows"


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
    const [canSave, setCanSave] = useState(false)

    const [graphString, updateGraphString] = useWorkflowGraph()

    useEffect(() => {
        if (graphString) {
            setCanSave(true)

            const remoteGraph = deserializeGraph(graphString)

            const newNodes = mergeElements(nodes, remoteGraph.nodes)
            const newEdges = mergeElements(edges, remoteGraph.edges)

            setNodes(newNodes)
            setEdges(newEdges)
            console.debug("Merged from remote")
        }
    }, [graphString])

    const serializedGraph = useMemo(() => serializeGraph(nodes, edges), [nodes, edges])
    const [debouncedGraphString] = useDebouncedValue(serializedGraph, 500)
    useEffect(() => {
        if (canSave) {
            updateGraphString(serializedGraph)
            console.debug("Updating remote graph")
        }
    }, [debouncedGraphString])
}


export function serializeGraph(nodes, edges) {
    return JSON.stringify({
        nodes: nodes.map(n => _.omit(n, ["selected"])),
        edges: edges.map(e => _.omit(e, ["selected"])),
    })
}

export function deserializeGraph(graphString) {
    return JSON.parse(graphString)
}

/**
 * @param {Array<{ id: string }>} destination
 * @param {Array<{ id: string }} source
 */
function mergeElements(destination, source) {
    const ids = [...new Set(source.map(el => el.id))]
    return ids.map(id => _.merge({}, destination.find(el => el.id === id), source.find(el => el.id === id)))
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