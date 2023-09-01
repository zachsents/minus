import { ActionIcon, Badge, Button, Card, ColorSwatch, Divider, Group, Menu, Stack, Text, Tooltip, useMantineTheme } from "@mantine/core"
import { useHover } from "@mantine/hooks"
import { aOrAn } from "@web/modules/grammar"
import { getTotalMemberCount, getUserRole, isUserAtLeastAdmin, useDeleteOrganization, useOrganization, useOrganizationWorkflowCount } from "@web/modules/organizations"
import { PLAN_INFO } from "@web/modules/plans"
import { openImportantConfirmModal } from "@web/modules/util"
import classNames from "classnames"
import Link from "next/link"
import { useMemo } from "react"
import { TbArrowRight, TbBrandStackshare, TbDots, TbLogout, TbPlugConnected, TbReportMoney, TbTrash } from "react-icons/tb"
import { useUser } from "reactfire"
import { PLAN } from "shared/plans"
import CenteredLoader from "./CenteredLoader"


export default function OrganizationCard({ id, highlightParts }) {

    const [org, updateOrg] = useOrganization(id)

    const { data: user } = useUser()
    const role = useMemo(() => getUserRole(org, user?.uid), [user, org])
    const isAdmin = isUserAtLeastAdmin(org, user?.uid)
    const isOwner = org?.owner === user?.uid

    const PlanInfo = PLAN_INFO[org?.plan]
    const orgColor = org?.color ?? "primary"

    const [workflowCount] = useOrganizationWorkflowCount(id)

    const { hovered: coverHovered, ref: coverRef } = useHover()
    const { hovered: buttonHovered, ref: buttonRef } = useHover()
    const { hovered: titleHovered, ref: titleRef } = useHover()
    const aboutToOpen = coverHovered || buttonHovered || titleHovered

    const rootLink = `/organizations/${org?.id}`

    const displayName = highlightParts ?
        highlightParts.map((part, i) => i % 2 == 0 ? part : <span className="text-yellow-800" key={i}>{part}</span>) :
        org?.name

    const [deleteOrg] = useDeleteOrganization(id)
    const confirmDelete = () => openImportantConfirmModal("delete this organization", {
        onConfirm: deleteOrg,
    })

    return (
        <Card withBorder radius="md" p="md" shadow="sm" className="">
            {org ? <>
                <Card.Section
                    component={Link} href={rootLink}
                    className="mb-sm -mt-md cursor-pointer"
                    ref={coverRef}
                >
                    <Design numberOfCurves={6} colorOffset={8} color={orgColor} />
                </Card.Section>

                <Stack>
                    <Stack className="gap-1">
                        <Group noWrap position="apart">
                            <Link href={rootLink} className="flex-1">
                                <Text className="font-bold text-dark" ref={titleRef}>
                                    {displayName}
                                </Text>
                            </Link>
                            {role &&
                                <Tooltip label={`You are ${aOrAn(role)} ${role} of this organization.`} withinPortal>
                                    <Badge size="sm" tt="capitalize">{role}</Badge>
                                </Tooltip>}
                        </Group>

                        <Badge
                            radius="sm" color={PlanInfo?.color || "gray"}
                            variant={org?.plan === PLAN.EXPERTS ? "filled" : "light"}
                            className="self-start"
                            classNames={{
                                root: classNames({
                                    "shadow-sm": org?.plan === PLAN.EXPERTS
                                })
                            }}
                        >
                            <Group spacing="xs">
                                {PlanInfo?.icon && <PlanInfo.icon className="text-xs" />}
                                <span>{PlanInfo?.label || "Unknown"} Plan</span>
                            </Group>
                        </Badge>
                    </Stack>

                    <Divider />

                    <Group position="center" spacing="md" className="-mt-xs">
                        <Stat
                            number={workflowCount} unit="Workflows" label="View Workflows"
                            href={`/organizations/${org.id}/workflows`}
                        />
                        <Stat
                            number={getTotalMemberCount(org)} unit="Members" label="View Team"
                            href={`/organizations/${org.id}/team`}
                        />
                    </Group>

                    <Group>
                        <Button
                            component={Link} href={rootLink}
                            className="flex-1" ref={buttonRef}
                            rightIcon={<TbArrowRight className={classNames({
                                "transition-transform": true,
                                "translate-x-2": aboutToOpen,
                            })} />}
                        >
                            Open
                        </Button>

                        <Menu withinPortal shadow="sm">
                            <Menu.Target>
                                <ActionIcon radius="md" size={36}>
                                    <TbDots />
                                </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown miw="14rem">
                                <Menu.Item
                                    component={Link} href={`/organizations/${org.id}/workflows`}
                                    icon={<TbBrandStackshare />} rightSection={<TbArrowRight />}
                                >
                                    Go to Workflows
                                </Menu.Item>
                                <Menu.Item
                                    component={Link} href={`/organizations/${org.id}/integrations`}
                                    icon={<TbPlugConnected />} rightSection={<TbArrowRight />}
                                >
                                    Go to Integrations
                                </Menu.Item>
                                <Menu.Item
                                    component={Link} href={`/organizations/${org.id}/billing`}
                                    icon={<TbReportMoney />} rightSection={<TbArrowRight />}
                                >
                                    Manage Billing
                                </Menu.Item>

                                {!isOwner && <>
                                    <Menu.Label>Your Role</Menu.Label>
                                    <Menu.Item icon={<TbLogout />}>
                                        Leave
                                    </Menu.Item>
                                </>}

                                {isAdmin && <>
                                    <Menu.Label>Edit Organization</Menu.Label>
                                    <SwatchArray
                                        colors={["primary", "pink", "yellow", "teal", "indigo"]}
                                        onChange={color => updateOrg({ color })}
                                        value={orgColor}
                                    />
                                    {isOwner &&
                                        <Menu.Item
                                            icon={<TbTrash />} color="red.7"
                                            onClick={confirmDelete}
                                        >
                                            Delete
                                        </Menu.Item>}
                                </>}
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </Stack>
            </> :
                <CenteredLoader />}
        </Card>
    )
}


function Stat({ number, unit, href, label }) {

    if (number === 1 && unit.endsWith("s"))
        unit = unit.slice(0, -1)

    const body =
        <Tooltip label={label} disabled={!label} withinPortal>
            <Stack className={classNames({
                "gap-0 items-center p-xs rounded": true,
                "cursor-pointer hover:bg-gray-100": href,
            })}>
                <Text className="font-bold text-lg text-dark">{number ?? "-"}</Text>
                <Text className="text-sm" color="dimmed">{unit}</Text>
            </Stack>
        </Tooltip>

    return href ?
        <Link href={href}>
            {body}
        </Link> :
        body
}


function Design({ color = "primary", numberOfCurves = 0, height = 6, colorOffset = 7 }) {
    const theme = useMantineTheme()

    const xSpacing = 7 * 3.5 / numberOfCurves

    return (
        <svg width="100%" viewBox={`0 0 20 ${height}`} style={{
            backgroundColor: theme.fn.themeColor("dark", 4),
        }}>
            {Array(numberOfCurves).fill().map((_, i) => {
                const x = (numberOfCurves - i) * xSpacing - 3
                const y = (i - numberOfCurves) * 0.25 + 3.75
                return <path
                    d={`M 0 0 H ${x} q 0.25 ${y - 1} 1.5 ${y} t 1.5 ${height - y} H 0`}
                    fill={theme.fn.themeColor(color, colorOffset + i - numberOfCurves)}
                    className="stroke-[0.5]"
                    key={i}
                />
            })}
        </svg>
    )
}


function SwatchArray({ colors, shade = 5, onChange, value }) {

    const theme = useMantineTheme()

    return <Group spacing="xs" p="xs" position="center">
        {colors.map(color =>
            <ColorSwatch
                size="1rem"
                color={theme.colors[color][shade]}
                onClick={() => onChange?.(color)}
                className={classNames({
                    "cursor-pointer hover:scale-125 active:scale-110 transition": true,
                    "scale-125 ring-2 ring-offset-2 ring-offset-white ring-gray-400": color == value,
                })}
                key={color}
            />
        )}
    </Group>
}