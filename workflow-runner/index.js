import "dotenv/config"
import express from "express"
import admin from "firebase-admin"
import { FieldValue } from "firebase-admin/firestore"
import morgan from "morgan"
import { WORKFLOW_RUNS_COLLECTION } from "shared/firebase.js"


admin.initializeApp()
export const db = admin.firestore()

// Constants
const PORT = 5050

// Express setup
const app = express()
app.use(express.json())
app.use(morgan("short"))


app.post("/:workflowRunId", async (req, res) => {

    console.debug(`Recevied workflow run request: ${req.params.workflowRunId},`)

    const workflowRunRef = db.collection(WORKFLOW_RUNS_COLLECTION).doc(req.params.workflowRunId)
    // const workflowRun = await runRef.get()

    // TO DO: execute
    const { configValues, edgeValues, errors } = {
        configValues: {
            node1: {
                substitution: "hello",
            },
        },
        edgeValues: {
            edge1: ["5"],
            edge2: ["a", "b", "c"],
        },
        errors: [
            {
                node: "node1",
                message: "Error message",
            },
        ],
    }

    const hasErrors = errors?.length > 0

    await workflowRunRef.update({
        status: hasErrors ? "FAILED" : "COMPLETED",
        configValues,
        edgeValues,
        finishedAt: FieldValue.serverTimestamp(),
        ...hasErrors ? {
            failureReason: "Runtime error",
            failedAt: FieldValue.serverTimestamp(),
            errors,
            hasErrors,
        } : {
            completedAt: FieldValue.serverTimestamp(),
        },
    })

    res.status(204).send()
})


app.listen(PORT, () => {
    console.log(`Container ready to receive requests on ${PORT}`)
})