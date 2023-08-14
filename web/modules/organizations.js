import { collection, doc, query, where } from "firebase/firestore"
import { useMemo } from "react"
import { useUser } from "reactfire"
import { ORGANIZATIONS_COLLECTION, USER_DATA_COLLECTION } from "shared/constants/firebase"
import { useFirestoreCollectionData, useFirestoreDocData } from "./firebase/reactfire-wrappers"
import { useQueryParam } from "./router"
import { fire } from "./firebase"
import { useUpdateDoc } from "./firebase/use-update-doc"


const organizationRef = orgId => orgId && doc(fire.db, ORGANIZATIONS_COLLECTION, orgId)


export function useUserOrganizations() {

    const { data: user } = useUser()

    const [ownerQuery, adminQuery, memberQuery] = useMemo(() => user ? [
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
    ] : [], [user])

    const { data: ownerOrgs } = useFirestoreCollectionData(ownerQuery)
    const { data: adminOrgs } = useFirestoreCollectionData(adminQuery)
    const { data: memberOrgs } = useFirestoreCollectionData(memberQuery)

    return {
        owner: ownerOrgs,
        admin: adminOrgs,
        member: memberOrgs,
        all: [
            ...(ownerOrgs || []),
            ...(adminOrgs || []),
            ...(memberOrgs || []),
        ],
        loaded: !!ownerOrgs && !!adminOrgs && !!memberOrgs,
    }
}


export function useOrganization(orgId) {
    orgId ??= useQueryParam("orgId")[0]

    const ref = organizationRef(orgId)
    const { data: organization } = useFirestoreDocData(ref)

    const [updateOrganization] = useUpdateDoc(ref)

    return [organization, updateOrganization]
}


export function useUpdateOrganization(orgId) {
    orgId ??= useQueryParam("orgId")[0]

    const ref = organizationRef(orgId)
    return useUpdateDoc(ref)
}
