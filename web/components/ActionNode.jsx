import { ActionIcon, Group, Indicator, Menu, Stack, Text, Tooltip, useMantineTheme } from "@mantine/core"
import { CLICK_OUTSIDE_PD_TS, HANDLE_TYPE, INPUT_MODE, RF_STORE_PROPERTIES } from "@web/modules/constants"
import { useDefinition, useNodeHasValidationErrors, useNodeProperty, useStoreProperty, useUpdateInternals } from "@web/modules/nodes"
import classNames from "classnames"
import { useEffect, useMemo } from "react"
import { TbAdjustments, TbChevronDown, TbPlayerPlay, TbRefresh } from "react-icons/tb"
import { Position, Handle as RFHandle } from "reactflow"
import ConfigureNodeModal from "./config-modal/ConfigureNodeModal"


export default function ActionNode({ id, data, selected }) {

    const definition = useDefinition()
    const displayName = data.name || definition?.name

    const [, setConfiguringNodeId] = useStoreProperty(RF_STORE_PROPERTIES.NODE_BEING_CONFIGURED)
    const openNodeConfiguration = () => setConfiguringNodeId(id)

    const hasValidationErrors = useNodeHasValidationErrors(id)

    const shownInputs = useMemo(() => data.inputs?.filter(
        input => input.mode == INPUT_MODE.HANDLE &&
            !input.hidden
    ), [data.inputs])

    const shownOutputs = useMemo(() => data.outputs?.filter(
        output => !output.hidden
    ), [data.outputs])

    return (
        <div className="relative">
            {definition ?
                <div
                    className={classNames({
                        "rounded": true,
                        "outline outline-2 outline-primary-300 outline-offset-2": selected,
                        "hover:outline hover:outline-2 hover:outline-primary-200 hover:outline-offset-2": !selected,
                    })}
                >
                    <div className={classNames({
                        "flex flex-col min-w-[16rem] max-w-[32rem] rounded transition-shadow outline outline-1 outline-gray-300 bg-white": true,
                        "shadow-md": selected,
                        "shadow-sm": !selected,
                    })}>
                        <Group
                            position="apart"
                            bg={definition?.color}
                            className="text-white px-xs py-1 rounded-t"
                        >
                            <Tooltip label={definition?.name} disabled={displayName == definition?.name} withinPortal>
                                <Group spacing="xs">
                                    {definition.icon &&
                                        <definition.icon />}
                                    <Text className="text-sm font-semibold">{displayName}</Text>
                                </Group>
                            </Tooltip>

                            <Group noWrap className="gap-1">
                                <Group noWrap className="gap-[0.0625rem] nodrag">
                                    <Tooltip label="Run with fresh data" withinPortal>
                                        <ActionIcon
                                            size="sm"
                                            className="rounded-r-none bg-dark bg-opacity-25 hover:bg-dark hover:bg-opacity-50 text-gray-100"
                                        >
                                            <TbPlayerPlay />
                                        </ActionIcon>
                                    </Tooltip>
                                    <Menu withinPortal shadow="sm" position="bottom-end" clickOutsideEvents={CLICK_OUTSIDE_PD_TS}>
                                        <Menu.Target>
                                            <ActionIcon
                                                size="sm"
                                                className="rounded-l-none w-3 min-w-0 bg-dark bg-opacity-25 hover:bg-dark hover:bg-opacity-50 text-gray-100"
                                            >
                                                <TbChevronDown />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Item icon={<TbPlayerPlay />}>
                                                Run with fresh data
                                            </Menu.Item>
                                            <Menu.Item icon={<TbRefresh />}>
                                                Run with most recent data
                                            </Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>
                                </Group>

                                <Tooltip label="Configure" withinPortal>
                                    <Indicator color="yellow" disabled={!hasValidationErrors}>
                                        <ActionIcon
                                            size="sm"
                                            className="nodrag bg-dark bg-opacity-25 hover:bg-dark hover:bg-opacity-50 text-gray-100"
                                            onClick={openNodeConfiguration}
                                        >
                                            <TbAdjustments />
                                        </ActionIcon>
                                    </Indicator>
                                </Tooltip>
                            </Group>
                        </Group>
                        <Group
                            align="stretch" position="apart" noWrap
                            className="py-xs -mx-2"
                        >
                            <Stack className="gap-2">
                                <Text color="dimmed" fz="xs" px="lg">
                                    Inputs
                                </Text>
                                {shownInputs?.map(input =>
                                    <Handle {...input} type={HANDLE_TYPE.INPUT} key={input.id} />
                                )}
                            </Stack>
                            <Stack className="gap-2">
                                <Text color="dimmed" fz="xs" ta="end" px="lg">
                                    Outputs
                                </Text>
                                {shownOutputs?.map(output =>
                                    <Handle {...output} type={HANDLE_TYPE.OUTPUT} key={output.id} />
                                )}
                            </Stack>
                        </Group>
                    </div>
                    <ConfigureNodeModal />
                </div > :
                <Fallback />}

            <UpdateInternals />
        </div>
    )
}


function Handle({ id, name, type, definition: defId }) {

    const theme = useMantineTheme()
    const nodeDefinition = useDefinition()

    let definition
    switch (type) {
        case HANDLE_TYPE.INPUT:
            definition = nodeDefinition?.inputs?.[defId]
            break
        case HANDLE_TYPE.OUTPUT:
            definition = nodeDefinition?.outputs?.[defId]
            break
    }

    return (
        <div>
            <RFHandle
                id={id}
                type={type}
                position={type == HANDLE_TYPE.INPUT ? Position.Left : Position.Right}
                className="!relative !transform-none !inset-0 !w-auto !h-auto flex !rounded-full !border-solid !border-1 transition-colors text-dark-400 !bg-gray-50 !border-gray-300 hover:!text-[var(--main-color)] hover:!bg-[var(--light-color)] hover:!border-[var(--main-color)]"
                style={{
                    "--main-color": theme.fn.themeColor(nodeDefinition?.color, 7),
                    "--light-color": theme.fn.themeColor(nodeDefinition?.color, 1),
                }}
            >
                <Group
                    noWrap
                    className={classNames({
                        "w-full pointer-events-none gap-1 px-3": true,
                        "flex-row-reverse": type == HANDLE_TYPE.OUTPUT,
                    })}
                >
                    {/* {definition.showHandleIcon && definition.icon &&
                        <definition.icon size="0.7rem" color="currentColor" />} */}

                    <Text className="text-xs text-current line-clamp-1">
                        {name || definition?.name}
                    </Text>
                </Group>
            </RFHandle>
        </div>
    )
}


function Fallback() {
    return (
        <Text className="w-40 shadow-sm bg-gray-100 rounded p-xs" ta="center">
            This node is having problems.
        </Text>
    )
}


function UpdateInternals() {

    const updateInternals = useUpdateInternals()

    const [inputs] = useNodeProperty(undefined, "data.inputs")
    const [outputs] = useNodeProperty(undefined, "data.outputs")

    const checksum = useMemo(
        () => `${inputs?.map(input => `${input.hidden}${input.mode}`).join()}` +
            `${outputs?.map(output => `${output.hidden}`).join()}`,
        [inputs, outputs]
    )

    useEffect(() => {
        updateInternals()
    }, [checksum])
}