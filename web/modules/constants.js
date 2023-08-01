
export const LOCAL_STORAGE_KEYS = {
    EDITOR_ACTIVITY_TAB: "editorActivityTab",
    EDITOR_FOLLOW_MOUSE: "editorFollowMouse",
    EDITOR_AUTO_LAYOUT: "editorAutoLayout",
    EDITOR_SHOW_GRID: "editorShowGrid",
    EDITOR_SHOW_MINIMAP: "editorShowMinimap",
}

export const HANDLE_TYPE = {
    INPUT: "target",
    OUTPUT: "source",
}

export const MODALS = {
}

export const RF_STORE_PROPERTIES = {
    NODE_BEING_CONFIGURED: "nodeBeingConfigured",
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