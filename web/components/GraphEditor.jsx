import { useMantineTheme } from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"
import { GRAPH_DELETE_KEYS, LOCAL_STORAGE_KEYS } from "@web/modules/constants"
import { useCallback } from "react"
import { Controls, MiniMap, ReactFlow, addEdge, useEdgesState, useNodesState, Background } from "reactflow"

import "reactflow/dist/style.css"
import { EDGE_TYPE, NODE_TYPE } from "shared/constants"
import ActionNode from "./ActionNode"
import MultiNodeToolbar from "./MultiNodeToolbar"
import DataEdge from "./DataEdge"


const initialNodes = [
    {
        id: '1', type: NODE_TYPE.ACTION, position: { x: 0, y: 0 }, data: {
            definition: "text.Template",
            inputs: [
                { id: "dwkjkdwkd", definition: "template", mode: "config" },
                { id: "sub1", definition: "substitution", name: "Hello", mode: "config" },
                { id: "sub2", definition: "substitution", name: "Poopy", mode: "config" },
            ],
            outputs: [
                { id: "out1", definition: "result" },
            ],
        }
    },
    {
        id: '2', type: NODE_TYPE.ACTION, position: { x: 0, y: 100 }, data: {
            definition: "text.Template"
        }
    },
]


export default function GraphEditor() {

    const theme = useMantineTheme()

    const [nodes, , onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState([])

    const onConnect = useCallback(params => setEdges(edges => addEdge(params, edges)), [setEdges])

    const [showMinimap] = useLocalStorage({ key: LOCAL_STORAGE_KEYS.EDITOR_SHOW_MINIMAP })
    const [showGrid] = useLocalStorage({ key: LOCAL_STORAGE_KEYS.EDITOR_SHOW_GRID })

    return (
        <div className="flex-1">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}

                defaultEdgeOptions={defaultEdgeOptions}
                connectOnClick={false}
                snapGrid={snapGrid}
                snapToGrid={showGrid}

                elevateNodesOnSelect
                elevateEdgesOnSelect
                nodesFocusable={false}
                edgesFocusable={false}
                // This switches whether onMouseDown or onClick is used
                selectNodesOnDrag={false}
                selectionKeyCode={"Control"}
                multiSelectionKeyCode={"Shift"}
                zoomActivationKeyCode={null}
                deleteKeyCode={GRAPH_DELETE_KEYS}
                id="reactflow"
            >
                {showMinimap &&
                    <MiniMap pannable zoomable />}

                {showGrid &&
                    <Background variant="lines" gap={snapGrid[0]} offset={0.4} color={theme.colors.gray[1]} />}

                <Controls />
                <MultiNodeToolbar />
            </ReactFlow>
        </div>
    )
}

const nodeTypes = {
    [NODE_TYPE.ACTION]: ActionNode,
}

const edgeTypes = {
    [EDGE_TYPE.DATA]: DataEdge,
}

const snapGrid = [25, 25]

const defaultEdgeOptions = {
    type: [EDGE_TYPE.DATA],
    markerEnd: "arrow",
}