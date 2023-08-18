import { BASE_URL, FUNCTIONS_URL } from "./index.js"


export const TRIGGER_TYPE = {
    MANUAL: "trigger:minus.Manual",
    RECURRING_SCHEDULE: "trigger:minus.RecurringSchedule",
    ASYNC_URL: "trigger:minus.URLAsync",
    SYNC_URL: "trigger:minus.URLSync",

    GMAIL_EMAIL_RECEIVED: "trigger:google.GmailEmailReceived",
}


export const ASYNC_TRIGGER_URL = process.env.NODE_ENV === "production" ?
    `${BASE_URL}/trigger/async-url?t=` :
    `${FUNCTIONS_URL("onRequestAsyncUrlTrigger")}?t=`

export const SYNC_TRIGGER_URL = process.env.NODE_ENV === "production" ?
    `${BASE_URL}/trigger/sync-url?t=` :
    `${FUNCTIONS_URL("onRequestSyncUrlTrigger")}?t=`