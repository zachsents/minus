import { Avatar, Button, Card, Group, Stack, Text, Tooltip } from "@mantine/core"
import classNames from "classnames"
import { TbArrowRight, TbBrandGmail } from "react-icons/tb"


export default function WorkflowCard({ className }) {


    return (
        <Card withBorder className={classNames("group cursor-pointer py-xs px-md shadow-sm hover:bg-primary-50", className)}>
            <Stack className="gap-1 h-full">
                <Group spacing="xs" className="text-xs">
                    <TbBrandGmail className="text-red" />
                    <Text >
                        When an email is received
                    </Text>
                </Group>

                <Text className="font-bold leading-5 line-clamp-2">
                    Handle order confirmation emails
                </Text>

                <Text fz="xs" color="dimmed">
                    Last edited 2 days ago
                </Text>

                <Group position="apart" className="flex-1 items-end">
                    <Tooltip label="3 users online" withinPortal>
                        <Avatar.Group spacing="sm">
                            <Avatar className="rounded-full" size="sm">ZS</Avatar>
                            <Avatar className="rounded-full" size="sm">ZS</Avatar>
                            <Avatar className="rounded-full" size="sm">ZS</Avatar>
                        </Avatar.Group>
                    </Tooltip>
                    <Button
                        className="pointer-events-none group-hover:bg-primary-800"
                        size="xs" compact rightIcon={
                            <TbArrowRight className="group-hover:translate-x-1 transition-transform" />
                        }
                    >
                        Open
                    </Button>
                </Group>
            </Stack>
        </Card>
    )
}
