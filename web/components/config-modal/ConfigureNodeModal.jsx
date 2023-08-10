import { ActionIcon, Grid, Group, Modal, Stack, Tabs, Text } from "@mantine/core"
import { GRAPH_DELETE_KEYS } from "@web/modules/constants"
import { useEditorStoreProperty } from "@web/modules/editor-store"
import { useNodeInputs, useNodeOutputs } from "@web/modules/graph/interfaces"
import { useDefinition, useNodeProperty } from "@web/modules/graph/nodes"
import { useState } from "react"
import { TbAdjustments, TbX } from "react-icons/tb"
import { useNodeId } from "reactflow"
import EditableText from "../EditableText"
import { InputConfig, OutputConfig } from "./InterfaceConfig"
import { InputGroup, OutputGroup } from "./InterfaceGroup"
import { InputRow, OutputRow } from "./InterfaceRow"
import InterfacesList from "./InterfacesList"


export default function ConfigureNodeModal() {

    const id = useNodeId()

    const [configuringNodeId, setConfiguringNodeId] = useEditorStoreProperty("nodeBeingConfigured")
    const opened = configuringNodeId === id
    const close = () => setConfiguringNodeId(null)

    const definition = useDefinition()
    const [name, setName] = useNodeProperty(undefined, "data.name")

    const displayName = name || definition?.name

    const [selectedInterface, setSelectedInterface] = useState(null)

    return (
        <Modal
            opened={opened} withCloseButton={false} onClose={close} centered size="65rem"
            overlayProps={{ opacity: 0.25 }}
            classNames={{
                body: "p-0 h-full",
                content: "max-w-[90%] max-h-[90%] h-[30rem]"
            }}
            // THIS!!! solves that horrible bug where the node gets deleted when you press
            // Ctrl+Backspace to delete a word in the text input
            onKeyDown={ev => {
                if (GRAPH_DELETE_KEYS.includes(ev.key))
                    ev.stopPropagation()
            }}
            // Prevent graph paste events while the modal is open
            onPaste={ev => ev.stopPropagation()}
        >
            <div className="h-full flex flex-col rounded outline outline-1 outline-gray-300">
                <Group
                    position="apart"
                    bg={definition?.color}
                    className="text-white px-xs py-1 rounded-t"
                >
                    <Group spacing="xs">
                        {definition?.icon &&
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

                <Grid gutter={0} className="grow">
                    <Grid.Col span={3} className="border-solid border-0 border-r-1 border-gray-300">
                        <Tabs defaultValue="inputs" classNames={{
                            root: "h-full flex flex-col items-stretch",
                            panel: "grow"
                        }}>
                            <Tabs.List grow>
                                <Tabs.Tab value="inputs">
                                    Inputs
                                </Tabs.Tab>
                                <Tabs.Tab value="outputs">
                                    Outputs
                                </Tabs.Tab>
                            </Tabs.List>

                            <Tabs.Panel value="inputs">
                                <InterfacesList
                                    dataKey="inputs" rowComponent={InputRow} groupComponent={InputGroup}
                                    selectedInterface={selectedInterface} setSelectedInterface={setSelectedInterface}
                                />
                            </Tabs.Panel>

                            <Tabs.Panel value="outputs">
                                <InterfacesList
                                    dataKey="outputs" rowComponent={OutputRow} groupComponent={OutputGroup}
                                    selectedInterface={selectedInterface} setSelectedInterface={setSelectedInterface}
                                />
                            </Tabs.Panel>
                        </Tabs>
                    </Grid.Col>
                    <Grid.Col span={9}>
                        {selectedInterface ?
                            <ConfigSection
                                selectedInterface={selectedInterface}
                                setSelectedInterface={setSelectedInterface}
                                key={selectedInterface.id}
                            /> :
                            <Group className="h-full pb-xl text-gray-400 font-medium text-lg" position="center">
                                <TbAdjustments className="text-2xl" />
                                <Text>
                                    Select an input or output to configure
                                </Text>
                            </Group>}
                    </Grid.Col>
                </Grid>
            </div>
        </Modal>
    )
}


function ConfigSection({ selectedInterface, setSelectedInterface }) {

    const inputs = useNodeInputs()
    const outputs = useNodeOutputs()

    if (inputs?.find(input => input.id == selectedInterface?.id))
        return <InputConfig input={selectedInterface} setSelectedInterface={setSelectedInterface} />

    if (outputs?.find(output => output.id == selectedInterface?.id))
        return <OutputConfig output={selectedInterface} setSelectedInterface={setSelectedInterface} />
}