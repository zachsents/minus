import { Group, Text, Tooltip } from "@mantine/core"
import { DEFAULT_INPUT_CONFIG_VALIDATION_ERROR } from "@web/modules/constants"
import classNames from "classnames"


export default function HandleDefinitionLabel({ required, description, hidden, error, label, secondaryLabel, icon: Icon,
    className,
    classNames: {
        label: labelClassName,
        icon: iconClassName,
    } = {},
}) {

    const hideTooltip = !(description || hidden || error || required)

    return (
        <Tooltip
            label={<>
                {required &&
                    <Text className="font-bold" color="dimmed">Required</Text>}
                <Text>{description}</Text>
                {hidden &&
                    <Text className="italic" color="dimmed">Hidden</Text>}
                {error &&
                    <Text className="font-bold" color="yellow">
                        {typeof error === "string" ? error : DEFAULT_INPUT_CONFIG_VALIDATION_ERROR}
                    </Text>}
            </>}
            disabled={hideTooltip}
            withinPortal multiline maw="20rem"
        >
            <Group spacing="xs" noWrap className={className}>
                {Icon &&
                    <Icon className={classNames("text-sm", iconClassName)} />}

                <Text className={classNames({
                    "text-sm": true,
                    "underline decoration-dashed underline-offset-2 decoration-gray hover:decoration-dark": !hideTooltip,
                    "text-dark-200": hidden,
                }, labelClassName)}>
                    {label} {secondaryLabel && <Text span color="dimmed">({secondaryLabel})</Text>}
                </Text>

                {error &&
                    <div className="rounded-xl w-[0.6rem] aspect-square bg-yellow" />}
            </Group>
        </Tooltip>
    )
}
