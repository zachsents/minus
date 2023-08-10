import { Handle as RFHandle, Position } from "reactflow"
import { Group, Text, useMantineTheme } from "@mantine/core"
import { useDefinition } from "@web/modules/graph/nodes"
import { HANDLE_TYPE } from "@web/modules/constants"
import classNames from "classnames"


export default function ActionNodeHandle({ id, name, type, color, definition: passedDef }) {

    const theme = useMantineTheme()
    const nodeDefinition = useDefinition()

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
                        {name || definition?.name}
                    </Text>
                </Group>
            </RFHandle>
        </div>
    )
}
