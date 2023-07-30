import { ActionIcon, Grid, Group, Menu, Modal, Stack, Text, Tooltip } from "@mantine/core"
import { INPUT_MODE, RF_STORE_PROPERTIES } from "@web/modules/constants"
import { useDefinition, useNodeProperty, useStoreProperty } from "@web/modules/nodes"
import classNames from "classnames"
import { TbDots, TbEyeOff, TbForms, TbFunction, TbTrash, TbX } from "react-icons/tb"
import { useNodeId } from "reactflow"
import EditableText from "./EditableText"


export default function ConfigureNodeModal() {

    const id = useNodeId()

    const [configuringNodeId, setConfiguringNodeId] = useStoreProperty(RF_STORE_PROPERTIES.NODE_BEING_CONFIGURED)
    const opened = configuringNodeId === id
    const close = () => setConfiguringNodeId(null)

    const definition = useDefinition()
    const [name, setName] = useNodeProperty(undefined, "data.name")

    const displayName = name || definition?.name

    return (
        <Modal
            opened={opened} withCloseButton={false} onClose={close} centered size="xl"
            overlayProps={{ opacity: 0.25 }}
            classNames={{ body: "p-0" }}
        >
            <div className="flex flex-col rounded outline outline-1 outline-gray-300">
                <Group
                    position="apart"
                    bg={definition?.color}
                    className="text-white px-xs py-1 rounded-t"
                >
                    <Group spacing="xs">
                        {definition.icon &&
                            <definition.icon />}

                        <Stack spacing={0}>
                            <EditableText
                                value={displayName} onChange={setName}
                                classNames={{ group: "hover:!bg-dark hover:!bg-opacity-25" }}
                            >
                                <Text className="font-semibold">{displayName}</Text>
                            </EditableText>

                            {displayName != definition?.name &&
                                <Text size="xs" mx="xs" color="gray.2">{definition?.name}</Text>}
                        </Stack>
                    </Group>

                    <Group>
                        <ActionIcon
                            size="sm"
                            className="nodrag bg-dark bg-opacity-25 hover:bg-dark hover:bg-opacity-50 text-gray-100"
                            onClick={close}
                        >
                            <TbX />
                        </ActionIcon>
                    </Group>
                </Group>

                <Grid gutter={0}>
                    <Grid.Col span={3} className="border-solid border-0 border-r-1 border-gray-300">
                        <TitleBar>Inputs</TitleBar>
                        <InputsSection />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TitleBar>Configuration</TitleBar>
                        <ConfigSection />
                    </Grid.Col>
                    <Grid.Col span={3} className="border-solid border-0 border-l-1 border-gray-300">
                        <TitleBar>Outputs</TitleBar>

                    </Grid.Col>
                </Grid>
            </div>
        </Modal>
    )
}


const TitleBar = ({ children }) => <Text className="p-xs text-sm text-dark-300 border-solid border-0 border-b-1 border-gray-300 font-bold">
    {children}
</Text>


function InputsSection() {

    // const definition = useDefinition()
    // const inputDefs = useMemo(
    //     () => Object.entries(definition?.inputs || {})
    //         .map(([id, def]) => ({ id, ...def })),
    //     [definition?.inputs]
    // )

    const [inputs] = useNodeProperty(undefined, "data.inputs")
    const shownInputs = inputs?.filter(input => input.mode == INPUT_MODE.HANDLE)

    return (
        <Stack spacing={0}>
            {shownInputs?.map((input, i) =>
                <InputRow
                    input={input}
                    index={i}
                    key={input.id}
                />
            )}
        </Stack>
    )
}


function InputRow({ input, index }) {

    const nodeDefinition = useDefinition()
    const definition = nodeDefinition?.inputs[input.definition]

    const [, setMode] = useNodeProperty(undefined, `data.inputs.${index}.mode`)

    return (
        <Group position="apart" className="p-2">
            <Text className="text-sm">
                {definition?.name}
            </Text>

            <Group spacing={0}>
                <Tooltip label="Assign a fixed value">
                    <ActionIcon onClick={() => setMode(INPUT_MODE.CONFIGURATION)}>
                        <TbForms />
                    </ActionIcon>
                </Tooltip>

                <Menu withinPortal>
                    <Menu.Target>
                        <ActionIcon>
                            <TbDots />
                        </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Item icon={<TbEyeOff />}>
                            Hide
                        </Menu.Item>
                        <Menu.Item icon={<TbTrash />} disabled>
                            Delete
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>
        </Group>
    )
}


function ConfigSection() {

    const [inputs] = useNodeProperty(undefined, "data.inputs")
    const shownInputs = inputs?.filter(input => input.mode == INPUT_MODE.CONFIGURATION)

    return (
        <Stack spacing={0}>
            {shownInputs?.map((input, i) =>
                <ConfigRow
                    input={input}
                    index={i}
                    key={input.id}
                />
            )}
        </Stack>
    )
}


function ConfigRow({ input, index }) {

    const nodeDefinition = useDefinition()
    const definition = nodeDefinition?.inputs[input.definition]

    const hasDescription = !!definition?.description

    const [, setMode] = useNodeProperty(undefined, `data.inputs.${index}.mode`)

    return (
        <Stack spacing="xs" className="p-2">
            <Group position="apart">
                <Tooltip label={definition?.description} disabled={!hasDescription}>
                    <Text className={classNames({
                        "text-sm": true,
                        "underline decoration-dashed underline-offset-2 decoration-gray hover:decoration-dark": hasDescription,
                    })}>
                        {definition?.name}
                    </Text>
                </Tooltip>

                <Group spacing={0}>
                    <Tooltip label="Assign a fixed value">
                        <ActionIcon onClick={() => setMode(INPUT_MODE.HANDLE)}>
                            <TbFunction />
                        </ActionIcon>
                    </Tooltip>

                    <Menu withinPortal>
                        <Menu.Target>
                            <ActionIcon>
                                <TbDots />
                            </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Item icon={<TbTrash />} disabled>
                                Delete
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Group>

            {definition?.renderConfiguration &&
                <definition.renderConfiguration />}
        </Stack>
    )
}