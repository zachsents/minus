import { ActionIcon, Group, Space, Stack, Text, Tooltip } from "@mantine/core"
import { CONTROL_MODIFIER_LABELS, HANDLE_TYPE, MODIFIER_INPUT_DEFINITIONS } from "@web/modules/constants"
import { useModifier } from "@web/modules/graph/nodes"
import { TbX } from "react-icons/tb"
import ActionNodeHandle from "./ActionNodeHandle"


export default function NodeModifierWrapper({ children }) {

    const [modifier, , clearModifier] = useModifier()

    return modifier ?
        <div className="px-3 pb-3 rounded bg-dark-200 bg-opacity-10 border-dashed border-1 border-dark-200">
            <Group position="apart" className="">
                <Stack align="flex-start" spacing={0}>
                    <Text className="text-gray text-xxs py-1">
                        {CONTROL_MODIFIER_LABELS[modifier.type]}
                    </Text>
                    <div className="-mx-5">
                        <ActionNodeHandle
                            id={modifier.id}
                            type={HANDLE_TYPE.INPUT}
                            color="yellow"
                            definition={MODIFIER_INPUT_DEFINITIONS[modifier.type]}
                        />
                    </div>
                </Stack>
                <Tooltip label="Remove Modifier" withinPortal>
                    <ActionIcon size="xs" onClick={clearModifier}>
                        <TbX className="text-xs" />
                    </ActionIcon>
                </Tooltip>
            </Group>

            <Space h="xs" />
            {children}
        </div> :
        children
}
