
export const WORKFLOWS_COLLECTION = "workflows"
export const WORKFLOW_VERSIONS_COLLECTION = "workflow-versions"
export const WORKFLOW_RUNS_COLLECTION = "workflow-runs"
export const WORKFLOW_TRIGGERS_COLLECTION = "workflow-triggers"

export const WORKFLOW_VERSIONS_STORAGE_FOLDER = "workflow-versions"
export const workflowVersionStoragePath = id => `${WORKFLOW_VERSIONS_STORAGE_FOLDER}/${id}/graph.json`

export const ORGANIZATIONS_COLLECTION = "organizations"

export const USER_DATA_COLLECTION = "user-data"


export const API_ROUTE = {
    CREATE_ORGANIZATION: "create-organization",
    DELETE_ORGANIZATION: "delete-organization",

    CREATE_WORKFLOW: "create-workflow",
    DELETE_WORKFLOW: "delete-workflow",
}