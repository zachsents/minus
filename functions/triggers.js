import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { onRequest } from "firebase-functions/v2/https"
import { RUN_STATUS, TRIGGER_TYPE, isStatusFinished } from "shared"
import { WORKFLOW_RUNS_COLLECTION, WORKFLOW_TRIGGERS_COLLECTION } from "shared/firebase.js"
import { db } from "./init.js"
import { onDocumentWritten } from "firebase-functions/v2/firestore"
import { getStartDateFromSchedule } from "./modules/scheduling.js"


/**
 * @typedef {object} Trigger
 *
 * @property {string} type
 * @property {import("firebase-admin/firestore").DocumentReference} workflow
 *
 * @property {import("./modules/scheduling.js").RecurringSchedule} schedule The schedule for recurring schedules. Only valid for type `trigger:minus.RecurringSchedule`.
 */


export const onTriggerWrite = onDocumentWritten(`${WORKFLOW_TRIGGERS_COLLECTION}/{triggerId}`, async event => {

    /** @type {Trigger} */
    const beforeTrigger = event.data.before.data()

    /** @type {Trigger} */
    const afterTrigger = event.data.after.data()

    const type = afterTrigger?.type ?? beforeTrigger?.type

    if (type === TRIGGER_TYPE.RECURRING_SCHEDULE) {
        if (beforeTrigger) {
            const futureScriptRunsSnapshot = await db.collection(WORKFLOW_RUNS_COLLECTION)
                .where("trigger", "==", event.data.before.ref)
                .where("scheduledFor", ">", Timestamp.now())
                .get()

            const batch = db.batch()

            futureScriptRunsSnapshot.docs.forEach(scriptRunDoc => {
                batch.update(scriptRunDoc.ref, {
                    status: RUN_STATUS.CANCELLED,
                    cancelReason: afterTrigger ? "Trigger changed" : "Trigger deleted",
                })
            })

            await batch.commit()
        }

        if (afterTrigger && afterTrigger.schedule) {
            await db.collection(WORKFLOW_RUNS_COLLECTION).add({
                script: afterTrigger.script,
                trigger: event.data.after.ref,
                status: RUN_STATUS.PENDING_SCHEDULING,
                scheduledFor: Timestamp.fromDate(
                    getStartDateFromSchedule(afterTrigger.schedule)
                ),
            })
        }
    }
})


export const onRequestAsyncUrlTrigger = onRequest({
    cors: false,
}, async (req, res) => {
    await beginUrlTrigger(req)
    res.status(202).send()
})


export const onRequestSyncUrlTrigger = onRequest({
    cors: false,
}, async (req, res) => {

    const scriptRunRef = await beginUrlTrigger(req)

    const { statusCode, body } = await new Promise(resolve => {
        scriptRunRef.onSnapshot(snapshot => {
            const data = snapshot.data()
            if (isStatusFinished(data.status))
                resolve(data.responses.url ?? {
                    statusCode: 204,
                    body: undefined,
                })
        })
    })

    res.status(statusCode).send(body)
})


async function beginUrlTrigger(req) {

    const { t: triggerId, ...reqQuery } = req.query

    const triggerRef = db.collection(WORKFLOW_TRIGGERS_COLLECTION).doc(triggerId)
    const trigger = await triggerRef.get().then(doc => doc.data())

    return db.collection(WORKFLOW_RUNS_COLLECTION).add({
        script: trigger.script,
        trigger: triggerRef,
        status: RUN_STATUS.PENDING,
        queuedAt: FieldValue.serverTimestamp(),
        triggerData: {
            request: {
                method: req.method,
                headers: req.headers,
                query: reqQuery,
                body: req.body,
            }
        }
    })
}