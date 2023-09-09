import { TbActivity, TbArrowsSplit2 } from "react-icons/tb"
import { CONTROL_MODIFIER, DataType } from "shared"


export const LOCAL_STORAGE_KEYS = {
    EDITOR_ACTIVITY_TAB: "editorActivityTab",
    EDITOR_FOLLOW_MOUSE: "editorFollowMouse",
    EDITOR_AUTO_LAYOUT: "editorAutoLayout",
    EDITOR_SHOW_GRID: "editorShowGrid",
    EDITOR_SHOW_MINIMAP: "editorShowMinimap",
    PINNED_NODES: "pinnedNodes",
    HAS_LOGGED_IN: "hasLoggedIn",
    SIGN_IN_EMAIL: "signInEmail",
    SHOW_INTRO_ALERT: "showIntroAlert",
    SHOW_WORKFLOW_USAGE: "showWorkflowUsage",
    RUN_VIEWER_MODE: "runViewerMode",
}

export const HANDLE_TYPE = {
    INPUT: "target",
    OUTPUT: "source",
}

export const MODALS = {
    IMPORTANT_CONFIRM: "importantConfirm",
    ADD_ORGANIZATION_MEMBER: "addOrganizationMember",
}

export const RF_ELEMENT_ID = "reactflow"
export const ACTIVITY_BAR_ELEMENT_ID = "activity-bar"

export const INPUT_MODE = {
    CONFIGURATION: "config",
    HANDLE: "handle",
}

export const INPUT_MODE_DESCRIPTIONS = {
    [INPUT_MODE.HANDLE]: "Currently being shown as an input on the node. Its value will come from the output of another node.",
    [INPUT_MODE.CONFIGURATION]: "Currently using the fixed value below.",
}

export const DEFAULT_INPUT_CONFIG_VALIDATION_ERROR = "Invalid input."


export const GRAPH_DELETE_KEYS = ["Delete", "Backspace"]

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
        type: DataType.ANY,
    },
    [CONTROL_MODIFIER.CONDITIONAL]: {
        name: "Condition",
        type: DataType.BOOLEAN,
    },
}

export const INTERFACE_ID_PREFIX = "interface-"
export const NODE_ID_PREFIX = "node-"
export const EDGE_ID_PREFIX = "edge-"

export const ACTIVITY = {
    ACTIONS: "actions",
    ACCOUNTS: "accounts",
    ASSISTANT: "assistant",
    VERSIONS: "versions",
}

export const LAST_ACTIVE_EXPIRATION = 1000 * 60 * 2

export const WORKFLOW_RUN_LOAD_LIMIT = 100