

export const NODE_TYPE = {
    ACTION: "node-type:Action",
}

export const EDGE_TYPE = {
    DATA: "edge-type:Data",
}

export const RUN_STATUS = {
    RUNNING: "RUNNING",
    PENDING: "PENDING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    CANCELLED: "CANCELLED",
    SCHEDULED: "SCHEDULED",
    PENDING_SCHEDULING: "PENDING_SCHEDULING",
}

export function isStatusFinished(status) {
    return status === RUN_STATUS.COMPLETED || status === RUN_STATUS.FAILED || status === RUN_STATUS.CANCELLED
}


export * from "./application.js"
export * from "./transformer.js"
export * from "./types.js"
export * from "./modifiers.js"
export * from "./plans.js"
export * from "./triggers.js"