import { createHash } from "crypto"
import { doc } from "firebase/firestore"
import { useEffect } from "react"
import { useFirestoreDocData } from "reactfire"
import { WORKFLOWS_COLLECTION, workflowVersionStoragePath } from "shared/constants/firebase"
import { fire } from "./firebase"
import { useSetStorageFileContent, useStorageFileContent } from "./firebase/storage"
import { useUpdateDoc } from "./firebase/use-update-doc"
import { useQueryParam } from "./router"
import { sessionId } from "./session"


const workflowRef = workflowId => doc(fire.db, WORKFLOWS_COLLECTION, workflowId)

export function useWorkflow(workflowId) {
    workflowId ??= useQueryParam("workflowId")[0]
    const ref = workflowRef(workflowId)

    const { data: workflow } = useFirestoreDocData(ref, {
        idField: "id",
    })

    const [updateWorkflow] = useUpdateDoc(ref)

    return [workflow, updateWorkflow]
}

export function useWorkflowGraph(workflowId) {

    const [workflow, updateWorkflow] = useWorkflow(workflowId)

    const graphPath = workflow && workflowVersionStoragePath(workflow.currentVersion.id)

    const [graphString, graphStringQuery] = useStorageFileContent(graphPath, {
        refetchOnMount: false,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    })
    const [updateGraphString] = useSetStorageFileContent(graphPath)

    const update = str => {
        const hash = createHash("md5").update(str).digest("base64")
        updateGraphString(str, {
            onSuccess: () => updateWorkflow({
                graphUpdate: {
                    hash,
                    user: sessionId,
                }
            })
        })
    }

    useEffect(() => {
        console.debug("new graph update", workflow?.graphUpdate)
        if (workflow?.graphUpdate?.hash && workflow?.graphUpdate?.user !== sessionId) {
            graphStringQuery.refetch()
            return
        }
    }, [workflow?.graphUpdate?.hash])

    return [graphString, update]
}