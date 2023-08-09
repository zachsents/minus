import { ActionIcon, Group, Indicator, Menu, Stack, Text, Tooltip } from "@mantine/core"
import { CLICK_OUTSIDE_PD_TS, CONTROL_MODIFIER_ICONS, CONTROL_MODIFIER_LABELS, HANDLE_TYPE, INPUT_MODE } from "@web/modules/constants"
import { useEditorStoreProperty } from "@web/modules/editor-store"
import { useDefinition, useDisabled, useModifier, useNodeHasValidationErrors, useNodeProperty, useUpdateInternals } from "@web/modules/nodes"
import classNames from "classnames"
import { forwardRef, useEffect, useMemo } from "react"
import { TbAdjustments, TbCheck, TbDots, TbPlayerPlay, TbX } from "react-icons/tb"
import { CONTROL_MODIFIER } from "shared/constants"
import ActionNodeHandle from "./ActionNodeHandle"
import CheckableMenuItem from "./CheckableMenuItem"
import NodeModifierWrapper from "./NodeModifierWrapper"
import ConfigureNodeModal from "./config-modal/ConfigureNodeModal"


export default function ActionNode({ id, data, selected }) {

    const definition = useDefinition()
    const displayName = data.name || definition?.name

    const [, setConfiguringNodeId] = useEditorStoreProperty("nodeBeingConfigured")
    const openNodeConfiguration = () => setConfiguringNodeId(id)

    const hasValidationErrors = useNodeHasValidationErrors(id)

    const shownInputs = useMemo(() => data.inputs?.filter(
        input => input.mode == INPUT_MODE.HANDLE &&
            !input.hidden
    ), [data.inputs])

    const shownOutputs = useMemo(() => data.outputs?.filter(
        output => !output.hidden
    ), [data.outputs])

    const [modifier, setModifier, clearModifier] = useModifier(id)

    const [_disabled, upstreamDisabled, setDisabled, disabledMessage] = useDisabled(id)
    const disabled = upstreamDisabled || _disabled

    return (
        <div className="relative">
            {definition ?
                <Tooltip
                    label={disabledMessage} disabled={!disabledMessage} position="bottom" withinPortal
                    multiline maw="16rem"
                >
                    <div
                        className={classNames({
                            "rounded": true,
                            "outline outline-2 outline-primary-300 outline-offset-2": selected,
                            "hover:outline hover:outline-2 hover:outline-primary-200 hover:outline-offset-2": !selected,
                            "opacity-30": disabled,
                        })}
                    >
                        <div className={classNames({
                            "rounded transition-shadow": true,
                            "shadow-md": selected,
                            "shadow-sm": !selected,
                        })}>
                            <NodeModifierWrapper>
                                <div className="flex flex-col min-w-[16rem] max-w-[32rem] rounded outline outline-1 outline-gray-300 bg-white">
                                    <Group
                                        position="apart"
                                        spacing="xl"
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
                                            {/* <Tooltip label="Run this node" withinPortal>
                                                <ToolbarIcon
                                                    icon={TbPlayerPlay}
                                                />
                                            </Tooltip> */}
                                            <Tooltip label="Configure Inputs/Outputs" withinPortal>
                                                <Indicator color="yellow" disabled={!hasValidationErrors}>
                                                    <ToolbarIcon
                                                        icon={TbAdjustments}
                                                        onClick={openNodeConfiguration}
                                                    />
                                                </Indicator>
                                            </Tooltip>
                                            <Menu clickOutsideEvents={CLICK_OUTSIDE_PD_TS} withinPortal position="bottom-end" shadow="sm" width="16rem">
                                                <Menu.Target>
                                                    <ToolbarIcon icon={TbDots} />
                                                </Menu.Target>
                                                <Menu.Dropdown>
                                                    <Menu.Item icon={<TbAdjustments />} onClick={openNodeConfiguration}>
                                                        Configure Inputs/Outputs
                                                    </Menu.Item>
                                                    <Menu.Item icon={<TbPlayerPlay />} disabled>
                                                        Run this node
                                                    </Menu.Item>
                                                    <CheckableMenuItem
                                                        icon={disabled ? TbX : TbCheck}
                                                        value={!disabled}
                                                        onChange={val => setDisabled(!val)}
                                                        props={{
                                                            checkbox: { disabled: upstreamDisabled },
                                                            menuItem: { disabled: upstreamDisabled },
                                                        }}
                                                    >
                                                        {disabled ? "Disabled" : "Enabled"}
                                                    </CheckableMenuItem>
                                                    <Menu.Label>Control Modifiers</Menu.Label>
                                                    {Object.values(CONTROL_MODIFIER).map(modType =>
                                                        <CheckableMenuItem
                                                            icon={CONTROL_MODIFIER_ICONS[modType]}
                                                            value={modifier?.type == modType}
                                                            onChange={checked => checked ? setModifier(modType) : clearModifier()}
                                                            key={modType}
                                                        >
                                                            {CONTROL_MODIFIER_LABELS[modType]}
                                                        </CheckableMenuItem>
                                                    )}
                                                </Menu.Dropdown>
                                            </Menu>
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
                                                <ActionNodeHandle {...input} type={HANDLE_TYPE.INPUT} key={input.id} />
                                            )}
                                        </Stack>
                                        <Stack className="gap-2">
                                            <Text color="dimmed" fz="xs" ta="end" px="lg">
                                                Outputs
                                            </Text>
                                            {shownOutputs?.map(output =>
                                                <ActionNodeHandle {...output} type={HANDLE_TYPE.OUTPUT} key={output.id} />
                                            )}
                                        </Stack>
                                    </Group>
                                </div>
                            </NodeModifierWrapper>
                        </div>
                        <ConfigureNodeModal />
                    </div >
                </Tooltip> :
                <Fallback />}

            <UpdateInternals />
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


const ToolbarIcon = forwardRef(({ icon: Icon, className, ...props }, ref) =>
    <ActionIcon
        size="sm"
        className={classNames("nodrag bg-dark bg-opacity-25 hover:bg-dark hover:bg-opacity-50 text-gray-100", className)}
        {...props}
        ref={ref}
    >
        <Icon />
    </ActionIcon>
)
ToolbarIcon.displayName = "ToolbarIcon"