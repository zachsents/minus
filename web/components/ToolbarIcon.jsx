import { ActionIcon, Tooltip } from "@mantine/core"
import classNames from "classnames"


export default function ToolbarIcon({ icon: Icon, label, className, ...props }) {

    return (
        <Tooltip label={label}>
            <ActionIcon size="lg" {...props} className={classNames("w-10", className)}>
                <Icon />
            </ActionIcon>
        </Tooltip>
    )
}