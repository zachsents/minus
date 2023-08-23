import { HttpsError, onCall } from "firebase-functions/v2/https"
import { API_ROUTE } from "shared/firebase.js"
import { assertUserMustBeInOrganization, assertUserMustHaveAdminRightsForOrganization, assertUserMustOwnOrganization, createOrganization, deleteOrganization, organizationRef } from "../modules/organizations.js"
import { APIRequestSchema, validateSchema } from "./schema.js"
import Joi from "joi"
import { PLAN } from "shared/plans.js"
import { assertUserMustBeWorkflowCreator, createWorkflow, deleteWorkflow, getWorkflow } from "../modules/workflows.js"
import { assertAny } from "../modules/assert.js"
import admin from "firebase-admin"
import _ from "lodash"


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
        }), params)

        return await createOrganization({
            ...params,
            owner: auth.uid,
            plan: PLAN.FREE,
        }).then(ref => ({ orgId: ref.id }))
    }

    else if (route === API_ROUTE.DELETE_WORKFLOW) {
        await validateSchema(Joi.object({
            workflowId: Joi.string().required(),
        }), params)

        const workflow = await getWorkflow(params.workflowId)
        await assertAny(
            () => assertUserMustHaveAdminRightsForOrganization(workflow.organization.id, auth.uid),
            () => assertUserMustBeWorkflowCreator(params.workflowId, auth.uid),
        )
        return await deleteWorkflow(params.workflowId)
    }

    else if (route === API_ROUTE.CREATE_WORKFLOW) {
        await validateSchema(Joi.object({
            orgId: Joi.string().required(),
            name: Joi.string().required(),
        }), params)

        await assertUserMustBeInOrganization(params.orgId, auth.uid)

        const { orgId, ...rest } = params

        return await createWorkflow({
            ...rest,
            creator: auth.uid,
            organization: organizationRef(orgId),
        }).then(ref => ({ workflowId: ref.id }))
    }

    else if (route === API_ROUTE.GET_PUBLIC_USER_DATA) {
        await validateSchema(Joi.object({
            userId: Joi.string(),
            userIds: Joi.array().items(Joi.string()),
        }), params)

        const publicProperties = ["uid", "email", "displayName", "photoURL"]

        if (params.userId) {
            const user = await admin.auth().getUser(params.userId)
            return _.pick(user, publicProperties)
        }

        if (params.userIds) {
            const { users } = await admin.auth().getUsers(
                params.userIds.map(userId => ({ uid: userId }))
            )
            return _.keyBy(users.map(user => _.pick(user, publicProperties)), "uid")
        }

        throw new HttpsError("invalid-argument", "Either userId or userIds must be provided")
    }
})

