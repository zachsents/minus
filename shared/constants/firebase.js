
export const WORKFLOWS_COLLECTION = "workflows"
export const WORKFLOW_VERSIONS_COLLECTION = "workflow-versions"
export const WORKFLOW_RUNS_COLLECTION = "workflow-runs"

export const WORKFLOW_VERSIONS_STORAGE_FOLDER = "workflow-versions"
export const workflowVersionStoragePath = id => `${WORKFLOW_VERSIONS_STORAGE_FOLDER}/${id}/graph.json`