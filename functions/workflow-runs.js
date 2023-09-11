import admin from "firebase-admin"
import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { getFunctions } from "firebase-admin/functions"
import { logger } from "firebase-functions/v2"
import { onDocumentWritten } from "firebase-functions/v2/firestore"
import { onTaskDispatched } from "firebase-functions/v2/tasks"
import { RUN_STATUS, TRIGGER_TYPE } from "shared"
import { WORKFLOW_RUNNER_QUEUE, WORKFLOW_RUNNER_URL, WORKFLOW_RUNS_COLLECTION } from "shared/firebase.js"
import { db } from "./init.js"
import { sendEmailFromTemplate } from "./modules/mail.js"
import { getNextDateFromSchedule } from "./modules/scheduling.js"


/**
 * @typedef {object} WorkflowRun
 *
 * @property {string} status
 * @property {import("firebase-admin/firestore").DocumentReference} workflow
 * @property {import("firebase-admin/firestore").DocumentReference} trigger
 * @property {object} triggerData Data passed into the script run from the trigger
 *
 * @property {import("firebase-admin/firestore").Timestamp} queuedAt
 * @property {import("firebase-admin/firestore").Timestamp} startedAt
 * @property {import("firebase-admin/firestore").Timestamp} scheduledAt
 * @property {import("firebase-admin/firestore").Timestamp} completedAt
 * @property {import("firebase-admin/firestore").Timestamp} scheduledFor
 *
 * @property {string} [cancelReason] Only present for status `CANCELLED`
 */


export const onWorkflowRunWritten = onDocumentWritten({
    document: `${WORKFLOW_RUNS_COLLECTION}/{workflowRunId}`,
    // secrets: [stripeKey],
}, async event => {

    if (!event.data.after.exists)
        return

    /** @type {WorkflowRun} */
    const workflowRun = event.data.after.data()

    if (workflowRun.status === RUN_STATUS.PENDING) {

        // const stripe = new Stripe(stripeKey.value())
        // const subscription = await getSubscriptionForOrganization(stripe, workflowRun.workflow.id, false)
        // const isOnFreePlan = subscription.items.data[0].price.id === STRIPE_FREE_PRICE_ID

        // TO DO: test usage

        logger.info(`Beginning script run (${event.data.after.id})`)

        await event.data.after.ref.update({
            status: RUN_STATUS.RUNNING,
            startedAt: FieldValue.serverTimestamp(),
        })

        await getFunctions().taskQueue(WORKFLOW_RUNNER_QUEUE).enqueue({}, {
            uri: `${WORKFLOW_RUNNER_URL}/${event.data.after.id}`,
        })
    }

    if (workflowRun.status === RUN_STATUS.PENDING_SCHEDULING) {
        await getFunctions().taskQueue("runScheduledScript").enqueue({
            workflowRunId: event.params.workflowRunId,
        }, {
            scheduleTime: workflowRun.scheduledFor.toDate(),
        })

        logger.info(`Scheduled script run (${event.params.workflowRunId}) for ${workflowRun.scheduledFor.toDate().toISOString()}`)

        await event.data.after.ref.update({
            status: RUN_STATUS.SCHEDULED,
            scheduledAt: FieldValue.serverTimestamp(),
        })
    }

    if (workflowRun.status === RUN_STATUS.FAILED) {
        const workflow = await workflowRun.workflow.get().then(doc => doc.data())
        const organization = await workflow.organization.get().then(doc => doc.data())

        const recipientIds = []

        if (organization.sendErrorNotificationsToOwner)
            recipientIds.push(organization.owner)

        if (organization.sendErrorNotificationsToMembers)
            recipientIds.push(...organization.members, ...organization.admins)

        const recipientEmails = await admin.auth().getUsers(recipientIds.map(uid => ({ uid })))
            .then(res => res.users.map(user => user.email))

        await sendEmailFromTemplate(recipientEmails, "workflow-run-failed", {
            workflowName: workflow.name,
            workflowId: workflowRun.workflow.id,
            runId: event.params.workflowRunId,
            errors: workflowRun.errors?.map(err => `<li>${err.message}</li>`).join("\n") ?? "",
        })
    }
})


export const runScheduledScript = onTaskDispatched(async ({ data }) => {

    const workflowRunRef = db.collection(WORKFLOW_RUNS_COLLECTION).doc(data.workflowRunId)
    /** @type {WorkflowRun} */
    const workflowRun = await workflowRunRef.get().then(doc => doc.data())

    if (workflowRun.status !== RUN_STATUS.SCHEDULED)
        return

    await workflowRunRef.update({
        status: RUN_STATUS.PENDING,
        queuedAt: FieldValue.serverTimestamp(),
    })

    /** @type {import("./triggers.js").Trigger} */
    const trigger = await workflowRun.trigger?.get().then(doc => doc.data())

    if (trigger?.type === TRIGGER_TYPE.RECURRING_SCHEDULE) {
        await db.collection(WORKFLOW_RUNS_COLLECTION).add({
            script: workflowRun.workflow,
            trigger: workflowRun.trigger,
            status: RUN_STATUS.PENDING_SCHEDULING,
            scheduledFor: Timestamp.fromDate(
                getNextDateFromSchedule(trigger.schedule, workflowRun.scheduledFor.toDate())
            ),
        })
    }
})


/**
 * Gonna comment this out for now, since the the code will be more controlled. This was just for
 * timeouts and memory limits.
 */
// export const onScriptRunnerError = onMessagePublished(SCRIPT_RUNNER_ERROR_TOPIC, async event => {

//     const workflowRunId = new URL(event.data.message.json.httpRequest.requestUrl).pathname.slice(1)

//     let errorText = event.data.message.json.textPayload

//     logger.info(`Service Error caused script run to fail (${workflowRunId})\n"${errorText}"`)

//     const matchingRemap = SERVICE_ERROR_REMAPS.find(remap => errorText.includes(remap.includeText))
//     if (matchingRemap)
//         errorText = matchingRemap.remapTo

//     await db.collection(SCRIPT_RUN_COLLECTION).doc(workflowRunId).update({
//         status: RUN_STATUS.FAILED,
//         failedAt: FieldValue.serverTimestamp(),
//         failureReason: "Service error",
//         stderr: errorText,
//     })
// })
