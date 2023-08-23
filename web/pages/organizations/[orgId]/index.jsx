import { useRouter } from "next/router"
import { useEffect } from "react"


export default function OrganizationIndexPage() {

    const router = useRouter()

    useEffect(() => {
        if (router.isReady)
            router.replace(`/organizations/${router.query.orgId}/overview`)
    }, [router.isReady])
}
