import { useLocalStorage } from "@mantine/hooks"
import { GRAPH_DELETE_KEYS, LOCAL_STORAGE_KEYS } from "@web/modules/constants"
import { useCallback } from "react"
import { Controls, MiniMap, ReactFlow, addEdge, useEdgesState, useNodesState } from "reactflow"

import "reactflow/dist/style.css"
import ActionNode from "./ActionNode"


const initialNodes = [
    {
        id: '1', type: "node-type:Action", position: { x: 0, y: 0 }, data: {
            definition: "text.Template",
            inputs: [
                { id: "dwkjkdwkd", definition: "template", mode: "config" },
                { id: "sub1", definition: "substitution", name: "Hello", mode: "config" },
                { id: "sub2", definition: "substitution", name: "Poopy", mode: "config" },
            ]
        }
    },
    {
        id: '2', type: "node-type:Action", position: { x: 0, y: 100 }, data: {
            definition: "text.Template"
        }
    },
]


export default function GraphEditor() {

    const [nodes, , onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState([])

    const onConnect = useCallback(params => setEdges(edges => addEdge(params, edges)), [setEdges])

    const [showMinimap] = useLocalStorage({ key: LOCAL_STORAGE_KEYS.EDITOR_SHOW_MINIMAP })

    return (
        <div className="flex-1">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}

                defaultEdgeOptions={defaultEdgeOptions}
                connectOnClick={false}
                snapGrid={snapGrid}

                elevateNodesOnSelect
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

                <Controls />
            </ReactFlow>
        </div>
    )
}

const nodeTypes = {
    "node-type:Action": ActionNode,
}

const snapGrid = [25, 25]

const defaultEdgeOptions = {
    type: "edge-type:Data",
    focusable: false,
}