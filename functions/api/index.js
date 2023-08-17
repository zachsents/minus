import { HttpsError, onCall } from "firebase-functions/v2/https"
import { API_ROUTE } from "shared/constants/firebase.js"
import { assertUserMustHaveAdminRightsForOrganization, assertUserMustOwnOrganization, createOrganization, deleteOrganization } from "../modules/organizations.js"
import { APIRequestSchema, validateSchema } from "./schema.js"
import Joi from "joi"
import { PLAN } from "shared/constants/plans.js"
import { deleteWorkflow, getWorkflow } from "../modules/workflows.js"


export const api = onCall(async ({ data, auth }) => {

    const { route, params } = await validateSchema(APIRequestSchema, data)

    if (!auth?.uid)
        throw new HttpsError("unauthenticated", "User must be authenticated")

    if (route === API_ROUTE.DELETE_ORGANIZATION) {
        await validateSchema(Joi.object({
            orgId: Joi.string().required(),
        }), params)

        await assertUserMustOwnOrganization(params.orgId, auth.uid)
        return await deleteOrganization(params.orgId)
    }

    else if (route === API_ROUTE.CREATE_ORGANIZATION) {
        await validateSchema(Joi.object({
            name: Joi.string().required(),
            owner: Joi.forbidden(),
            createdAt: Joi.forbidden(),
            plan: Joi.forbidden(),
        }), params)

        return await createOrganization({
            owner: auth.uid,
            plan: PLAN.FREE,
            ...params,
        }).then(ref => ({ orgId: ref.id }))
    }

    else if (route === API_ROUTE.DELETE_WORKFLOW) {
        await validateSchema(Joi.object({
            workflowId: Joi.string().required(),
        }), params)

        const workflow = await getWorkflow(params.workflowId)
        await assertUserMustHaveAdminRightsForOrganization(workflow.organization.id, auth.uid)
        return await deleteWorkflow(params.workflowId)
    }
})
