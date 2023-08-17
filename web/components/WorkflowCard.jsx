import { ActionIcon, Button, Card, Group, Stack, Text } from "@mantine/core"
import { useWorkflow } from "@web/modules/workflows"
import classNames from "classnames"
import TimeAgo from "javascript-time-ago"
import Link from "next/link"
import { TbArrowRight, TbBrandGmail, TbDotsVertical } from "react-icons/tb"
import ActiveUsersGroup from "./ActiveUsersGroup"
import CenteredLoader from "./CenteredLoader"


export default function WorkflowCard({ id, className }) {

    const [workflow] = useWorkflow(id)

    return workflow !== null ?
        <Card
            withBorder
            className={classNames("group cursor-pointer py-xs px-md shadow-sm hover:bg-primary-50", className)}
            component={Link} href={`/workflows/${id}`}
        >
            {workflow !== undefined ?
                <Stack className="gap-1 h-full">
                    <Group spacing="xs" className="text-xs">
                        <TbBrandGmail className="text-red" />
                        <Text >
                            When an email is received
                        </Text>
                    </Group>

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


export function WorkflowCardRow({ id, className }) {

    const [workflow] = useWorkflow(id)

    return workflow !== null ?
        <Group align="stretch">
            <Card
                withBorder
                className={classNames("group flex-1 cursor-pointer py-xs px-md shadow-sm hover:bg-primary-50", className)}
                component={Link} href={`/workflows/${id}/edit`}
            >
                {workflow !== undefined ?
                    <Group position="apart" align="stretch">
                        <Stack className="gap-1 h-full">
                            <Group spacing="xs" className="text-xs">
                                <TbBrandGmail className="text-red" />
                                <Text>
                                    When an email is received
                                </Text>
                            </Group>
                            <Text className="font-bold leading-5 line-clamp-2">
                                {workflow?.name}
                            </Text>
                            <Text fz="xs" color="dimmed">
                                {workflow?.lastEditedAt ?
                                    `Last edited ${new TimeAgo("en-US").format(workflow.lastEditedAt.toDate())}` :
                                    "Never edited"}
                            </Text>
                        </Stack>
                        <Stack align="flex-end" justify="space-between">
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
                    </Group> :
                    <CenteredLoader />}
            </Card>

            <ActionIcon variant="light" className="max-h-auto h-auto">
                <TbDotsVertical />
            </ActionIcon>
        </Group> :
        <Card withBorder shadow="sm" className={className}>
            <Text ta="center" p="xs">
                This workflow doesn&apos;t exist.
            </Text>
        </Card>
}