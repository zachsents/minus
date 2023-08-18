import { Button, Divider, Grid, Group, NumberInput, Popover, Select, Stack, Text, TextInput, Textarea, useMantineTheme } from "@mantine/core"
import { useWorkflow } from "@web/modules/workflows"
import { motion } from "framer-motion"
import { TbRun } from "react-icons/tb"


export default function TriggerBar() {

    const theme = useMantineTheme()

    const [workflow] = useWorkflow(null, true)

    return (
        <Group position="apart" className="px-sm py-2 border-solid border-0 border-b-1 border-gray-300">
            <Group>
                <Text className="font-semibold">
                    Trigger
                </Text>
                <Divider orientation="vertical" />
                {workflow?.trigger ?
                    <>
                        <Group spacing="xs">
                            <workflow.trigger.info.icon style={{
                                color: theme.fn.themeColor(workflow.trigger.info.color, 6)
                            }} />
                            <Text>
                                {workflow.trigger.info.whenName}
                            </Text>
                        </Group>
                        <Button variant="subtle" radius="xl" size="xs" color="gray" compact>
                            Change Trigger
                        </Button>
                    </> :
                    <>
                        <Text size="sm" color="dimmed">
                            No trigger set
                        </Text>
                        <Button
                            variant="filled" radius="xl" size="xs" compact
                            component={motion.div} animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: 100 }}
                        >
                            Add Trigger
                        </Button>
                    </>}
            </Group>

            <Popover shadow="sm" position="bottom-end" width="28rem">
                <Popover.Target>
                    <Button compact leftIcon={<TbRun />}>
                        Run Now
                    </Button>
                </Popover.Target>
                <Popover.Dropdown>
                    <Stack>
                        <Select
                            placeholder="Load inputs from a past run"
                            data={["A run"]}
                            value={null}
                        />
                        <Grid align="center">
                            <Grid.Col span={3}>Input 1</Grid.Col>
                            <Grid.Col span={9}>
                                <TextInput placeholder="Some text..." />
                            </Grid.Col>
                            <Grid.Col span={3}>Input 2</Grid.Col>
                            <Grid.Col span={9}>
                                <NumberInput placeholder="Some number..." />
                            </Grid.Col>
                            <Grid.Col span={3}>Input 3</Grid.Col>
                            <Grid.Col span={9}>
                                <Textarea minRows={4} placeholder="A lot of text..." />
                            </Grid.Col>
                        </Grid>
                    </Stack>
                </Popover.Dropdown>
            </Popover>
        </Group>
    )
}
