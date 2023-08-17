import { useInterval, useWindowEvent } from "@mantine/hooks"
import { useFirestoreCollectionData, useFirestoreDocData } from "@web/modules/firebase/reactfire-wrappers"
import { Timestamp, collection, deleteField, doc, orderBy, query, serverTimestamp, where } from "firebase/firestore"
import { useCallback, useEffect, useMemo } from "react"
import { useUser } from "reactfire"
import { API_ROUTE, WORKFLOWS_COLLECTION, WORKFLOW_RUNS_COLLECTION } from "shared/constants/firebase"
import { LAST_ACTIVE_EXPIRATION } from "./constants"
import { fire } from "./firebase"
import { useUpdateDoc } from "./firebase/use-update-doc"
import { convertGraphForRemote, convertGraphFromRemote } from "./graph"
import { useQueryParam } from "./router"
import { useAPI } from "./firebase/api"


const workflowRef = workflowId => workflowId && doc(fire.db, WORKFLOWS_COLLECTION, workflowId)


export function useWorkflow(workflowId) {
    workflowId ??= useQueryParam("workflowId")[0]

    const ref = workflowRef(workflowId)
    const { data: workflow } = useFirestoreDocData(ref)

    const [updateWorkflow] = useUpdateDoc(ref)

    return [workflow, updateWorkflow]
}


export function useWorkflowGraph(workflowId) {

    const [workflow] = useWorkflow(workflowId)

    const { data: workflowVersion, hasEmitted } = useFirestoreDocData(workflow?.currentVersion)

    const graph = useMemo(
        () => convertGraphFromRemote(workflowVersion?.graph),
        [JSON.stringify(workflowVersion?.graph)]
    )

    return [graph, hasEmitted]
}


export function useUpdateWorkflowGraph(workflowId) {
    const [workflow] = useWorkflow(workflowId)
    const [updateVersion, updateQuery] = useUpdateDoc(workflow?.currentVersion)

    const updateGraph = useCallback(graph => updateVersion({
        graph: convertGraphForRemote(graph),
    }))

    return [updateGraph, updateQuery]
}


export function useDeleteWorkflow(workflowId) {
    workflowId ??= useQueryParam("workflowId")[0]

    const [deleteWorkflow, query] = useAPI(API_ROUTE.DELETE_WORKFLOW)
    return [() => deleteWorkflow({ workflowId }), query]
}


export function useActiveUserOnWorkflow(workflowId) {

    const [, updateWorkflow] = useWorkflow(workflowId)
    const { data: user } = useUser()

    const userKey = user && `activeUsers.${user.uid}`

    const setActive = () => {
        if (user) {
            updateWorkflow({
                [userKey]: {
                    email: user.email,
                    displayName: user.displayName,
                    photo: user.photoURL,
                    lastActiveAt: serverTimestamp(),
                },
            })
        }
    }

    const interval = useInterval(setActive, LAST_ACTIVE_EXPIRATION)

    useEffect(() => {
        if (user) {
            setActive()
            interval.start()
        }
    }, [user])

    useWindowEvent("beforeunload", () => {
        if (user) {
            updateWorkflow({
                [userKey]: deleteField(),
            })
        }
    })
}


export function useActiveUsers(workflowId) {

    const [workflow] = useWorkflow(workflowId)

    return useMemo(
        () => Object.entries(workflow?.activeUsers ?? {})
            .filter(([, userData]) => Date.now() - userData.lastActiveAt?.toDate() < LAST_ACTIVE_EXPIRATION + 1000),
        [workflow]
    )
}


export function useWorkflowRecentErrors(workflowId, timePeriodMs = 1000 * 60 * 60 * 24) {
    workflowId ??= useQueryParam("workflowId")[0]

    const ref = workflowRef(workflowId)

    // Need to use useMemo to prevent infinite loop from constantly changing timestamp
    const timestamp = useMemo(() => Timestamp.fromMillis(Date.now() - timePeriodMs), [timePeriodMs])

    const { data: runs } = useFirestoreCollectionData(query(
        collection(fire.db, WORKFLOW_RUNS_COLLECTION),
        where("workflow", "==", ref),
        where("queuedAt", ">", timestamp),
        orderBy("queuedAt", "desc"),
        orderBy("hasErrors", "==", true),
    ))

    const totalErrors = useMemo(() => runs?.reduce((sum, run) => sum + run.errors?.length, 0), [runs])

    return [runs, totalErrors]
}