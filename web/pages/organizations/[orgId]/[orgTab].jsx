import { Accordion, ActionIcon, Badge, Box, Button, Center, Divider, Group, Loader, Menu, RingProgress, Space, Stack, Table, Tabs, Text, TextInput, Title, Tooltip, useMantineTheme } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useHover, useLocalStorage } from "@mantine/hooks"
import { modals } from "@mantine/modals"
import CenteredLoader from "@web/components/CenteredLoader"
import DashboardHeader from "@web/components/DashboardHeader"
import EditableText from "@web/components/EditableText"
import Footer from "@web/components/Footer"
import GlassButton from "@web/components/GlassButton"
import HorizontalScrollBox from "@web/components/HorizontalScrollBox"
import MultiTextInput from "@web/components/MultiTextInput"
import PageHead from "@web/components/PageHead"
import ProblemCard from "@web/components/ProblemCard"
import SearchInput from "@web/components/SearchInput"
import Section from "@web/components/Section"
import WorkflowCard, { WorkflowCardRow } from "@web/components/WorkflowCard"
import { LOCAL_STORAGE_KEYS, MODALS } from "@web/modules/constants"
import { useAPI, useAPIQuery } from "@web/modules/firebase/api"
import { formatDate } from "@web/modules/grammar"
import { useDeleteOrganization, useOrganization, useOrganizationMustExist, useOrganizationRecentRuns, useOrganizationRecentWorkflows, useOrganizationWorkflowCount, useOrganizationWorkflows, useUserMustBeInOrganization } from "@web/modules/organizations"
import { PLAN_INFO } from "@web/modules/plans"
import { useMustBeLoggedIn, useQueryParam } from "@web/modules/router"
import { useSearch } from "@web/modules/search"
import { confirmFirst, openImportantConfirmModal } from "@web/modules/util"
import classNames from "classnames"
import Link from "next/link"
import { useEffect } from "react"
import { TbBrandStackshare, TbDots, TbLayoutDashboard, TbPlugConnected, TbPlus, TbReportMoney, TbRun, TbSettings, TbUser, TbUserMinus, TbUserPlus, TbUsers } from "react-icons/tb"
import { useUser } from "reactfire"
import { API_ROUTE } from "shared/firebase"
import { PLAN, PLAN_LIMITS } from "shared/plans"


export default function OrganizationDashboardPage() {

    useMustBeLoggedIn()
    useOrganizationMustExist()
    useUserMustBeInOrganization()

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
                            <Tabs.Tab value="workflows" icon={<TbBrandStackshare />} className="font-bold">
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
                        <SettingsPanel />
                        <TeamPanel />
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

    const runs = useOrganizationRecentRuns()
    const erroredRuns = runs?.filter(run => run.errors?.length > 0)
    const totalErrors = erroredRuns?.flatMap(run => run.errors).length

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
                        <WorkflowRunsProgress />

                        <Stack spacing="xs">
                            <Text className="text-xs text-gray">
                                Errors ({totalErrors ?? "Loading..."}) - Last 24 Hours
                            </Text>

                            {erroredRuns?.flatMap(run => run.errors.map((error, i) =>
                                <ProblemCard
                                    title={"Error in "}
                                    subtitle={formatDate(run.queuedAt)}
                                    level="error" compact
                                    key={`${run.id}-${i}`}
                                >
                                    {error}
                                </ProblemCard>
                            ))}
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

    const [filteredWorkflows, query, setQuery, filteredWorkflowNames] = useSearch(workflows, {
        selector: workflow => workflow.name,
        highlight: true,
    })

    const [showUsage, setShowUsage] = useLocalStorage({
        key: LOCAL_STORAGE_KEYS.SHOW_WORKFLOW_USAGE,
        defaultValue: true,
    })

    const [, , canCreateWorkflows] = useOrganizationWorkflowCount()

    return (
        <Tabs.Panel value="workflows">
            <Stack className="gap-xl">
                <Group position="apart" noWrap>
                    <Title order={3}>Workflows</Title>

                    {canCreateWorkflows &&
                        <Link href={`/workflows/create?orgId=${orgId}`}>
                            <GlassButton leftIcon={<TbPlus />} radius="xl" matchColor>
                                New Workflow
                            </GlassButton>
                        </Link>}
                </Group>

                <Accordion
                    variant="filled"
                    value={showUsage ? "usage" : null} onChange={val => setShowUsage(!!val)}
                    classNames={{
                        label: "p-xs",
                        control: "p-0 text-xs",
                    }}
                >
                    <Accordion.Item value="usage">
                        <Accordion.Control>
                            {showUsage ? "Usage" : "Show Usage"}
                        </Accordion.Control>
                        <Accordion.Panel>
                            <Group grow>
                                <WorkflowProgress />
                                <WorkflowRunsProgress />
                            </Group>
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>


                <SearchInput
                    value={query}
                    onChange={event => setQuery(event.currentTarget.value)}
                    onClear={() => setQuery("")}
                    noun="workflow"
                    quantity={workflows?.length ?? 0}
                />

                {workflows ?
                    filteredWorkflows?.length ?
                        filteredWorkflows?.map((workflow, i) =>
                            <WorkflowCardRow
                                id={workflow.id}
                                highlightParts={filteredWorkflowNames[i]}
                                key={workflow.id}
                            />
                        ) :
                        <Text size="sm" color="dimmed" align="center">No workflows found.</Text> :
                    <CenteredLoader />}
            </Stack>
        </Tabs.Panel>
    )
}


function TeamPanel() {

    const [org] = useOrganization()

    const [members, membersQuery] = useAPIQuery(API_ROUTE.GET_PUBLIC_USER_DATA, {
        userIds: org?.members,
    }, { enabled: !!org?.members })
    const [admins, adminsQuery] = useAPIQuery(API_ROUTE.GET_PUBLIC_USER_DATA, {
        userIds: org?.admins,
    }, { enabled: !!org?.admins })
    const [owner, ownerQuery] = useAPIQuery(API_ROUTE.GET_PUBLIC_USER_DATA, {
        userId: org?.owner,
    }, { enabled: !!org?.owner })

    const isTeamLoading = membersQuery.isLoading || adminsQuery.isLoading || ownerQuery.isLoading

    const openInviteModal = () => modals.openContextModal({
        modal: MODALS.ADD_ORGANIZATION_MEMBER,
        title: `Invite Member to ${org?.name}`,
        centered: true,
        innerProps: {
            orgId: org?.id,
        },
    })

    return (
        <Tabs.Panel value="team">
            <Stack className="gap-xl">
                <Group position="apart" noWrap>
                    <Group noWrap>
                        <Title order={3}>Team</Title>

                        {isTeamLoading && <Loader size="xs" />}
                    </Group>

                    <Group spacing="xs">
                        <GlassButton
                            leftIcon={<TbUserPlus />} radius="xl" matchColor size="xs"
                            onClick={openInviteModal}
                        >
                            Invite Member
                        </GlassButton>
                    </Group>
                </Group>

                <Table highlightOnHover>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th className="flex justify-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {owner &&
                            <TeamMemberRow user={owner} role="owner" orgId={org?.id} />}

                        {Object.values(admins ?? {}).map(user =>
                            <TeamMemberRow
                                user={user} role="admin" orgId={org?.id}
                                key={`admin-${user.uid}`}
                            />
                        )}

                        {Object.values(members ?? {}).map(user =>
                            <TeamMemberRow
                                user={user} role="member" orgId={org?.id}
                                key={`member-${user.uid}`}
                            />
                        )}
                    </tbody>
                </Table>
            </Stack>
        </Tabs.Panel>
    )
}


function TeamMemberRow({ orgId, user, role }) {

    const { data: loggedInUser } = useUser()
    const isYou = loggedInUser?.uid === user?.uid

    const [removeFromOrganization, removeQuery] = useAPI(API_ROUTE.REMOVE_FROM_ORGANIZATION, {
        orgId: orgId,
        userId: user.uid,
    })
    const confirmRemoveFromOrganization = confirmFirst(removeFromOrganization, {
        action: "remove this member from the organization",
    })

    let menuItems = []
    switch (role) {
        case "owner": break
        case "admin":
            menuItems.push(
                <Menu.Item
                    onClick={() => confirmRemoveFromOrganization()}
                    icon={<TbUserMinus />}
                    key="remove-from-org"
                >
                    {isYou ? "Leave Organization" : "Remove from Organization"}
                </Menu.Item>
            )
            break
        case "member":
            menuItems.push(
                <Menu.Item
                    onClick={() => confirmRemoveFromOrganization()}
                    icon={<TbUserMinus />}
                    key="remove-from-org"
                >
                    {isYou ? "Leave Organization" : "Remove from Organization"}
                </Menu.Item>
            )
            break
    }

    return (
        <tr>
            <td>
                <Tooltip label="You" disabled={!isYou} withinPortal>
                    <Group spacing="xs">
                        {user?.displayName}
                        {isYou && <TbUser />}
                    </Group>
                </Tooltip>
            </td>
            <td>{user?.email}</td>
            <td>
                <Badge radius="sm" color={roleBadgeColor[role]}>{role}</Badge>
            </td>
            <td className="w-[1%]">
                <Center>
                    {menuItems.length > 0 &&
                        <Menu position="bottom-end" withArrow shadow="sm">
                            <Menu.Target>
                                <ActionIcon loading={removeQuery.isLoading}>
                                    <TbDots />
                                </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                                {menuItems}
                            </Menu.Dropdown>
                        </Menu>}
                </Center>
            </td>
        </tr>
    )
}

const roleBadgeColor = {
    owner: "yellow",
    admin: "primary",
    member: "gray",
}


function SettingsPanel() {

    const [org, updateOrg, updateQuery] = useOrganization()

    const settingsForm = useForm({
        initialValues: {
            name: org?.name ?? "",
            errorNotificationEmails: org?.errorNotificationEmails ?? [],
        },
        validate: {
            name: value => !value,
            errorNotificationEmails: value => value.some(email => !email || !email.includes("@")),
        },
        validateInputOnChange: true,
    })

    useEffect(() => {
        settingsForm.setFieldValue("name", org?.name ?? "")
    }, [org?.name])

    const handleSubmit = async values => {
        await updateOrg(values)
        settingsForm.resetDirty()
    }

    const [deleteOrg] = useDeleteOrganization()
    const confirmDelete = () => openImportantConfirmModal("delete this organization", {
        onConfirm: deleteOrg,
    })

    return (
        <Tabs.Panel value="settings">
            <Stack className="gap-xl">
                <Title order={3}>Organization Settings</Title>

                <form onSubmit={settingsForm.onSubmit(handleSubmit)}>
                    <Stack spacing="xl">
                        {settingsForm.isDirty() &&
                            <Button
                                size="sm" type="submit" compact disabled={!settingsForm.isValid()}
                                className="self-end -my-xl"
                                loading={updateQuery.isLoading}
                            >
                                Save Changes
                            </Button>}

                        <div>
                            <Text fz="sm">Organization Name</Text>
                            <Group position="apart">
                                <TextInput
                                    placeholder="Organization Name"
                                    {...settingsForm.getInputProps("name")}
                                    className="flex-1"
                                />
                            </Group>
                        </div>

                        <MultiTextInput
                            label="Error Notifications"
                            emptyLabel="No error notifications configured."
                            addLabel="Add Email"
                            inputProps={{ placeholder: "mark@facebook.com" }}
                            max={10}
                            {...settingsForm.getInputProps("errorNotificationEmails")}
                        >
                            <Text className="text-xs text-gray mb-2">
                                Add email addresses to receive notifications when workflows have errors.
                            </Text>
                        </MultiTextInput>

                        {settingsForm.isDirty() &&
                            <Button
                                size="sm" type="submit" compact disabled={!settingsForm.isValid()}
                                className="self-end"
                                loading={updateQuery.isLoading}
                            >
                                Save Changes
                            </Button>}
                    </Stack>
                </form>

                <Divider label="Danger Zone" />

                <Group position="apart">
                    <div>
                        <Text fz="sm">
                            Delete your organization.
                        </Text>
                        <Text fz="xs" color="dimmed">
                            This action is irreversible.
                        </Text>
                    </div>

                    <Button color="red" onClick={confirmDelete}>Delete Organization</Button>
                </Group>
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


function WorkflowRunsProgress() {

    const [org] = useOrganization()

    const recentRuns = useOrganizationRecentRuns()
    const workflowRunCount = recentRuns?.length
    const workflowRunLimit = PLAN_LIMITS[org?.plan]?.dailyWorkflowRuns ?? 1

    return (
        <Group spacing="xs" noWrap>
            <RingProgress
                sections={[
                    { value: (workflowRunCount ?? 0) * 100 / workflowRunLimit, color: "primary" }
                ]}
                roundCaps
                size={90} thickness={10}
                label={<Center className="text-primary text-lg">
                    <TbRun />
                </Center>}
            />
            <div>
                <Text className="text-xs text-gray font-bold uppercase mb-1">Workflow Runs</Text>
                <Text className="text-sm">
                    {workflowRunCount ?? "Loading..."} / {workflowRunLimit} workflow runs &mdash; last 24 hours
                </Text>
                <Text className="text-xs text-gray">{workflowRunLimit - workflowRunCount} remaining</Text>
            </div>
        </Group>
    )
}


function WorkflowProgress() {

    const [workflowCount, workflowLimit] = useOrganizationWorkflowCount()

    return (
        <Group spacing="xs" noWrap>
            <RingProgress
                sections={[
                    { value: (workflowCount ?? 0) * 100 / workflowLimit, color: "primary" }
                ]}
                roundCaps
                size={90} thickness={10}
                label={<Center className="text-primary text-lg">
                    <TbBrandStackshare />
                </Center>}
            />
            <div>
                <Text className="text-xs text-gray font-bold uppercase mb-1">Workflows</Text>
                <Text className="text-sm">
                    {workflowCount ?? "Loading..."} / {workflowLimit} workflows
                </Text>
                <Text className="text-xs text-gray">{workflowLimit - workflowCount} remaining</Text>
            </div>
        </Group>
    )
}