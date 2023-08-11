import EditHeader from "@web/components/EditHeader"
import { useMustBeLoggedIn } from "@web/modules/router"
import { useActiveUserOnWorkflow } from "@web/modules/workflows"


export default function WorkflowRunsPage() {

    useMustBeLoggedIn()
    useActiveUserOnWorkflow()

    return (
        <>
            <EditHeader />
            <div>
                <h1>Workflow Runs</h1>
            </div>
        </>
    )
}
