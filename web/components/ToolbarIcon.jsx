import { ActionIcon, Group, Text, Tooltip } from "@mantine/core"
import classNames from "classnames"


export default function ToolbarIcon({ icon: Icon, label, secondaryLabel, className, ...props }) {

    return (
        <Tooltip label={<Group noWrap spacing="xs">
            <Text>{label}</Text>
            {secondaryLabel &&
                <Text color="dimmed">{secondaryLabel}</Text>}
        </Group>}>
            <ActionIcon size="lg" {...props} className={classNames("w-10", className)}>
                <Icon />
            </ActionIcon>
        </Tooltip>
    )
}