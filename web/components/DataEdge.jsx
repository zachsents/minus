import { ActionIcon, Center } from "@mantine/core"
import { useHover } from "@mantine/hooks"
import { useDeleteElements } from "@web/modules/nodes"
import classNames from "classnames"
import { TbX } from "react-icons/tb"
import { getBezierPath } from "reactflow"


const INTERACTION_PADDING = 20
const FOREIGN_OBJECT_SIZE = 30


export default function DataEdge({
    id,
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
    style = {},
    markerEnd,
    selected,
    data,
}) {

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    })

    const { ref: pathRef, hovered: pathHovered } = useHover()
    const { ref: labelRef, hovered: labelHovered } = useHover()
    const hovered = pathHovered || labelHovered

    const deleteEdge = useDeleteElements([], [id])

    return (
        <g>
            <path
                d={edgePath}
                markerEnd={markerEnd}
                className={classNames(
                    {
                        "fill-none stroke-gray-300 stroke-[5px]": true,
                        "stroke-primary-300": hovered && !selected,
                        "stroke-primary-400": selected,
                    },
                    data?.forced ?
                        selected ?
                            "stroke-red-500" :
                            hovered ?
                                "stroke-red-400" :
                                "stroke-red-300" :
                        undefined
                )}
                style={style}
            />
            <path
                d={edgePath}
                className="stroke-none fill-none"
                style={{
                    strokeWidth: INTERACTION_PADDING,
                }}
                ref={pathRef}
            />
            <foreignObject
                width={FOREIGN_OBJECT_SIZE}
                height={FOREIGN_OBJECT_SIZE}
                x={labelX - FOREIGN_OBJECT_SIZE / 2}
                y={labelY - FOREIGN_OBJECT_SIZE / 2}
                className="pointer-events-none"
                ref={labelRef}
            >
                <Center className="w-full h-full">
                    {(hovered || selected) &&
                        <ActionIcon
                            variant="filled" radius="xl" size="sm" color="primary"
                            className="pointer-events-auto"
                            onClick={deleteEdge}
                        >
                            <TbX />
                        </ActionIcon>}
                </Center>
            </foreignObject>
        </g>
    )
}