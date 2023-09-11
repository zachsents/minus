import admin from "firebase-admin"
import { FieldValue } from "firebase-admin/firestore"
import { HttpsError, onCall } from "firebase-functions/v2/https"
import Joi from "joi"
import _ from "lodash"
import { API_ROUTE, WORKFLOW_RUNS_COLLECTION } from "shared/firebase.js"
import { RUN_STATUS } from "shared/index.js"
import { PLAN } from "shared/plans.js"
import { assertAny } from "../modules/assert.js"
import { sendEmailFromTemplate } from "../modules/mail.js"
import { assertUserCantBeInOrganization, assertUserMustBeInOrganization, assertUserMustHaveAdminRightsForOrganization, assertUserMustOwnOrganization, assertWorkflowLimit, createOrganization, deleteOrganization, getOrganization, organizationRef } from "../modules/organizations.js"
import { assertUserMustBeWorkflowCreator, createWorkflow, deleteWorkflow, getWorkflow, workflowRef } from "../modules/workflows.js"
import { APIRequestSchema, validateSchema } from "./schema.js"
import { db } from "../init.js"


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
            sendErrorNotificationsToOwner: true,
            sendErrorNotificationsToMembers: false,
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
        await assertWorkflowLimit(params.orgId)

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
            userEmail: Joi.string(),
            userIds: Joi.array().items(Joi.string()),
        }), params)

        const publicProperties = ["uid", "email", "displayName", "photoURL"]

        try {
            if (params.userId) {
                const user = await admin.auth().getUser(params.userId)
                return _.pick(user, publicProperties)
            }

            if (params.userEmail) {
                const user = await admin.auth().getUserByEmail(params.userEmail)
                return _.pick(user, publicProperties)
            }

            if (params.userIds) {
                const { users } = await admin.auth().getUsers(
                    params.userIds.map(userId => ({ uid: userId }))
                )
                return _.keyBy(users.map(user => _.pick(user, publicProperties)), "uid")
            }
        }
        catch (err) {
            throw new HttpsError("unknown", err.message)
        }

        throw new HttpsError("invalid-argument", "Either userId or userIds must be provided")
    }

    else if (route === API_ROUTE.INVITE_USER_TO_ORGANIZATION) {
        await validateSchema(Joi.object({
            orgId: Joi.string().required(),
            userEmail: Joi.string().required(),
        }), params)

        await assertUserMustBeInOrganization(params.orgId, auth.uid)

        const org = await getOrganization(params.orgId)

        if (org.pendingInvitations?.includes(params.userEmail))
            throw new HttpsError("already-exists", "User is already invited")

        let user
        try {
            user = await admin.auth().getUserByEmail(params.userEmail)
        }
        catch (err) {
            if (err.code !== "auth/user-not-found")
                throw err

            // user doesnt have a Minus account -- send invitation email
            await sendEmailFromTemplate(params.userEmail, "invite-user-no-account", {
                name: params.userEmail,
                company: org.name,
            })

            await organizationRef(params.orgId).update({
                pendingInvitations: FieldValue.arrayUnion(params.userEmail),
            })

            return
        }

        await assertUserCantBeInOrganization(params.orgId, user.uid)

        await sendEmailFromTemplate(params.userEmail, "invite-user-with-account", {
            name: user.displayName || user.email,
            company: org.name,
        })

        await organizationRef(params.orgId).update({
            pendingInvitations: FieldValue.arrayUnion(params.userEmail),
        })
    }

    else if (route === API_ROUTE.ACCEPT_INVITATION) {
        await validateSchema(Joi.object({
            orgId: Joi.string().required(),
        }), params)

        const user = await admin.auth().getUser(auth.uid)
        const org = await getOrganization(params.orgId)

        if (!org.pendingInvitations?.includes(user.email))
            throw new HttpsError("not-found", "User is not invited")

        await organizationRef(params.orgId).update({
            pendingInvitations: FieldValue.arrayRemove(user.email),
            members: FieldValue.arrayUnion(user.uid),
        })
    }

    else if (route === API_ROUTE.REJECT_INVITATION) {
        await validateSchema(Joi.object({
            orgId: Joi.string().required(),
        }), params)

        const user = await admin.auth().getUser(auth.uid)
        const org = await getOrganization(params.orgId)

        if (!org.pendingInvitations?.includes(user.email))
            throw new HttpsError("not-found", "User is not invited")

        await organizationRef(params.orgId).update({
            pendingInvitations: FieldValue.arrayRemove(user.email),
        })
    }

    else if (route === API_ROUTE.REMOVE_FROM_ORGANIZATION) {
        await validateSchema(Joi.object({
            orgId: Joi.string().required(),
            userId: Joi.string().required(),
        }), params)

        // only requiring member rights right now, but might change to admin rights later
        await assertUserMustBeInOrganization(params.orgId, auth.uid)
        await assertUserMustBeInOrganization(params.orgId, params.userId)

        await organizationRef(params.orgId).update({
            members: FieldValue.arrayRemove(params.userId),
            admins: FieldValue.arrayRemove(params.userId),
        })
    }

    else if (route === API_ROUTE.RUN_WORKFLOW_MANUALLY) {
        await validateSchema(Joi.object({
            workflowId: Joi.string().required(),
            triggerData: Joi.object().required(),
        }), params)

        await getWorkflow(params.workflowId)

        const newRunRef = await db.collection(WORKFLOW_RUNS_COLLECTION).add({
            status: RUN_STATUS.PENDING,
            queuedAt: FieldValue.serverTimestamp(),
            workflow: workflowRef(params.workflowId),
            triggerData: params.triggerData,
            trigger: null,
        })

        return { workflowRunId: newRunRef.id }
    }
})