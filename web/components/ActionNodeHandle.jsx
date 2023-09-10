import { ActionIcon, Group, Stack, Table, Text, Tooltip, useMantineTheme } from "@mantine/core"
import { modals } from "@mantine/modals"
import { HANDLE_TYPE } from "@web/modules/constants"
import { useEditorStoreProperty } from "@web/modules/editor-store"
import { useDefinition, useNodePropertyValue } from "@web/modules/graph/nodes"
import classNames from "classnames"
import { TbActivity } from "react-icons/tb"
import { Position, Handle as RFHandle } from "reactflow"
import util from "util"


export default function ActionNodeHandle({ id, name, type, color, definition: passedDef }) {

    const theme = useMantineTheme()
    const nodeDefinition = useDefinition()

    const nodeDisplayName = useNodePropertyValue(null, "data.name") || nodeDefinition?.name

    const passedString = typeof passedDef === "string"
    let definition = passedString ? undefined : passedDef
    if (passedString) {
        switch (type) {
            case HANDLE_TYPE.INPUT:
                definition = nodeDefinition?.inputs?.[passedDef]
                break
            case HANDLE_TYPE.OUTPUT:
                definition = nodeDefinition?.outputs?.[passedDef]
                break
        }
    }

    const displayName = name || definition?.name

    const [selectedRun] = useEditorStoreProperty("selectedRun")
    const hasRunValue = id in (selectedRun?.outputs ?? {})
    const runValue = selectedRun?.outputs?.[id]

    const runValueNeedsExpansion = typeof runValue === "object" && Object.keys(runValue).length > 1 ||
        typeof runValue === "string" && runValue.length > 100

    return (
        <div>
            <RFHandle
                id={id}
                type={type}
                position={type == HANDLE_TYPE.INPUT ? Position.Left : Position.Right}
                className="!relative !transform-none !inset-0 !w-auto !h-auto flex !rounded-full !border-solid !border-1 transition-colors text-dark-400 !bg-gray-50 !border-gray-300 hover:!text-[var(--main-color)] hover:!bg-[var(--light-color)] hover:!border-[var(--main-color)]"
                style={{
                    "--main-color": theme.fn.themeColor(color || nodeDefinition?.color, 7),
                    "--light-color": theme.fn.themeColor(color || nodeDefinition?.color, 1),
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
                        {displayName}
                    </Text>
                </Group>

                {selectedRun && type == HANDLE_TYPE.OUTPUT && hasRunValue &&
                    <div className="absolute top-1/2 -translate-y-1/2 nodrag left-full translate-x-2">
                        <Tooltip multiline withArrow withinPortal label={
                            <Stack maw="20rem" spacing="xs">
                                <Text className="text-xs text-gray text-center">
                                    Output From Selected Run
                                </Text>

                                <Text className="line-clamp-4">
                                    {typeof runValue === "string" ? runValue : <pre>{util.inspect(runValue)}</pre>}
                                </Text>

                                {runValueNeedsExpansion &&
                                    <Text className="text-xs text-gray text-center">
                                        Click to view full data
                                    </Text>}
                            </Stack>
                        }>
                            <ActionIcon
                                variant="filled" radius="xl" color="primary" size="md"
                                onClick={() => runValueNeedsExpansion && openDataViewerModal(`${nodeDisplayName} - ${displayName}`, runValue)}
                            >
                                <TbActivity />
                            </ActionIcon>
                        </Tooltip>
                    </div>}
            </RFHandle>
        </div>
    )
}


function openDataViewerModal(title, value) {
    modals.open({
        title,
        size: "lg",
        children: typeof value === "string" ?
            <Text className={classNames({
                "font-mono": true,
                "text-sm": value.length > 500,
                "text-xs": value.length > 1000,
            })}>
                {value}
            </Text> :
            typeof value === "object" ?
                <ObjectViewer object={value} /> :
                <pre>
                    {util.inspect(value)}
                </pre>
    })
}


function ObjectViewer({ object }) {

    return (
        <Table withColumnBorders highlightOnHover>
            <tbody>
                {Object.entries(object).map(([key, value]) => {
                    return (
                        <tr className="group" key={key}>
                            <td className="w-0 text-right font-bold font-mono">
                                {key}
                            </td>
                            <td className="text-gray group-hover:text-dark">
                                {typeof value === "string" ?
                                    value :
                                    typeof value === "object" ?
                                        <ObjectViewer object={value} /> :
                                        <Group>
                                            <Text className="font-mono">{util.inspect(value)}</Text>
                                            <Text className="font-mono text-gray-500 hidden group-hover:block">{value === null ? "null" : typeof value}</Text>
                                        </Group>}
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </Table>
    )
}