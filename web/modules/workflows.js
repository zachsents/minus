import { useFirestoreDocData } from "@web/modules/firebase/reactfire-wrappers"
import { doc } from "firebase/firestore"
import { useCallback, useMemo } from "react"
import { WORKFLOWS_COLLECTION } from "shared/constants/firebase"
import { fire } from "./firebase"
import { useUpdateDoc } from "./firebase/use-update-doc"
import { convertGraphForRemote, convertGraphFromRemote } from "./graph"
import { useQueryParam } from "./router"


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
