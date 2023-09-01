
export const PLAN = {
    FREE: "free",
    STARTER: "starter",
    PRO: "pro",
    BUSINESS: "business",
    EXPERTS: "experts",
}

export const PLAN_LIMITS = {
    [PLAN.FREE]: {
        workflows: 3,
        dailyWorkflowRuns: 3 * 24,
    },
    [PLAN.STARTER]: {
        workflows: 10,
        dailyWorkflowRuns: 10 * 50,
    },
    [PLAN.PRO]: {
        workflows: 25,
        dailyWorkflowRuns: 25 * 250,
    },
    [PLAN.BUSINESS]: {
        workflows: 100,
        dailyWorkflowRuns: 1000,
    },
    [PLAN.EXPERTS]: {
        workflows: 500,
        dailyWorkflowRuns: 10000,
    },
}