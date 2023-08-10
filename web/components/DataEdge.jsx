import { ActionIcon, Center } from "@mantine/core"
import { useHover } from "@mantine/hooks"
import { useDeleteElements } from "@web/modules/graph"
import classNames from "classnames"
import { forwardRef } from "react"
import { TbX } from "react-icons/tb"
import { getBezierPath } from "reactflow"


const INTERACTION_PADDING = 20
const FOREIGN_OBJECT_SIZE = 30
const BROKEN_EDGE_LENGTH = 80
const BROKEN_STROKE_DASH_ARRAY = "8 6"


export default function DataEdge({
    id,
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
    style = {},
    markerEnd,
    selected,
    data,
}) {

    return data?.broken ?
        <BrokenEdge
            {...{ id, sourceX, sourceY, targetX, targetY, selected, markerEnd, style }}
            forced={data?.forced}
        /> :
        <UnbrokenEdge
            {...{ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, selected, markerEnd, style }}
            forced={data?.forced}
        />
}


function UnbrokenEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, selected, forced, markerEnd, style }) {

    const { ref: pathRef, hovered: pathHovered } = useHover()
    const { ref: labelRef, hovered: labelHovered } = useHover()
    const hovered = pathHovered || labelHovered

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    })

    const deleteEdge = useDeleteElements([], [id])

    return (
        <g>
            <VisiblePath
                d={edgePath}
                {...{ style, markerEnd, hovered, selected, forced }}
            />
            <InteractionPath d={edgePath} ref={pathRef} />
            <DeleteButton
                x={labelX} y={labelY}
                show={hovered || selected}
                onClick={deleteEdge}
                ref={labelRef}
            />
        </g>
    )
}


function BrokenEdge({ id, sourceX, sourceY, targetX, targetY, selected, forced, markerEnd, style }) {

    const { ref: sourcePathRef, hovered: path1Hovered } = useHover()
    const { ref: targetPathRef, hovered: path2Hovered } = useHover()
    const { ref: sourceLabelRef, hovered: label1Hovered } = useHover()
    const { ref: targetLabelRef, hovered: label2Hovered } = useHover()
    const hovered = path1Hovered || path2Hovered || label1Hovered || label2Hovered

    const deleteEdge = useDeleteElements([], [id])

    const [solidSourcePath, dashedSourcePath, sourceInteractionPath, sourceLabelX, sourceLabelY] = generatePaths(sourceX, sourceY, targetX, targetY, BROKEN_EDGE_LENGTH)
    const [solidTargetPath, dashedTargetPath, targetInteractionPath, targetLabelX, targetLabelY] = generatePaths(targetX, targetY, sourceX, sourceY, BROKEN_EDGE_LENGTH)

    return (
        <g>
            <VisiblePath
                d={solidSourcePath}
                {...{ style, markerEnd, hovered, selected, forced }}
            />
            <VisiblePath
                d={dashedSourcePath}
                style={{
                    ...style,
                    strokeDasharray: BROKEN_STROKE_DASH_ARRAY,
                }}
                {...{ markerEnd, hovered, selected, forced }}
            />
            <InteractionPath
                d={sourceInteractionPath}
                ref={sourcePathRef}
            />
            <DeleteButton
                x={sourceLabelX} y={sourceLabelY}
                show={hovered || selected}
                onClick={deleteEdge}
                ref={sourceLabelRef}
            />


            <VisiblePath
                d={solidTargetPath}
                {...{ style, markerEnd, hovered, selected, forced }}
            />
            <VisiblePath
                d={dashedTargetPath}
                style={{
                    ...style,
                    strokeDasharray: BROKEN_STROKE_DASH_ARRAY,
                }}
                {...{ markerEnd, hovered, selected, forced }}
            />
            <InteractionPath
                d={targetInteractionPath}
                ref={targetPathRef}
            />
            <DeleteButton
                x={targetLabelX} y={targetLabelY}
                show={hovered || selected}
                onClick={deleteEdge}
                ref={targetLabelRef}
            />
        </g>
    )
}


const DeleteButton = forwardRef(({ x, y, show, onClick }, ref) => {

    return (
        <foreignObject
            width={FOREIGN_OBJECT_SIZE}
            height={FOREIGN_OBJECT_SIZE}
            x={x - FOREIGN_OBJECT_SIZE / 2}
            y={y - FOREIGN_OBJECT_SIZE / 2}
            className="pointer-events-none"
            ref={ref}
        >
            <Center className="w-full h-full">
                {show &&
                    <ActionIcon
                        variant="filled" radius="xl" size="sm" color="primary"
                        className="pointer-events-auto"
                        onClick={onClick}
                    >
                        <TbX />
                    </ActionIcon>}
            </Center>
        </foreignObject>
    )
})
DeleteButton.displayName = "DeleteButton"


const VisiblePath = forwardRef(({ d, style, markerEnd, hovered, selected, forced }, ref) => {
    return (
        <path
            d={d}
            markerEnd={markerEnd}
            className={pathClassName(hovered, selected, forced)}
            style={style}
            ref={ref}
        />
    )
})
VisiblePath.displayName = "VisiblePath"


const InteractionPath = forwardRef(({ d }, ref) => {

    return (
        <path
            d={d}
            className={interactionClassName}
            style={{ strokeWidth: INTERACTION_PADDING }}
            ref={ref}
        />
    )
})
InteractionPath.displayName = "InteractionPath"


const pathClassName = (hovered, selected, forced) => classNames(
    {
        "fill-none stroke-gray-300 stroke-[5px]": true,
        "stroke-primary-300": hovered && !selected,
        "stroke-primary-400": selected,
    },
    forced ?
        selected ?
            "stroke-red-500" :
            hovered ?
                "stroke-red-400" :
                "stroke-red-300" :
        undefined
)

const interactionClassName = "stroke-none fill-none"


function generatePaths(x1, y1, x2, y2, distance, proportion = 0.4) {
    // Calculate the direction from A to B
    var dx = x2 - x1
    var dy = y2 - y1

    // Calculate the total distance from A to B
    var length = Math.sqrt(dx * dx + dy * dy)

    // If the total distance is zero, A and B are the same point
    if (length === 0) {
        return null // or handle this case as needed
    }

    // Normalize the direction vector
    dx /= length
    dy /= length

    // Calculate the new end point, distance away from A in the direction of B
    const midX = x1 + distance * dx * proportion
    const midY = y1 + distance * dy * proportion
    const endX = x1 + distance * dx
    const endY = y1 + distance * dy

    return [
        `M ${x1} ${y1} L ${midX} ${midY}`,
        `M ${midX} ${midY} L ${endX} ${endY}`,
        `M ${x1} ${y1} L ${endX} ${endY}`,
        midX, midY,
    ]
}

