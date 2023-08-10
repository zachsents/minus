import { useMemo } from "react"
import { useViewport } from "reactflow"
import { RF_ELEMENT_ID } from "../constants"


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