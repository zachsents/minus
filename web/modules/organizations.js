import { Timestamp, collection, doc, getDocs, limit, orderBy, query, where } from "firebase/firestore"
import { useRouter } from "next/router"
import { useEffect, useMemo } from "react"
import { useQueries } from "react-query"
import { useUser } from "reactfire"
import { PLAN_LIMITS } from "shared"
import { API_ROUTE, ORGANIZATIONS_COLLECTION, WORKFLOWS_COLLECTION, WORKFLOW_RUNS_COLLECTION } from "shared/firebase"
import { fire, useFirestoreCount } from "./firebase"
import { useAPI } from "./firebase/api"
import { useFirestoreCollectionData, useFirestoreDocData } from "./firebase/reactfire-wrappers"
import { useUpdateDoc } from "./firebase/use-update-doc"
import { useQueryParam } from "./router"
import { workflowRef } from "./workflows"


export const organizationRef = orgId => orgId && doc(fire.db, ORGANIZATIONS_COLLECTION, orgId)


export function useUserOrganizations() {

    const { data: user } = useUser()

    const [ownerQuery, adminQuery, memberQuery, invitedQuery] = useMemo(() => user ? [
        query(
            collection(fire.db, ORGANIZATIONS_COLLECTION),
            where("owner", "==", user.uid),
        ),
        query(
            collection(fire.db, ORGANIZATIONS_COLLECTION),
            where("admins", "array-contains", user.uid),
        ),
        query(
            collection(fire.db, ORGANIZATIONS_COLLECTION),
            where("members", "array-contains", user.uid),
        ),
        query(
            collection(fire.db, ORGANIZATIONS_COLLECTION),
            where("pendingInvitations", "array-contains", user.email),
        ),
    ] : [], [user])

    const { data: ownerOrgs } = useFirestoreCollectionData(ownerQuery)
    const { data: adminOrgs } = useFirestoreCollectionData(adminQuery)
    const { data: memberOrgs } = useFirestoreCollectionData(memberQuery)
    const { data: invitedOrgs } = useFirestoreCollectionData(invitedQuery)

    return {
        owner: ownerOrgs,
        admin: adminOrgs,
        member: memberOrgs,
        invited: invitedOrgs,
        all: [
            ...(ownerOrgs || []),
            ...(adminOrgs || []),
            ...(memberOrgs || []),
        ],
        loaded: !!ownerOrgs && !!adminOrgs && !!memberOrgs && !!invitedOrgs,
    }
}


export function useOrganization(orgId) {
    orgId ??= useQueryParam("orgId")[0]

    const ref = organizationRef(orgId)
    const { data: organization, hasEmitted } = useFirestoreDocData(ref)

    const [updateOrganization] = useUpdateDoc(ref)

    return [hasEmitted ? (organization ?? null) : undefined, updateOrganization]
}


export function useUpdateOrganization(orgId) {
    orgId ??= useQueryParam("orgId")[0]

    const ref = organizationRef(orgId)
    return useUpdateDoc(ref)
}


export function useCreateOrganization() {
    return useAPI(API_ROUTE.CREATE_ORGANIZATION)
}


export function useDeleteOrganization(orgId) {
    orgId ??= useQueryParam("orgId")[0]

    const [deleteOrg, query] = useAPI(API_ROUTE.DELETE_ORGANIZATION)
    return [() => deleteOrg({ orgId }), query]
}


export function useOrganizationWorkflowCount(orgId) {
    orgId ??= useQueryParam("orgId")[0]

    const [org] = useOrganization()

    const fsQuery = useMemo(() => query(
        collection(fire.db, WORKFLOWS_COLLECTION),
        where("organization", "==", organizationRef(orgId)),
    ), [orgId])

    const [count] = useFirestoreCount(fsQuery, {
        queryKey: `organization-workflow-count-${orgId}`,
    })

    const limit = PLAN_LIMITS[org?.plan]?.workflows ?? 1

    return [count, limit, count < limit]
}


export function getUserRole(org, uid) {
    if (org?.owner === uid)
        return "owner"
    if (org?.members?.find(member => member === uid))
        return "member"
    if (org?.admins?.find(admin => admin === uid))
        return "admin"
}


export function isUserAtLeastAdmin(org, uid) {
    return getUserRole(org, uid) === "admin" || getUserRole(org, uid) === "owner"
}


export function isUserInOrganization(org, uid) {
    return !!getUserRole(org, uid)
}


export function getTotalMemberCount(org) {
    return (org?.members?.length || 0) + (org?.admins?.length || 0) + 1
}


export function useOrganizationMustExist(orgId, redirect = "/organizations") {

    const [org] = useOrganization(orgId)
    const router = useRouter()

    useEffect(() => {
        if (org === null) {
            router.push(redirect)
        }
    }, [org])
}


export function useUserMustBeInOrganization(orgId) {
    const { data: user } = useUser()
    const [org] = useOrganization(orgId)
    const router = useRouter()

    useEffect(() => {
        if (!org || !user) return

        if (!isUserInOrganization(org, user.uid))
            router.push("/organizations")
    }, [org, user?.uid])
}


export function useOrganizationWorkflows(orgId) {
    orgId ??= useQueryParam("orgId")[0]

    const ref = organizationRef(orgId)

    const { data: workflows } = useFirestoreCollectionData(query(
        collection(fire.db, WORKFLOWS_COLLECTION),
        where("organization", "==", ref)
    ))

    return workflows
}


export function useOrganizationRecentWorkflows(orgId) {
    orgId ??= useQueryParam("orgId")[0]

    const ref = organizationRef(orgId)

    const { data: workflows } = useFirestoreCollectionData(query(
        collection(fire.db, WORKFLOWS_COLLECTION),
        where("organization", "==", ref),
        orderBy("lastEditedAt", "desc"),
        limit(5),
    ))

    return workflows
}


export function useOrganizationRecentRuns(orgId, timePeriodMs = 1000 * 60 * 60 * 24) {

    const workflows = useOrganizationWorkflows(orgId)

    // Need to use useMemo to prevent infinite loop from constantly changing timestamp
    const timestamp = useMemo(() => Timestamp.fromMillis(Date.now() - timePeriodMs), [timePeriodMs])

    const queries = useMemo(() => workflows?.map(workflow => ({
        queryKey: ["workflow-recent-runs", workflow.id, timestamp],
        queryFn: async () => {
            const snapshot = await getDocs(query(
                collection(fire.db, WORKFLOW_RUNS_COLLECTION),
                where("workflow", "==", workflowRef(workflow.id)),
                where("queuedAt", ">", timestamp),
                orderBy("queuedAt", "desc"),
            ))
            return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
        },
    })) ?? [], [workflows, timestamp])

    const results = useQueries(queries)

    const runs = results.flatMap(({ data }) => data ?? []).sort((a, b) => b.queuedAt - a.queuedAt)

    return runs
}
