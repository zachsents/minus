import { Badge, Box, Button, Center, Divider, Group, Progress, Space, Stack, Tabs, Text, Title, Tooltip, useMantineTheme } from "@mantine/core"
import { useHover } from "@mantine/hooks"
import CenteredLoader from "@web/components/CenteredLoader"
import DashboardHeader from "@web/components/DashboardHeader"
import EditableText from "@web/components/EditableText"
import Footer from "@web/components/Footer"
import GlassButton from "@web/components/GlassButton"
import HorizontalScrollBox from "@web/components/HorizontalScrollBox"
import PageHead from "@web/components/PageHead"
import ProblemCard from "@web/components/ProblemCard"
import Section from "@web/components/Section"
import WorkflowCard, { WorkflowCardRow } from "@web/components/WorkflowCard"
import { useOrganization, useOrganizationMustExist, useOrganizationRecentWorkflows, useOrganizationWorkflows } from "@web/modules/organizations"
import { PLAN_INFO } from "@web/modules/plans"
import { useMustBeLoggedIn, useQueryParam } from "@web/modules/router"
import classNames from "classnames"
import Link from "next/link"
import { TbBrandStackshare, TbLayoutDashboard, TbPlugConnected, TbPlus, TbReportMoney, TbSettings, TbUsers } from "react-icons/tb"
import { PLAN } from "shared/constants/plans"


export default function OrganizationDashboardPage() {

    useMustBeLoggedIn()
    useOrganizationMustExist()

    const [org, updateOrg] = useOrganization()

    const [orgTab, setOrgTab] = useQueryParam("orgTab")

    const PlanInfo = PLAN_INFO[org?.plan]

    return (
        <>
            <PageHead title={org?.name || "Loading"} />

            <DashboardHeader />

            {org ?
                <Section size="md" className="mt-xl">
                    <Stack pb="md">
                        <Group position="apart">
                            <Group align="stretch" spacing="xs">
                                <Box bg={org?.color ?? "primary"} className="w-3 transition-colors rounded-sm" />
                                <EditableText
                                    value={org.name}
                                    onChange={name => updateOrg({ name })}
                                    // classNames={{ group: "hover:!bg-dark-400" }}
                                    showSaveButton
                                >
                                    <Title order={2}>{org.name}</Title>
                                </EditableText>
                            </Group>

                            <Tooltip label="Go to Billing">
                                <Badge
                                    radius="sm" color={PlanInfo?.color || "gray"} size="lg"
                                    variant={org?.plan === PLAN.EXPERTS ? "filled" : "light"}
                                    classNames={{
                                        root: classNames("cursor-pointer", {
                                            "shadow-sm": org?.plan === PLAN.EXPERTS
                                        })
                                    }}
                                    onClick={() => setOrgTab("billing")}
                                >
                                    <Group spacing="xs">
                                        {PlanInfo?.icon && <PlanInfo.icon className="text-xs" />}
                                        <span>{PlanInfo?.label || "Unknown"} Plan</span>
                                    </Group>
                                </Badge>
                            </Tooltip>
                        </Group>
                    </Stack>

                    <Divider />

                    <Tabs
                        value={orgTab} onTabChange={setOrgTab}
                        orientation="vertical" variant="pills" mt="md"
                        classNames={{
                            panel: "pl-md"
                        }}
                    >
                        <Tabs.List miw="10rem">
                            <Tabs.Tab value="overview" icon={<TbLayoutDashboard />}>
                                Overview
                            </Tabs.Tab>
                            <Divider label="Build" className="text-gray" />
                            <Tabs.Tab value="workflows" icon={<TbBrandStackshare />}>
                                Workflows
                            </Tabs.Tab>
                            <Tabs.Tab value="integrations" icon={<TbPlugConnected />}>
                                Integrations
                            </Tabs.Tab>
                            <Divider label="Settings" className="text-gray" />
                            <Tabs.Tab value="team" icon={<TbUsers />}>
                                Team
                            </Tabs.Tab>
                            <Tabs.Tab value="billing" icon={<TbReportMoney />}>
                                Billing
                            </Tabs.Tab>
                            <Tabs.Tab value="settings" icon={<TbSettings />}>
                                Settings
                            </Tabs.Tab>
                        </Tabs.List>

                        <OverviewPanel />
                        <WorkflowsPanel />
                    </Tabs>
                </Section> :
                <CenteredLoader />}

            <Space h="10rem" />

            <Footer showCompanies={false} />
        </>
    )
}


function OverviewPanel() {

    const [, setOrgTab] = useQueryParam("orgTab")
    const recentWorkflows = useOrganizationRecentWorkflows()

    return (
        <Tabs.Panel value="overview">
            <Stack className="gap-10">
                <Title order={3}>Overview</Title>

                <Group align="stretch" grow noWrap className="-mt-xl min-h-[10rem]">
                    <DesignCard
                        color="primary"
                        design={<>
                            <rect x="5" y="30" width="30" height="18" rx="3" className="fill-current" />
                            <path d="M 35 39 Q 45 39 55 47 T 75 55" className="fill-none stroke-current" />
                            <rect x="75" y="48" width="30" height="18" rx="3" className="fill-current" />
                            <path d="M 50 71 Q 56 71 62.5 65 T 75 59" className="fill-none stroke-current" />
                            <rect x="30" y="65" width="20" height="12" rx="3" className="fill-current" />
                        </>}
                        onClick={() => setOrgTab("workflows")}
                    >
                        Workflows
                    </DesignCard>
                    <DesignCard
                        color="gray"
                        design={<>
                            <defs>
                                <pattern id="plugEmojiPattern" patternUnits="userSpaceOnUse" width="40" height="40">
                                    <text x="5" y="10" fontSize="10" textAnchor="middle" alignmentBaseline="middle" opacity={0.2}>🔌</text>
                                    <text x="25" y="30" fontSize="10" textAnchor="middle" alignmentBaseline="middle" opacity={0.2}>🔌</text>
                                </pattern>
                            </defs>
                            <rect x="-500" y="-500" width="1000" height="1000" fill="url(#plugEmojiPattern)"></rect>
                        </>}
                        buttonText="Manage Integrations"
                        onClick={() => setOrgTab("integrations")}
                    >
                        Integrations
                    </DesignCard>
                    <DesignCard
                        color="yellow"
                        design={<>
                            <defs>
                                <pattern id="usersEmojiPattern" patternUnits="userSpaceOnUse" width="40" height="40">
                                    <text x="5" y="10" fontSize="10" textAnchor="middle" alignmentBaseline="middle" opacity={0.2}>👥</text>
                                    <text x="25" y="30" fontSize="10" textAnchor="middle" alignmentBaseline="middle" opacity={0.2}>👥</text>
                                </pattern>
                            </defs>
                            <rect x="-500" y="-500" width="1000" height="1000" fill="url(#usersEmojiPattern)"></rect>
                        </>}
                        buttonText="Manage Team"
                        onClick={() => setOrgTab("team")}
                    >
                        Team
                    </DesignCard>
                    <DesignCard
                        color="green"
                        design={<>
                            <defs>
                                <pattern id="moneyEmojiPattern" patternUnits="userSpaceOnUse" width="40" height="40">
                                    <text x="5" y="10" fontSize="10" textAnchor="middle" alignmentBaseline="middle" opacity={0.2}>💸</text>
                                    <text x="25" y="30" fontSize="10" textAnchor="middle" alignmentBaseline="middle" opacity={0.2}>💸</text>
                                </pattern>
                            </defs>
                            <rect x="-500" y="-500" width="1000" height="1000" fill="url(#moneyEmojiPattern)"></rect>
                        </>}
                        buttonText="Go to Billing"
                        onClick={() => setOrgTab("billing")}
                    >
                        Billing
                    </DesignCard>
                </Group>

                <Group align="stretch" noWrap className="min-h-[14rem]">
                    <Stack className="flex-1 gap-1">
                        <Title order={5}>Recent Workflows</Title>

                        {recentWorkflows ?
                            <div className="flex-1 base-border rounded-md overflow-hidden">
                                <HorizontalScrollBox className="h-full bg-gray-100">
                                    {recentWorkflows.length ?
                                        <Group className="h-full items-stretch p-2" noWrap>
                                            {recentWorkflows.map(workflow =>
                                                <WorkflowCard id={workflow.id} className="shrink-0 w-60" key={workflow.id} />
                                            )}
                                        </Group> :
                                        <Center className="h-full text-gray">
                                            <Text>No recent workflows.</Text>
                                        </Center>}
                                </HorizontalScrollBox>
                            </div> :
                            <CenteredLoader />}
                    </Stack>
                </Group>

                <Stack>
                    <Title order={5}>Workflow Runs</Title>

                    <Group grow align="flex-start">
                        <Stack spacing="xs">
                            <Text className="text-xs text-gray">Usage</Text>
                            <Progress value={50} size="xl" />
                            <Text className="text-sm">
                                1,742 / 3,500 workflow runs this month
                            </Text>
                        </Stack>

                        <Stack spacing="xs">
                            <Text className="text-xs text-gray">Problems</Text>
                            <ProblemCard level="error" />
                            <ProblemCard level="warning" />
                        </Stack>
                    </Group>
                </Stack>
            </Stack>
        </Tabs.Panel>
    )
}


function WorkflowsPanel() {

    const [orgId] = useQueryParam("orgId")
    const workflows = useOrganizationWorkflows()

    return (
        <Tabs.Panel value="workflows">
            <Stack className="gap-xl">
                <Group position="apart" noWrap>
                    <Title order={3}>Workflows</Title>

                    <Link href={`/workflows/create?orgId=${orgId}`}>
                        <GlassButton leftIcon={<TbPlus />} radius="xl" matchColor>
                            New Workflow
                        </GlassButton>
                    </Link>
                </Group>

                {workflows ?
                    workflows?.map(workflow =>
                        <WorkflowCardRow id={workflow.id} key={workflow.id} />
                    ) :
                    <CenteredLoader />}
            </Stack>
        </Tabs.Panel>
    )
}


function DesignCard({ children, design, color, buttonText = "View All", className, ...props }) {

    const theme = useMantineTheme()
    const { hovered, ref } = useHover()

    return (
        <div
            {...props}
            className={classNames("relative rounded-md overflow-hidden cursor-pointer group shadow-xs hover:scale-102 hover:shadow-md transition", className)}
            ref={ref}
        >
            <svg
                width="100%" height="100%" viewBox="0 0 100 100"
                className="absolute top-0 left-0 group-hover:scale-125 transition-transform duration-500"
                style={{
                    backgroundColor: theme.fn.themeColor(color, 3),
                    color: theme.fn.themeColor(color, 4),
                }}
            >
                {design}
            </svg>

            <Stack className="absolute top-0 left-0 w-full h-full justify-between items-center py-xs">
                <Text
                    className="font-bold text-2xl text-center transition-colors"
                    c={theme.fn.themeColor(color, hovered ? 9 : 7)}
                >
                    {children}
                </Text>

                <Button
                    size="xs" radius="xl"
                    bg={theme.fn.themeColor(color, hovered ? 9 : 7)}
                    className="pointer-events-none transition-colors"
                >
                    {buttonText}
                </Button>
            </Stack>
        </div>
    )
}
