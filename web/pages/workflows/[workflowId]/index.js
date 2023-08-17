import { useRouter } from "next/router"
import { useEffect } from "react"


export default function WorkflowIndexPage() {

    const router = useRouter()

    useEffect(() => {
        if (router.isReady)
            router.push(`/workflows/${router.query.workflowId}/edit`)
    }, [router.isReady])
}
