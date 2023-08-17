import { Card, Group, Text, Tooltip } from "@mantine/core"
import classNames from "classnames"
import { TbAlertCircle, TbAlertTriangle, TbChevronRight } from "react-icons/tb"


/**
 * @param {object} props
 * @param {string} [props.title]
 * @param {string} props.subtitle
 * @param {"error" | "warning"} props.level
 * @param {boolean} props.withTooltip
 * @param {string} props.tooltipLabel
 * @param {boolean} props.withChevron
 * @param {boolean} props.compact
 */
export default function ProblemCard({ children, title, subtitle, level, withTooltip = true, tooltipLabel = "View Run", withChevron = true, compact = false }) {

    const Icon = level === "error" ? TbAlertCircle : TbAlertTriangle
    title ??= (level === "error" ? "Error" : "Warning") + " in Workflow"

    return (
        <Tooltip label={tooltipLabel} withArrow position="right" disabled={!withTooltip}>
            <Card
                className={classNames(
                    "cursor-pointer border-solid border-1",
                    {
                        "border-red-200 bg-red-50": level === "error",
                        "border-yellow-200 bg-yellow-50": level === "warning",
                    },
                    compact ? "px-xs py-1" : "px-md py-xs",
                )}
            >
                <Group noWrap>
                    <Icon className={classNames({
                        "text-red-700": level === "error",
                        "text-yellow-700": level === "warning",
                    })} />
                    <div className="flex-1">
                        <Text className={classNames("text-xs font-bold", {
                            "text-red-700": level === "error",
                            "text-yellow-700": level === "warning",
                        })}>
                            {title}
                        </Text>
                        <Text className={classNames(
                            "text-gray",
                            compact ? "text-xxs" : "text-xs",
                        )}>
                            {subtitle}
                        </Text>

                        {!compact &&
                            <div className="h-2" />}

                        <Text className={classNames("font-mono text-xs", {
                            "text-red-800": level === "error",
                            "text-yellow-800": level === "warning",
                        })}>
                            {children}
                        </Text>
                    </div>
                    {withChevron && <TbChevronRight />}
                </Group>
            </Card>
        </Tooltip>
    )
}