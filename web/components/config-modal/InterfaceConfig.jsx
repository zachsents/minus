import { Accordion, ActionIcon, Alert, Badge, Button, Group, Menu, Stack, Switch, Text, Tooltip } from "@mantine/core"
import { DEFAULT_INPUT_CONFIG_VALIDATION_ERROR, INPUT_MODE, INPUT_MODE_DESCRIPTIONS } from "@web/modules/constants"
import { useInputProperty, useInputValidation, useInterfaceProperty } from "@web/modules/graph/interfaces"
import { useDefinition, useNodeProperty } from "@web/modules/graph/nodes"
import { produce } from "immer"
import { useMemo } from "react"
import { TbAlertTriangle, TbDots, TbEye, TbEyeOff, TbForms, TbFunction, TbTrash } from "react-icons/tb"
import EditableText from "../EditableText"
import ScrollBox from "../ScrollBox"
import TransformersConfig from "./TransformersConfig"


function InterfaceConfig({ children, interf, type, dataKey, setSelectedInterface, titleRightSection }) {

    const nodeDefinition = useDefinition()
    const definition = nodeDefinition?.[dataKey][interf.definition]

    const [name, setName] = useInterfaceProperty(undefined, dataKey, interf.id, "name")
    const [hidden, setHidden] = useInterfaceProperty(undefined, dataKey, interf.id, "hidden")

    return (
        <div className="h-full flex flex-col items-stretch">
            <Group position="apart" noWrap className="p-xs border-solid border-0 border-b-1 border-gray-300">
                <Stack className="gap-1" align="flex-start">
                    <Group noWrap spacing="xs" className="text-sm">
                        <Badge radius="sm" variant="filled" className="line-clamp-none">
                            {type}
                        </Badge>

                        {definition?.nameEditable ?
                            <EditableText
                                value={name ?? definition?.name} onChange={setName}
                            >
                                <Group noWrap className="gap-1 flex-1">
                                    <Text span fw="bold" className="line-clamp-1">{name}</Text>
                                    <Text span color="dimmed"> ({definition?.name})</Text>
                                </Group>
                            </EditableText> :
                            <Text fw="bold" className="line-clamp-1">
                                {definition?.name}
                            </Text>}

                        {titleRightSection}
                    </Group>

                    <Text color="dimmed" fz="xs">
                        {definition?.dynamicDescription ?
                            <definition.dynamicDescription {...{ [type]: interf }} /> :
                            definition?.description}
                    </Text>

                    {definition?.required && <Badge color="yellow" radius="sm" size="xs">Required</Badge>}
                </Stack>

                <Group noWrap>
                    {definition?.group &&
                        <ConfigGroupControls
                            interf={interf} dataKey={dataKey}
                            onDelete={() => setSelectedInterface(null)}
                        />}

                    <Menu position="bottom-end" withinPortal shadow="sm">
                        <Menu.Target>
                            <ActionIcon>
                                <TbDots />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            {hidden ?
                                <Menu.Item icon={<TbEye />} onClick={() => setHidden(false)}>
                                    Show
                                </Menu.Item> :
                                <Menu.Item
                                    icon={<TbEyeOff />} onClick={() => setHidden(true)}
                                    disabled={definition?.required}
                                >
                                    Hide
                                </Menu.Item>}
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Group>

            {hidden ?
                <Group className="bg-gray-100 px-sm py-1" spacing="xs">
                    <TbEyeOff className="text-gray" />
                    <Text fz="xs" color="dimmed">This input is hidden.</Text>
                    <Button
                        size="xs" compact variant="subtle" color="gray"
                        onClick={() => setHidden(false)}
                    >
                        Show?
                    </Button>
                </Group> :
                <ScrollBox insideFlex>
                    <Stack className="p-xs">
                        {children}

                        <Accordion>
                            <Accordion.Item value="advanced">
                                <Accordion.Control className="text-xs text-gray px-xs">
                                    Advanced Settings
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <Stack spacing="xs">
                                        <TransformersConfig interfaceId={interf.id} dataKey={dataKey} />
                                    </Stack>
                                </Accordion.Panel>
                            </Accordion.Item>
                        </Accordion>
                    </Stack>
                </ScrollBox>}
        </div>
    )
}


export function InputConfig({ input, setSelectedInterface }) {

    const nodeDefinition = useDefinition()
    const definition = nodeDefinition?.inputs[input.definition]

    const [mode, setMode] = useInputProperty(undefined, input.id, "mode")

    const error = useInputValidation(undefined, input.id)

    const canBeHandle = definition?.allowedModes.includes(INPUT_MODE.HANDLE)
    const canBeConfig = definition?.allowedModes.includes(INPUT_MODE.CONFIGURATION)
    const canBeHandleOrConfig = [INPUT_MODE.CONFIGURATION, INPUT_MODE.HANDLE].every(mode => definition?.allowedModes.includes(mode))

    return (
        <InterfaceConfig
            interf={input} dataKey="inputs" type="input"
            setSelectedInterface={setSelectedInterface}
        >
            {error &&
                <Alert color="yellow" icon={<TbAlertTriangle />}>
                    {typeof error === "string" ? error : DEFAULT_INPUT_CONFIG_VALIDATION_ERROR}
                </Alert>}

            {canBeHandleOrConfig &&
                <Switch
                    label="Show as a dynamic input"
                    description={INPUT_MODE_DESCRIPTIONS[mode]}
                    checked={mode == INPUT_MODE.HANDLE}
                    onChange={() => setMode(mode == INPUT_MODE.HANDLE ? INPUT_MODE.CONFIGURATION : INPUT_MODE.HANDLE)}
                />}

            <Stack className="gap-1">
                <Group spacing="xs">
                    <Text className="text-sm">Value</Text>

                    {canBeHandle && mode != INPUT_MODE.HANDLE &&
                        <Tooltip label="Insert dynamically as an input">
                            <ActionIcon onClick={() => setMode(INPUT_MODE.HANDLE)}>
                                <TbFunction />
                            </ActionIcon>
                        </Tooltip>}

                    {canBeConfig && mode != INPUT_MODE.CONFIGURATION &&
                        <Tooltip label="Assign a fixed value">
                            <ActionIcon onClick={() => setMode(INPUT_MODE.CONFIGURATION)}>
                                <TbForms />
                            </ActionIcon>
                        </Tooltip>}
                </Group>

                {mode == INPUT_MODE.CONFIGURATION && definition?.renderConfiguration &&
                    <definition.renderConfiguration inputId={input.id} definition={definition} />}
            </Stack>
        </InterfaceConfig>
    )
}


export function OutputConfig({ output, setSelectedInterface }) {

    // const nodeDefinition = useDefinition()
    // const definition = nodeDefinition?.outputs[output.definition]

    return (
        <InterfaceConfig
            interf={output} dataKey="outputs" type="output"
            setSelectedInterface={setSelectedInterface}
        >
        </InterfaceConfig>
    )
}



function ConfigGroupControls({ interf, dataKey, onDelete }) {

    const nodeDefinition = useDefinition()
    const definition = nodeDefinition?.[dataKey][interf.definition]
    const [interfaces, setInterfaces] = useNodeProperty(undefined, `data.${dataKey}`)

    const canBeDeleted = useMemo(
        () => definition?.group &&
            interfaces?.filter(i => i.definition == interf.definition).length > definition?.groupMin,
        [definition?.group, interfaces, interf]
    )

    const deleteInterface = () => setInterfaces(produce(interfaces, draft => {
        const index = draft.findIndex(i => i.id == interf.id)
        draft.splice(index, 1)
        onDelete?.()
    }))

    return (
        <Group spacing="xs">
            {canBeDeleted &&
                <Button
                    onClick={deleteInterface}
                    size="sm" compact variant="subtle" color="red" leftIcon={<TbTrash />}
                >
                    Delete Input
                </Button>}
        </Group>
    )
}