import { ActionIcon, Button, Group, Stack, Table, Text, Tooltip, useMantineTheme } from "@mantine/core"
import { useClipboard } from "@mantine/hooks"
import { useEditorStoreProperty } from "@web/modules/editor-store"
import { useAPI } from "@web/modules/firebase/api"
import { durationSeconds } from "@web/modules/grammar"
import { useWorkflowId, useWorkflowRecentRuns } from "@web/modules/workflows"
import { useEffect, useState } from "react"
import { isStatusFinished } from "shared"
import { API_ROUTE } from "shared/firebase"
import WorkflowRunSelector, { statusColors } from "./WorkflowRunSelector"
import { TbX } from "react-icons/tb"


export default function RunsActivity() {

    const theme = useMantineTheme()

    const workflowId = useWorkflowId()
    const runs = useWorkflowRecentRuns(undefined, Infinity)

    const [selectedRunId, setSelectedRunId] = useState()
    const [selectedRun, setSelectedRun] = useEditorStoreProperty("selectedRun")

    useEffect(() => {
        setSelectedRun(runs?.find(run => run.id === selectedRunId))
    }, [runs, selectedRunId])

    const clipboard = useClipboard()

    const runLabel = selectedRunId?.slice(0, 3).toUpperCase()
    const runStatusColor = statusColors[selectedRun?.status]

    const [runManually, runManuallyQuery] = useAPI(API_ROUTE.RUN_WORKFLOW_MANUALLY, {
        workflowId: workflowId,
        triggerData: selectedRun?.triggerData,
    }, {
        onSuccess: ({ workflowRunId }) => {
            setSelectedRunId(workflowRunId)
        },
    })

    return (
        <Stack className="p-xs relative">
            <div
                className="bg-gray-50 rounded-sm base-border p-2"
            // className="bg-gray-50 rounded-sm base-border p-2 sticky top-xs z-20"
            >
                {selectedRunId ?
                    <Stack className="gap-xs">
                        <Group position="apart" noWrap align="flex-start">
                            <div>
                                <Text onClick={() => clipboard.copy(selectedRunId)} >
                                    Run <span className="text-primary font-bold">{runLabel}</span>
                                </Text>
                                <Text size="xs" color="dimmed">
                                    Hover over an output to see its value
                                </Text>
                            </div>

                            <Tooltip label="Deselect Run" withinPortal>
                                <ActionIcon size="sm" onClick={() => setSelectedRunId(undefined)}>
                                    <TbX />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                        <Table>
                            <tbody className="[&_td]:!py-1">
                                <tr>
                                    <td className="font-bold">Status</td>
                                    <td
                                        className="font-bold text-right"
                                        style={{ color: theme.fn.themeColor(runStatusColor) }}
                                    >
                                        {selectedRun?.status}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-bold">Date</td>
                                    <td className="text-right">
                                        {selectedRun?.queuedAt.toDate().toLocaleString(undefined, {
                                            dateStyle: "short",
                                        })}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-bold">Time</td>
                                    <td className="text-right">
                                        {selectedRun?.queuedAt.toDate().toLocaleString(undefined, {
                                            timeStyle: "short",
                                        })}
                                    </td>
                                </tr>
                                {isStatusFinished(selectedRun?.status) &&
                                    <tr>
                                        <td className="font-bold">Duration</td>
                                        <td className="text-right">
                                            {durationSeconds(selectedRun?.queuedAt.toDate(), selectedRun?.finishedAt.toDate())}
                                        </td>
                                    </tr>}
                            </tbody>
                        </Table>

                        <Stack className="gap-2">
                            <Button
                                size="xs" compact loading={runManuallyQuery.isLoading}
                                onClick={() => runManually()}
                            >
                                Re-Run
                            </Button>
                            <Button
                                size="xs" compact variant="subtle"
                                onClick={() => setSelectedRunId(undefined)}
                            >
                                Deselect
                            </Button>
                        </Stack>
                    </Stack> :
                    <Text className="text-center text-gray text-xs">
                        No run selected
                    </Text>}
            </div>
            <WorkflowRunSelector
                closeOnSelect value={selectedRunId} onChange={setSelectedRunId}
            >
                <div />
            </WorkflowRunSelector>
        </Stack>
    )
}
