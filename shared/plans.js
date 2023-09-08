
export const PLAN = {
    FREE: "free",
    STARTER: "starter",
    PRO: "pro",
    BUSINESS: "business",
    EXPERTS: "experts",
}

/**
 * @typedef {object} StripePrice
 * @property {string | null} priceId
 * @property {string | null} paymentLink
 */

/**
 * @typedef {object} Plan
 * @property {object} limits
 * @property {number} limits.workflows
 * @property {number} limits.dailyWorkflowRuns
 * @property {object} stripe
 * @property {StripePrice} stripe.monthly
 * @property {StripePrice} stripe.annual
 */


/** @type {Object.<string, Plan>} */
export const PLANS = {
    [PLAN.FREE]: {
        limits: {
            workflows: 3,
            dailyWorkflowRuns: 72,
        },
        stripe: {
            monthly: {
                priceId: null,
                paymentLink: null,
            },
            annual: {
                priceId: null,
                paymentLink: null,
            },
        }
    },
    [PLAN.STARTER]: {
        limits: {
            workflows: 10,
            dailyWorkflowRuns: 10 * 50,
        },
        stripe: {
            monthly: {
                priceId: "price_1NmOB6HYINHn5cdTsoukuYyg",
                paymentLink: "",
            },
            annual: {
                priceId: "price_1NmOB6HYINHn5cdTaMJZp1nw",
                paymentLink: "",
            },
        },
    },
    [PLAN.PRO]: {
        limits: {
            workflows: 25,
            dailyWorkflowRuns: 2500,
        },
        stripe: {
            monthly: {
                priceId: "price_1NmOFeHYINHn5cdT8MTFv8nD",
                paymentLink: "https://buy.stripe.com/test_5kAeWS7esd7m4485kk",
            },
            annual: {
                priceId: "price_1NmOFeHYINHn5cdTrSciD5lO",
                paymentLink: "https://buy.stripe.com/test_3cs7uq1U82sIeIM289",
            },
        },
    },
    [PLAN.BUSINESS]: {
        limits: {
            workflows: 75,
            dailyWorkflowRuns: 10000,
        },
        stripe: {
            monthly: {
                priceId: "price_1NmOKyHYINHn5cdTcdPi2Ten",
                paymentLink: "",
            },
            annual: {
                priceId: "price_1NmOKyHYINHn5cdT9qcLF1pk",
                paymentLink: "",
            },
        },
    },
    [PLAN.EXPERTS]: {
        limits: {
            workflows: 150,
            dailyWorkflowRuns: 24000,
        },
        stripe: {
            monthly: {
                priceId: "price_1NmOTNHYINHn5cdTnM0veE5F",
                paymentLink: "",
            },
            annual: {
                priceId: "price_1NmOTNHYINHn5cdT9oLzsXVi",
                paymentLink: "",
            },
        },
    },
}
