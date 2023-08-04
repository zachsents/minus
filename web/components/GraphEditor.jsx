import { Tooltip, useMantineTheme } from "@mantine/core"
import { useHotkeys, useLocalStorage } from "@mantine/hooks"
import { GRAPH_DELETE_KEYS, LOCAL_STORAGE_KEYS } from "@web/modules/constants"
import { useCallback } from "react"
import { Background, ControlButton, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState } from "reactflow"

import { useOnConnectCallback, usePasteElementsFromClipboardCallback } from "@web/modules/nodes"
import { graphEquality, useUndoRedo } from "@web/modules/undo"
import { useMemo } from "react"
import { TbArrowBack, TbArrowForward } from "react-icons/tb"
import "reactflow/dist/style.css"
import { EDGE_TYPE, NODE_TYPE } from "shared/constants"
import ActionNode from "./ActionNode"
import DataEdge from "./DataEdge"
import NodeToolbar from "./NodeToolbar"


const initialNodes = [
    {
        id: '1', type: NODE_TYPE.ACTION, position: { x: 0, y: 0 }, data: {
            definition: "text.Template",
            inputs: [
                { id: "dwkjkdwkd", definition: "template", mode: "handle" },
                { id: "sub1", definition: "substitution", name: "Hello", mode: "handle" },
                { id: "sub2", definition: "substitution", name: "Poopy", mode: "config" },
            ],
            outputs: [
                { id: "out1", definition: "result" },
            ],
        }
    },
]


export default function GraphEditor() {

    const theme = useMantineTheme()

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState([])

    const onConnect = useOnConnectCallback(setEdges)

    const [showMinimap] = useLocalStorage({ key: LOCAL_STORAGE_KEYS.EDITOR_SHOW_MINIMAP })
    const [showGrid] = useLocalStorage({ key: LOCAL_STORAGE_KEYS.EDITOR_SHOW_GRID })

    const graphState = useMemo(() => ({ nodes, edges }), [nodes, edges])
    const setGraphState = useCallback(({ nodes, edges }) => {
        setNodes(nodes)
        setEdges(edges)
    }, [setNodes, setEdges])
    const [, undo, redo] = useUndoRedo(graphState, setGraphState, {
        debounce: 200,
        equality: graphEquality,
    })

    useHotkeys([
        ["mod+z", undo],
        ["mod+y", redo],
    ])

    const pasteHandler = usePasteElementsFromClipboardCallback()

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

                onPaste={pasteHandler}
            >
                {showMinimap &&
                    <MiniMap pannable zoomable />}

                {showGrid &&
                    <Background variant="lines" gap={snapGrid[0]} offset={0.4} color={theme.colors.gray[1]} />}

                <Controls>
                    <Tooltip label="Undo (Ctrl + Z)" position="right">
                        <div>
                            <ControlButton onClick={undo} title="Undo">
                                <TbArrowBack />
                            </ControlButton>
                        </div>
                    </Tooltip>
                    <Tooltip label="Redo (Ctrl + Y)" position="right">
                        <div>
                            <ControlButton onClick={redo}>
                                <TbArrowForward />
                            </ControlButton>
                        </div>
                    </Tooltip>
                </Controls>

                <NodeToolbar />
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
    type: EDGE_TYPE.DATA,
    // markerEnd: "arrow",
}