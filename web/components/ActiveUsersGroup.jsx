import { Avatar, Tooltip } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { plural } from "@web/modules/grammar"
import { getInitials } from "@web/modules/util"
import { useActiveUsers } from "@web/modules/workflows"
import { useEffect } from "react"
import { useUser } from "reactfire"


/**
 * @param {object} props
 * @param {string} props.workflowId
 * @param {boolean} [props.showIndividualTooltip=false]
 * @param {boolean} [props.showGroupTooltip=false]
 * @param {import("@mantine/core").AvatarProps} [props.avatarProps={}]
 * @param {object} [props.groupProps={}]
 * @param {import("@mantine/core").TooltipProps} [props.tooltipProps={}]
 */
export default function ActiveUsersGroup({
    workflowId,
    showIndividualTooltip = false,
    showGroupTooltip = false,
    avatarProps = {},
    groupProps = {},
    tooltipProps = {},
}) {

    const { data: user } = useUser()
    const activeUsers = useActiveUsers(workflowId)

    const moreThanOneUser = activeUsers.length > 1
    useEffect(() => {
        if (moreThanOneUser) {
            notifications.show({
                message: "Multiple users are editing this workflow. This feature is still in beta and may not work as expected.",
            })
        }
    }, [moreThanOneUser])

    return (
        <Tooltip
            label={`${activeUsers.length} ${plural("user", activeUsers.length)} online`}
            disabled={!showGroupTooltip}
            withinPortal
            {...tooltipProps}
        >
            <Avatar.Group spacing="sm" {...groupProps}>
                {activeUsers.map(([userId, userData]) =>
                    <Tooltip
                        label={(userData.displayName || userData.email || `User ${userId}`) + (userId == user?.uid ? " (You)" : "")}
                        withArrow withinPortal
                        disabled={!showIndividualTooltip}
                        {...tooltipProps}
                        key={userId}
                    >
                        <Avatar
                            src={userData.photo} alt={userData.displayName || userData.email}
                            radius="xl"
                            {...avatarProps}
                        >
                            {getInitials(userData.displayName || userData.email || userId)}
                        </Avatar>
                    </Tooltip>
                )}
            </Avatar.Group>
        </Tooltip>
    )
}
