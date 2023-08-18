import { ActionIcon, Badge, Button, Card, Grid, Group, Menu, Popover, Stack, Text, Tooltip, useMantineTheme } from "@mantine/core"
import { formatDate } from "@web/modules/grammar"
import { preventDefault, stopPropagation } from "@web/modules/props"
import { openImportantConfirmModal } from "@web/modules/util"
import { useCanUserDeleteWorkflow, useDeleteWorkflow, useWorkflow, useWorkflowRecentErrors } from "@web/modules/workflows"
import classNames from "classnames"
import TimeAgo from "javascript-time-ago"
import Link from "next/link"
import { TbArrowRight, TbConfetti, TbConfettiOff, TbDotsVertical, TbTrash } from "react-icons/tb"
import ActiveUsersGroup from "./ActiveUsersGroup"
import CenteredLoader from "./CenteredLoader"
import ProblemCard from "./ProblemCard"


export default function WorkflowCard({ id, className }) {

    const theme = useMantineTheme()

    const [workflow] = useWorkflow(id, true)
    const editUrl = `/workflows/${id}/edit`

    return workflow !== null ?
        <Card
            withBorder
            className={classNames("group cursor-pointer py-xs px-md shadow-sm hover:bg-primary-50", className)}
            component={Link} href={editUrl}
        >
            {workflow !== undefined ?
                <Stack className="gap-1 h-full">
                    {workflow?.trigger ?
                        <Group className="gap-xs text-xs">
                            <workflow.trigger.info.icon style={{
                                color: theme.fn.themeColor(workflow.trigger.info.color, 6)
                            }} />
                            <Text>
                                {workflow.trigger.info.whenName || workflow.trigger.info.name}
                            </Text>
                        </Group> :
                        <Text size="sm" color="dimmed">
                            No trigger set
                        </Text>}

                    <Text className="font-bold leading-5 line-clamp-2">
                        {workflow?.name}
                    </Text>

                    <Text fz="xs" color="dimmed">
                        {workflow?.lastEditedAt ?
                            `Last edited ${new TimeAgo("en-US").format(workflow.lastEditedAt.toDate())}` :
                            "Never edited"}
                    </Text>

                    <Group position="apart" className="flex-1 items-end">
                        <ActiveUsersGroup workflowId={id} showGroupTooltip avatarProps={{ size: "sm" }} />

                        <Button
                            className="pointer-events-none group-hover:bg-primary-800"
                            size="xs" compact rightIcon={
                                <TbArrowRight className="group-hover:translate-x-1 transition-transform" />
                            }
                        >
                            Open
                        </Button>
                    </Group>
                </Stack> :
                <CenteredLoader />}
        </Card> :
        <Card withBorder shadow="sm" className={className}>
            <Text ta="center" p="xs">
                This workflow doesn&apos;t exist.
            </Text>
        </Card>
}


export function WorkflowCardRow({ id, className, highlightParts }) {

    const theme = useMantineTheme()

    const [workflow, updateWorkflow] = useWorkflow(id, true)
    const [erroredRuns, totalErrors] = useWorkflowRecentErrors(id)
    const editUrl = `/workflows/${id}/edit`

    const enable = () => updateWorkflow({ isEnabled: true })
    const disable = () => updateWorkflow({ isEnabled: false })

    const [deleteWorkflow] = useDeleteWorkflow(id)
    const confirmDelete = () => openImportantConfirmModal("delete this workflow", {
        onConfirm: deleteWorkflow,
    })

    const displayName = highlightParts ?
        highlightParts.map((part, i) => i % 2 == 0 ? part : <span className="text-yellow-800" key={i}>{part}</span>) :
        workflow?.name

    const canDelete = useCanUserDeleteWorkflow(id)

    return workflow !== null ?
        <Group align="stretch">
            <Card
                withBorder
                className={classNames("group flex-1 cursor-pointer py-xs px-md shadow-xs hover:bg-primary-50", className)}
                component={Link} href={editUrl}
            >
                {workflow !== undefined ?
                    <Grid>
                        <Grid.Col span="auto">
                            <Stack className="gap-1 h-full justify-center">
                                {workflow?.trigger ?
                                    <Group className="gap-xs text-xs">
                                        <workflow.trigger.info.icon style={{
                                            color: theme.fn.themeColor(workflow.trigger.info.color, 6)
                                        }} />
                                        <Text>
                                            {workflow.trigger.info.whenName || workflow.trigger.info.name}
                                        </Text>
                                    </Group> :
                                    <Text size="sm" color="dimmed">
                                        No trigger set
                                    </Text>}

                                <Text className="font-bold leading-5 line-clamp-2">
                                    {displayName}
                                </Text>
                                <Text fz="xs" color="dimmed">
                                    {workflow?.lastEditedAt ?
                                        `Last edited ${new TimeAgo("en-US").format(workflow.lastEditedAt.toDate())}` :
                                        "Never edited"}
                                </Text>
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span={2}>
                            <Stack className="gap-0 h-full justify-center items-center">
                                <Text className="text-xxs text-gray">Status</Text>
                                <div>
                                    {workflow.isEnabled ?
                                        <Tooltip label="Disable?">
                                            <Badge color="green" radius="sm" {...stopPropagation({
                                                onClick: disable,
                                            }, true)}>
                                                Enabled
                                            </Badge>
                                        </Tooltip> :
                                        <Tooltip label="Enable?" {...stopPropagation({
                                            onClick: enable,
                                        }, true)}>
                                            <Badge color="red" radius="sm">
                                                Disabled
                                            </Badge>
                                        </Tooltip>}
                                </div>
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span={2}>
                            <Stack className="gap-0 h-full justify-center items-center">
                                <Text className="text-xxs text-gray">Last 24 Hours</Text>
                                {totalErrors > 0 ?
                                    <Popover withinPortal withArrow position="bottom" shadow="sm">
                                        <Popover.Target>
                                            <div>
                                                <Badge color="red" radius="sm" {...preventDefault("onClick", true)}>
                                                    {totalErrors} Errors
                                                </Badge>
                                            </div>
                                        </Popover.Target>
                                        <Popover.Dropdown {...preventDefault("onClick", true)}>
                                            <Stack spacing="xs">
                                                {erroredRuns?.flatMap(run => run.errors.map(error =>
                                                    <ProblemCard
                                                        subtitle={formatDate(run.queuedAt)}
                                                        level="error" compact
                                                        key={run.id}
                                                    >
                                                        {error}
                                                    </ProblemCard>
                                                ))}
                                            </Stack>
                                        </Popover.Dropdown>
                                    </Popover> :
                                    <Badge color="green" radius="sm" {...preventDefault("onClick", true)}>
                                        No Errors
                                    </Badge>}
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span={2}>
                            <Stack className="gap-1 h-full justify-between items-end">
                                <ActiveUsersGroup
                                    workflowId={id} showGroupTooltip
                                    avatarProps={{ size: "sm" }}
                                />
                                <Button
                                    className="pointer-events-none group-hover:bg-primary-800"
                                    size="xs" compact rightIcon={
                                        <TbArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    }
                                >
                                    Open
                                </Button>
                            </Stack>
                        </Grid.Col>
                    </Grid> :
                    <CenteredLoader />}
            </Card>

            <Menu position="bottom-end" withArrow shadow="sm">
                <Menu.Target>
                    <ActionIcon variant="light" className="max-h-auto h-auto">
                        <TbDotsVertical />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown miw="12rem">
                    <Menu.Item icon={<TbArrowRight />} component={Link} href={editUrl}>
                        Open
                    </Menu.Item>
                    {workflow?.isEnabled ?
                        <Menu.Item icon={<TbConfettiOff />} color="red" onClick={disable}>
                            Disable
                        </Menu.Item> :
                        <Menu.Item icon={<TbConfetti />} color="green" onClick={enable}>
                            Enable
                        </Menu.Item>}

                    {canDelete && <>
                        <Menu.Divider />

                        <Menu.Item icon={<TbTrash />} onClick={confirmDelete} color="red">
                            Delete
                        </Menu.Item>
                    </>}
                </Menu.Dropdown>
            </Menu>
        </Group> :
        <Card withBorder shadow="sm" className={className}>
            <Text ta="center" p="xs">
                This workflow doesn&apos;t exist.
            </Text>
        </Card>
}