import { doc } from "firebase/firestore"
import { useMemo } from "react"
import { WORKFLOWS_COLLECTION } from "shared/constants/firebase"
import { fire } from "./firebase"
import { useFirestoreDocData } from "./firebase/reactfire-wrappers"
import { useUpdateDoc } from "./firebase/use-update-doc"
import { convertGraphFromRemote } from "./graph"
import { useQueryParam } from "./router"
import _ from "lodash"


const workflowRef = workflowId => doc(fire.db, WORKFLOWS_COLLECTION, workflowId)


/**
 * @param {string} workflowId
 * @return {[Workflow, (data: Partial<Workflow>) => Promise<void>]} 
 */
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

    // const graphPath = workflow && workflowVersionStoragePath(workflow.currentVersion.id)

    // const [graphString, graphStringQuery] = useStorageFileContent(graphPath, {
    //     refetchOnMount: false,
    //     refetchOnWindowFocus: false,
    //     refetchOnReconnect: false,
    // })
    // const [updateGraphString] = useSetStorageFileContent(graphPath)

    // const update = str => {
    //     const hash = createHash("md5").update(str).digest("base64")
    //     updateGraphString(str, {
    //         onSuccess: () => updateWorkflow({
    //             graphUpdate: {
    //                 hash,
    //                 user: sessionId,
    //             }
    //         })
    //     })
    // }

    // useEffect(() => {
    //     console.debug("new graph update", workflow?.graphUpdate)
    //     if (workflow?.graphUpdate?.hash && workflow?.graphUpdate?.user !== sessionId) {
    //         graphStringQuery.refetch()
    //         return
    //     }
    // }, [workflow?.graphUpdate?.hash])

    // return [graphString, update]
}


export function useUpdateWorkflowGraph(workflowId) {

    const [workflow] = useWorkflow(workflowId)
    const [updateVersion, updateQuery] = useUpdateDoc(workflow?.currentVersion)

    const updateGraph = (pathOrUpdateObj, value) => {
        if (typeof pathOrUpdateObj === "string") {
            pathOrUpdateObj = { [pathOrUpdateObj]: value }
        }

        return updateVersion(_.mapKeys(pathOrUpdateObj, (_, key) => `graph.${key}`))
    }

    return [updateGraph, updateQuery]
}


/**
 * @typedef {object} Workflow
 * @property {string} id
 * @property {string} name
 * @property {import("firebase/firestore").DocumentReference} currentVersion
 */

