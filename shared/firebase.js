
export const WORKFLOWS_COLLECTION = "workflows"
export const WORKFLOW_VERSIONS_COLLECTION = "workflow-versions"
export const WORKFLOW_RUNS_COLLECTION = "workflow-runs"
export const WORKFLOW_TRIGGERS_COLLECTION = "workflow-triggers"

export const ORGANIZATIONS_COLLECTION = "organizations"
export const USER_DATA_COLLECTION = "user-data"
export const OUTBOUND_MAIL_COLLECTION = "outbound-mail"
export const STRIPE_CUSTOMERS_COLLECTION = "stripe-customers"

export const API_ROUTE = {
    CREATE_ORGANIZATION: "create-organization",
    DELETE_ORGANIZATION: "delete-organization",

    CREATE_WORKFLOW: "create-workflow",
    DELETE_WORKFLOW: "delete-workflow",

    GET_PUBLIC_USER_DATA: "get-public-user-data",

    INVITE_USER_TO_ORGANIZATION: "invite-user-to-organization",
    ACCEPT_INVITATION: "accept-invitation",
    REJECT_INVITATION: "reject-invitation",
    REMOVE_FROM_ORGANIZATION: "remove-from-organization",

    RUN_WORKFLOW_MANUALLY: "run-workflow-manually",
    CHANGE_WORKFLOW_TRIGGER: "change-workflow-trigger",
}

export const WORKFLOW_RUNNER_QUEUE = "run-workflow-queue"
export const WORKFLOW_RUNNER_URL = "https://minus-workflow-runner-fbm3h26vsq-uc.a.run.app"