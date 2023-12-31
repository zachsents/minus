import { useInterval, useWindowEvent } from "@mantine/hooks"
import { useFirestoreCollectionData, useFirestoreDocData } from "@web/modules/firebase/reactfire-wrappers"
import { Timestamp, collection, deleteField, doc, limit, orderBy, query, serverTimestamp, where } from "firebase/firestore"
import { useCallback, useEffect, useMemo } from "react"
import { useUser } from "reactfire"
import { API_ROUTE, WORKFLOWS_COLLECTION, WORKFLOW_RUNS_COLLECTION, WORKFLOW_TRIGGERS_COLLECTION } from "shared/firebase"
import { LAST_ACTIVE_EXPIRATION, WORKFLOW_RUN_LOAD_LIMIT } from "./constants"
import { fire } from "./firebase"
import { useAPI } from "./firebase/api"
import { useUpdateDoc } from "./firebase/use-update-doc"
import { convertGraphForRemote, convertGraphFromRemote } from "./graph"
import { organizationRef, useOrganization, useUserOrganizations } from "./organizations"
import { useQueryParam } from "./router"
import { TRIGGER_INFO } from "./triggers"


export const workflowRef = workflowId => workflowId && doc(fire.db, WORKFLOWS_COLLECTION, workflowId)


export function useWorkflowId() {
    return useQueryParam("workflowId")[0]
}


export function useWorkflow(workflowId, withTrigger = false) {
    workflowId ??= useQueryParam("workflowId")[0]

    const ref = workflowRef(workflowId)
    const { data: workflow } = useFirestoreDocData(ref)

    const [updateWorkflow] = useUpdateDoc(ref)

    if (withTrigger) {
        const trigger = useWorkflowTrigger(workflowId)
        if (workflow && trigger !== undefined)
            workflow.trigger = trigger
    }

    return [workflow, updateWorkflow]
}


export function useUpdateWorkflow(workflowId) {
    workflowId ??= useQueryParam("workflowId")[0]
    const ref = workflowRef(workflowId)
    return useUpdateDoc(ref)
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


export function useWorkflowTrigger(workflowId) {
    workflowId ??= useQueryParam("workflowId")[0]

    const { data: triggers, hasEmitted } = useFirestoreCollectionData(query(
        collection(fire.db, WORKFLOW_TRIGGERS_COLLECTION),
        where("workflow", "==", workflowRef(workflowId)),
        limit(1),
    ))

    if (hasEmitted) {
        const trigger = triggers?.[0]

        return trigger ? {
            ...trigger,
            info: TRIGGER_INFO[trigger.type],
        } : null
    }
}


export function useCreateWorkflow() {
    return useAPI(API_ROUTE.CREATE_WORKFLOW)
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
        where("hasErrors", "==", true),
        where("queuedAt", ">", timestamp),
        orderBy("queuedAt", "desc"),
    ))

    const totalErrors = useMemo(() => runs?.reduce((sum, run) => sum + run.errors?.length, 0), [runs])

    return [runs, totalErrors]
}


export function useWorkflowRecentRuns(workflowId, timePeriodMs = 1000 * 60 * 60 * 24) {
    workflowId ??= useQueryParam("workflowId")[0]

    const ref = workflowRef(workflowId)

    // Need to use useMemo to prevent infinite loop from constantly changing timestamp
    const timestamp = useMemo(() => timePeriodMs === Infinity ? null : Timestamp.fromMillis(Date.now() - timePeriodMs), [timePeriodMs])

    const queryConstraints = [
        where("workflow", "==", ref),
        limit(WORKFLOW_RUN_LOAD_LIMIT),
    ]

    if (timePeriodMs !== Infinity)
        queryConstraints.splice(1, 0,
            where("queuedAt", ">", timestamp),
            orderBy("queuedAt", "desc")
        )

    const { data: runs } = useFirestoreCollectionData(query(
        collection(fire.db, WORKFLOW_RUNS_COLLECTION),
        ...queryConstraints,
    ))

    return runs
}


/**
 * @param {string[]} [organizationIds]
 */
export function useWorkflowsAcrossOrganizations(organizationIds) {

    organizationIds ??= useUserOrganizations().all.map(org => org.id)

    const orgRefs = organizationIds.map(orgId => organizationRef(orgId))
    if (orgRefs.length == 0)
        orgRefs.push("placeholder")

    const { data: workflows } = useFirestoreCollectionData(query(
        collection(fire.db, WORKFLOWS_COLLECTION),
        where("organization", "in", orgRefs),
    ))

    return workflows
}


export function useCanUserDeleteWorkflow(workflowId) {

    const { data: user } = useUser()

    const [workflow] = useWorkflow(workflowId)
    const [org] = useOrganization(workflow?.organization?.id ?? "placeholder")

    if (!workflow || !org || !user)
        return false

    const isWorkflowCreator = workflow.creator === user.uid
    const isAtLeastAdminInOrganization = org.admins?.includes(user.uid) || org.owner === user.uid

    return isWorkflowCreator || isAtLeastAdminInOrganization
}


export function useWorkflowRun(workflowRunId) {

    const { data: workflowRun } = useFirestoreDocData(workflowRunId && doc(fire.db, WORKFLOW_RUNS_COLLECTION, workflowRunId))

    return workflowRun
}
