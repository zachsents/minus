import { Group } from "@mantine/core"
import EditHeader from "@web/components/EditHeader"
import EditorActivityBar from "@web/components/EditorActivityBar"
import GraphEditor from "@web/components/GraphEditor"
import TriggerBar from "@web/components/TriggerBar"
import { ReactFlowProvider } from "reactflow"


export default function EditWorkflowPage() {


    return (
        <ReactFlowProvider>
            <div className="flex flex-col grow">
                <EditHeader />
                <TriggerBar />
                <Group spacing={0} className="flex-1" align="stretch">
                    <EditorActivityBar />
                    <GraphEditor />
                </Group>
            </div>
        </ReactFlowProvider>
    )
}
