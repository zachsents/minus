import { Button, Divider, Grid, Group, NumberInput, Popover, Select, Stack, Text, TextInput, Textarea } from "@mantine/core"
import { TbBrandGmail, TbRun } from "react-icons/tb"


export default function TriggerBar() {


    return (
        <Group position="apart" className="px-sm py-2 base-border">
            <Group>
                <Text className="font-semibold">
                    Trigger
                </Text>
                <Divider orientation="vertical" />
                <Group spacing="xs">
                    <TbBrandGmail className="text-red" />
                    <Text>
                        When an email is received
                    </Text>
                </Group>

                <Button variant="subtle" radius="xl" size="xs" color="gray" compact>
                    Change Trigger
                </Button>
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
