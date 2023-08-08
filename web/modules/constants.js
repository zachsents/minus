import { TbActivity, TbArrowsSplit2 } from "react-icons/tb"
import { CONTROL_MODIFIER } from "shared/constants"

export const LOCAL_STORAGE_KEYS = {
    EDITOR_ACTIVITY_TAB: "editorActivityTab",
    EDITOR_FOLLOW_MOUSE: "editorFollowMouse",
    EDITOR_AUTO_LAYOUT: "editorAutoLayout",
    EDITOR_SHOW_GRID: "editorShowGrid",
    EDITOR_SHOW_MINIMAP: "editorShowMinimap",
    PINNED_NODES: "pinnedNodes",
}

export const HANDLE_TYPE = {
    INPUT: "target",
    OUTPUT: "source",
}

export const MODALS = {
}

export const RF_ELEMENT_ID = "reactflow"

export const RF_STORE_PROPERTIES = {
    NODE_BEING_CONFIGURED: "nodeBeingConfigured",
    PANE_CONTEXT_MENU_OPENED: "paneContextMenuOpened",
    PANE_CONTEXT_MENU_POSITION: "paneContextMenuPosition",
    UNDO: "undo",
    REDO: "redo",
}

export const INPUT_MODE = {
    CONFIGURATION: "config",
    HANDLE: "handle",
}

export const DEFAULT_INPUT_CONFIG_VALIDATION_ERROR = "Invalid input."

export const GRAPH_DELETE_KEYS = ["Delete", "Backspace"]

export const INPUT_MODE_DESCRIPTIONS = {
    [INPUT_MODE.HANDLE]: "Currently being shown as an input on the node. Its value will come from the output of another node.",
    [INPUT_MODE.CONFIGURATION]: "Currently using the fixed value below.",
}

export const GRAPH_MIME_TYPE = "application/vnd.minus.graph+json"

export const CLICK_OUTSIDE_PD_TS = ["pointerdown", "touchstart"]

export const CONTROL_MODIFIER_LABELS = {
    [CONTROL_MODIFIER.AWAIT]: "Wait For Value",
    [CONTROL_MODIFIER.CONDITIONAL]: "Run Conditionally",
}

export const CONTROL_MODIFIER_ICONS = {
    [CONTROL_MODIFIER.AWAIT]: TbActivity,
    [CONTROL_MODIFIER.CONDITIONAL]: TbArrowsSplit2,
}

export const MODIFIER_INPUT_DEFINITIONS = {
    [CONTROL_MODIFIER.AWAIT]: {
        name: "Value",
    },
    [CONTROL_MODIFIER.CONDITIONAL]: {
        name: "Condition",
    },
}

export const INTERFACE_ID_PREFIX = "interface-"
export const NODE_ID_PREFIX = "node-"
export const EDGE_ID_PREFIX = "edge-"

export const PORT_PADDING = 100