import { useHotkeys } from "@mantine/hooks"
import { useCallback, useEffect, useMemo } from "react"
import { useReactFlow, useViewport } from "reactflow"
import { RF_ELEMENT_ID, RF_STORE_PROPERTIES } from "./constants"
import { useStoreProperty } from "./nodes"
import { graphEquality, useUndoRedo } from "./undo"


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
    const [, setUndo] = useStoreProperty(RF_STORE_PROPERTIES.UNDO)
    const [, setRedo] = useStoreProperty(RF_STORE_PROPERTIES.REDO)

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

    const [, setPaneContextMenuOpened] = useStoreProperty(RF_STORE_PROPERTIES.PANE_CONTEXT_MENU_OPENED)
    const [, setPaneContextMenuPosition] = useStoreProperty(RF_STORE_PROPERTIES.PANE_CONTEXT_MENU_POSITION)

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