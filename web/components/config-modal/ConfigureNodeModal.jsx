import { ActionIcon, Alert, Badge, Button, Grid, Group, Menu, Modal, Stack, Switch, Tabs, Text, Tooltip } from "@mantine/core"
import { DEFAULT_INPUT_CONFIG_VALIDATION_ERROR, GRAPH_DELETE_KEYS, INPUT_MODE, INPUT_MODE_DESCRIPTIONS, RF_STORE_PROPERTIES } from "@web/modules/constants"
import { useDefinition, useInputValidation, useNodeProperty, useStoreProperty } from "@web/modules/nodes"
import { uniqueId } from "@web/modules/util"
import classNames from "classnames"
import { produce } from "immer"
import { useMemo, useState } from "react"
import { TbAdjustments, TbAlertTriangle, TbDots, TbEye, TbEyeOff, TbForms, TbFunction, TbPlus, TbSettings, TbSettingsOff, TbTrash, TbX } from "react-icons/tb"
import { useNodeId } from "reactflow"
import EditableText from "../EditableText"
import ScrollBox from "../ScrollBox"
import HandleDefinitionLabel from "./HandleDefinitionLabel"


export default function ConfigureNodeModal() {

    const id = useNodeId()

    const [configuringNodeId, setConfiguringNodeId] = useStoreProperty(RF_STORE_PROPERTIES.NODE_BEING_CONFIGURED)
    const opened = configuringNodeId === id
    const close = () => setConfiguringNodeId(null)

    const definition = useDefinition()
    const [name, setName] = useNodeProperty(undefined, "data.name")

    const displayName = name || definition?.name

    const [selectedHandle, setSelectedHandle] = useState(null)

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
                                <InputsSection selectedHandle={selectedHandle} setSelectedHandle={setSelectedHandle} />
                            </Tabs.Panel>
                        </Tabs>
                    </Grid.Col>
                    <Grid.Col span={9}>
                        {selectedHandle ?
                            <ConfigSection
                                selectedHandle={selectedHandle}
                                setSelectedHandle={setSelectedHandle}
                                key={selectedHandle.id}
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


function InputsSection({ selectedHandle, setSelectedHandle }) {

    const definition = useDefinition()
    const inputDefs = useMemo(
        () => Object.entries(definition?.inputs || {})
            .map(([id, def]) => ({ id, ...def })),
        [definition?.inputs]
    )

    const [inputs] = useNodeProperty(undefined, "data.inputs")

    const inputGroups = useMemo(() => inputDefs.map(def => ({
        definition: def,
        inputs: inputs?.filter(
            input => input.definition == def.id
        ),
    })), [inputDefs, inputs])

    return (
        <ScrollBox offsetScrollbars={false}>
            <Stack spacing={0}>
                {inputGroups.map(group => {
                    const rows = group.inputs.map(input =>
                        <InputRow
                            input={input}
                            selected={selectedHandle?.id == input.id}
                            onSelect={() => setSelectedHandle(input)}
                            onDeselect={() => setSelectedHandle(null)}
                            inGroup={group.definition.group}
                            key={input.id}
                        />
                    )
                    return group.definition.group ?
                        <InputGroup
                            definition={group.definition}
                            onCreate={input => setSelectedHandle(input)}
                            key={group.definition.id}
                        >
                            {rows}
                        </InputGroup> :
                        rows
                })}
            </Stack>
        </ScrollBox>
    )
}


function InputGroup({ children, definition, onCreate }) {

    const [inputs, setInputs] = useNodeProperty(undefined, "data.inputs")

    const canBeAdded = useMemo(
        () => inputs?.filter(i => i.definition == definition.id).length < definition?.groupMax,
        [inputs]
    )

    const createInput = () => setInputs(produce(inputs, draft => {
        const newInput = {
            id: uniqueId(),
            definition: definition?.id,
            mode: definition?.defaultMode,
            name: `New ${definition?.name}`,
        }
        draft.push(newInput)
        onCreate?.(newInput)
    }))

    return (
        <Stack spacing={0} className="border-solid border-0 border-b-1 border-gray-300">
            <div className="flex">
                <HandleDefinitionLabel
                    required={definition?.required}
                    description={definition?.description}
                    label={definition?.groupName || definition?.name}
                    className="pt-2 pb-1 px-2"
                />
            </div>

            {children}

            {!children?.length &&
                <Text className="text-xs text-center my-2" color="dimmed">
                    No inputs.
                </Text>}

            {canBeAdded &&
                <Button
                    onClick={createInput}
                    size="xs" compact variant="subtle" leftIcon={<TbPlus />}
                    className="self-center my-1"
                >
                    New {definition?.name}
                </Button>}
        </Stack>
    )
}


function InputRow({ input, inGroup = false, selected, onSelect, onDeselect }) {

    const nodeDefinition = useDefinition()
    const definition = nodeDefinition?.inputs[input.definition]

    const [hidden] = useNodeProperty(undefined, `data.inputs.id=${input.id}.hidden`)
    const [name] = useNodeProperty(undefined, `data.inputs.id=${input.id}.name`)
    const [mode] = useNodeProperty(undefined, `data.inputs.id=${input.id}.mode`)

    const error = useInputValidation(undefined, input.id)

    return (
        <Group
            position="apart" noWrap
            className={classNames({
                "group p-2 border-solid border-0 border-gray-300 cursor-pointer hover:bg-gray-100": true,
                "!bg-primary-100": selected,
                "border-b-1": !inGroup,
                "pl-4": inGroup,
            })}
            onClick={() => (selected ? onDeselect : onSelect)?.()}
        >
            <HandleDefinitionLabel
                {...!inGroup && {
                    required: definition?.required,
                    description: definition?.description,
                    secondaryLabel: name && definition?.name,
                }}
                icon={definition?.icon}
                hidden={hidden}
                error={error}
                label={name || definition?.name}
                classNames={{
                    label: inGroup && "text-xs",
                    icon: inGroup && "text-xs",
                }}
            />

            <Group className="gap-2 text-gray shrink-0 group-hover:hidden">
                {mode == INPUT_MODE.HANDLE && <TbFunction className="text-blue" />}
                {hidden && <TbEyeOff />}
            </Group>

            {selected ?
                <TbSettingsOff className="text-gray shrink-0 hidden group-hover:block" /> :
                <TbSettings className="text-gray shrink-0 hidden group-hover:block" />}
        </Group>
    )
}


function ConfigSection({ selectedHandle, setSelectedHandle }) {

    const [inputs] = useNodeProperty(undefined, "data.inputs")
    // const [outputs] = useNodeProperty(undefined, "data.outputs")

    if (inputs?.find(input => input.id == selectedHandle?.id))
        return <InputConfigSection input={selectedHandle} setSelectedHandle={setSelectedHandle} />

    // if (outputs?.find(output => output.id == selectedHandle?.id))
    //     return <OutputConfigSection output={selectedHandle} />
}


function InputConfigSection({ input, setSelectedHandle }) {

    const nodeDefinition = useDefinition()
    const definition = nodeDefinition?.inputs[input.definition]

    const [name, setName] = useNodeProperty(undefined, `data.inputs.id=${input.id}.name`)
    const [hidden, setHidden] = useNodeProperty(undefined, `data.inputs.id=${input.id}.hidden`)
    const [mode, setMode] = useNodeProperty(undefined, `data.inputs.id=${input.id}.mode`)

    const error = useInputValidation(undefined, input.id)

    const canBeHandle = definition?.allowedModes.includes(INPUT_MODE.HANDLE)
    const canBeConfig = definition?.allowedModes.includes(INPUT_MODE.CONFIGURATION)
    const canBeHandleOrConfig = [INPUT_MODE.CONFIGURATION, INPUT_MODE.HANDLE].every(mode => definition?.allowedModes.includes(mode))

    return (
        <div className="h-full flex flex-col items-stretch">
            <Group position="apart" noWrap className="p-xs border-solid border-0 border-b-1 border-gray-300">
                <Group noWrap spacing="xs" className="text-sm">
                    {definition?.nameEditable ?
                        <EditableText
                            value={name ?? definition?.name} onChange={setName}
                        >
                            <Group noWrap className="gap-1">
                                <Text span fw="bold" lineClamp={1}>{name}</Text>
                                <Text span color="dimmed"> ({definition?.name})</Text>
                            </Group>
                        </EditableText> :
                        <Text fw="bold">
                            {definition?.name}
                        </Text>}

                    {definition?.required &&
                        <Badge>Required</Badge>}
                </Group>

                <Group noWrap>
                    {definition?.group &&
                        <InputConfigGroupControls input={input} onDelete={() => setSelectedHandle(null)} />}

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

                            <Text color="dimmed" fz="xs">
                                {definition?.dynamicDescription ?
                                    <definition.dynamicDescription input={input} /> :
                                    definition?.description}
                            </Text>

                            {mode == INPUT_MODE.CONFIGURATION && definition?.renderConfiguration &&
                                <definition.renderConfiguration inputId={input.id} definition={definition} />}
                        </Stack>
                    </Stack>
                </ScrollBox>}
        </div>
    )
}


function InputConfigGroupControls({ input, onDelete }) {

    const nodeDefinition = useDefinition()
    const definition = nodeDefinition?.inputs[input.definition]
    const [inputs, setInputs] = useNodeProperty(undefined, "data.inputs")

    const canBeDeleted = useMemo(
        () => definition?.group &&
            inputs?.filter(i => i.definition == input.definition).length > definition?.groupMin,
        [definition?.group, inputs, input]
    )

    const deleteInput = () => setInputs(produce(inputs, draft => {
        const index = draft.findIndex(i => i.id == input.id)
        draft.splice(index, 1)
        onDelete?.()
    }))

    return (
        <Group spacing="xs">
            {canBeDeleted &&
                <Button
                    onClick={deleteInput}
                    size="sm" compact variant="subtle" color="red" leftIcon={<TbTrash />}
                >
                    Delete Input
                </Button>}
        </Group>
    )
}


// function OutputConfigSection({ output }) {

// }

