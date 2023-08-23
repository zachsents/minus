import { Tooltip, useMantineTheme } from "@mantine/core"
import { useHotkeys, useLocalStorage } from "@mantine/hooks"
import { GRAPH_DELETE_KEYS, LOCAL_STORAGE_KEYS, RF_ELEMENT_ID } from "@web/modules/constants"
import { useGraphSaving, useGraphUndoRedo, useOnConnectCallback, usePaneContextMenu } from "@web/modules/graph"
import { usePasteElementsFromClipboardCallback } from "@web/modules/graph/duplicate"
import { TbArrowBack, TbArrowForward } from "react-icons/tb"
import { Background, ControlButton, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState } from "reactflow"
import "reactflow/dist/style.css"
import { EDGE_TYPE, NODE_TYPE } from "shared"
import ActionNode from "./ActionNode"
import DataEdge from "./DataEdge"
import GhostBuster from "./GhostBuster"
import NodeToolbar from "./NodeToolbar"
import PaneContextMenu from "./context-menu/PaneContextMenu"


/** @type {import("reactflow").Node[]} */
const initialNodes = []
/** @type {import("reactflow").Edge[]} */
const initialEdges = []


export default function GraphEditor() {

    const theme = useMantineTheme()

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    const onConnect = useOnConnectCallback(setEdges)

    const [showMinimap] = useLocalStorage({ key: LOCAL_STORAGE_KEYS.EDITOR_SHOW_MINIMAP })
    const [showGrid] = useLocalStorage({ key: LOCAL_STORAGE_KEYS.EDITOR_SHOW_GRID })

    const [undo, redo] = useGraphUndoRedo(nodes, edges, setNodes, setEdges)

    const pasteHandler = usePasteElementsFromClipboardCallback()

    const [paneContextMenuHandler] = usePaneContextMenu()

    useHotkeys([
        ["ctrl+a", () => {
            setNodes(nodes => nodes.map(node => ({ ...node, selected: true })))
            setEdges(edges => edges.map(edge => ({ ...edge, selected: true })))
        }],
    ])

    useGraphSaving(nodes, edges, setNodes, setEdges)

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
                id={RF_ELEMENT_ID}

                onPaste={pasteHandler}
                onPaneContextMenu={paneContextMenuHandler}
            >
                {showMinimap &&
                    <MiniMap pannable zoomable />}

                {showGrid &&
                    <Background variant="lines" gap={snapGrid[0]} offset={0.4} color={theme.colors.gray[1]} />}

                <Controls showInteractive={false}>
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
                <PaneContextMenu />
            </ReactFlow>
            <GhostBuster />
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
}