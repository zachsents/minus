import { Alert, Button, Chip, Container, Grid, Group, Loader, SimpleGrid, Space, Stack, Text, Title, Tooltip } from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"
import DashboardHeader from "@web/components/DashboardHeader"
import Footer from "@web/components/Footer"
import GlassButton from "@web/components/GlassButton"
import OrganizationCard from "@web/components/OrganizationCard"
import PageHead from "@web/components/PageHead"
import SearchInput from "@web/components/SearchInput"
import Section from "@web/components/Section"
import { LOCAL_STORAGE_KEYS } from "@web/modules/constants"
import { useAPI } from "@web/modules/firebase/api"
import { useUserOrganizations } from "@web/modules/organizations"
import { useMustBeLoggedIn } from "@web/modules/router"
import { useSearch } from "@web/modules/search"
import Link from "next/link"
import { useState } from "react"
import { TbPlus, TbUsers } from "react-icons/tb"
import { API_ROUTE } from "shared/firebase"


export default function OrganizationsPage() {

    useMustBeLoggedIn()

    const organizations = useUserOrganizations()

    const [filterMode, setFilterMode] = useState("all")
    const orgList = organizations[filterMode] ?? []

    const [filteredOrgs, query, setQuery, filteredOrgNames] = useSearch(orgList, {
        selector: org => org.name,
        highlight: true,
    })

    const [showIntroAlert, setShowIntroAlert] = useLocalStorage({
        key: LOCAL_STORAGE_KEYS.SHOW_INTRO_ALERT,
        defaultValue: true,
    })

    return (
        <>
            <PageHead title="Your Organizations" />

            <DashboardHeader />

            {showIntroAlert &&
                <Container size="xs" p="xl">
                    <Alert
                        title="Welcome to Minus!"
                        withCloseButton variant="outline"
                        onClose={() => setShowIntroAlert(false)}
                    >
                        To get started, create a new app or select an existing one.
                        {/* You can also check out our guides and resources to learn more about what you can do with Minus. */}
                    </Alert>
                </Container>}

            <Section size="md" className="mt-xl">
                <Grid gutter="xl">
                    <Grid.Col sm={12} md={9}>
                        <Stack spacing="lg">
                            <Group position="apart">
                                <Title order={2}>Your Organizations</Title>
                                <Link href="/organizations/create">
                                    <GlassButton leftIcon={<TbPlus />} radius="xl" matchColor>
                                        New Organization
                                    </GlassButton>
                                </Link>
                            </Group>

                            {organizations.loaded == null ?
                                <Group position="center">
                                    <Loader size="sm" />
                                    <Text size="sm" color="dimmed">Loading organizations</Text>
                                </Group> :
                                <>
                                    {organizations.invited?.length > 0 &&
                                        <Stack spacing="xs">
                                            {organizations.invited.map(org =>
                                                <OrganizationInvitation org={org} key={org.id} />
                                            )}
                                        </Stack>}

                                    <Stack spacing="xs">
                                        <SearchInput
                                            value={query}
                                            onChange={event => setQuery(event.currentTarget.value)}
                                            onClear={() => setQuery("")}
                                            noun="organization"
                                            quantity={orgList.length}
                                        />
                                        <Chip.Group value={filterMode} onChange={setFilterMode}>
                                            <Group className="gap-1">
                                                <Chip size="xs" value="all">All</Chip>
                                                <Chip size="xs" value="member">Member</Chip>
                                                <Chip size="xs" value="admin">Admin</Chip>
                                                <Chip size="xs" value="owner">Owner</Chip>
                                            </Group>
                                        </Chip.Group>
                                    </Stack>

                                    {filteredOrgs.length == 0 ?
                                        <Text size="sm" color="dimmed" align="center">No organizations found.</Text> :
                                        <SimpleGrid cols={2} breakpoints={[
                                            { maxWidth: "sm", cols: 1 },
                                        ]}>
                                            {filteredOrgs.map((org, i) =>
                                                <OrganizationCard
                                                    id={org.id}
                                                    highlightParts={filteredOrgNames[i]}
                                                    key={org.id}
                                                />
                                            )}
                                        </SimpleGrid>}
                                </>}
                        </Stack>
                    </Grid.Col>
                    <Grid.Col sm={12} md={3}>
                        <Stack>
                            <Title order={6}>Guides & Resource</Title>
                            <Text size="xs" align="center" color="dimmed">
                                Coming soon! Stayed tuned.
                            </Text>
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Section>

            <Space h="10rem" />

            <Footer showCompanies={false} />
        </>
    )
}


function OrganizationInvitation({ org }) {

    const [acceptInvitation, acceptQuery] = useAPI(API_ROUTE.ACCEPT_INVITATION, {
        orgId: org.id,
    })
    const [rejectInvitation, rejectQuery] = useAPI(API_ROUTE.REJECT_INVITATION, {
        orgId: org.id,
    })

    return (
        <Alert
            title={`Pending Invitation from ${org.name}`} icon={<TbUsers />} color={org.color} radius="md"
            key={org.id}
        >
            <Stack spacing="xs">
                <Text>You&apos;ve been invited to join the organization &quot;{org.name}&quot;</Text>
                <Group>
                    <Button
                        compact color={org.color}
                        onClick={() => acceptInvitation()}
                        loading={acceptQuery.isLoading}
                        disabled={rejectQuery.isLoading}
                    >
                        Accept
                    </Button>
                    <Tooltip
                        label="If you reject this accidentally, an organization member will have to invite you again." withinPortal
                    >
                        <Button
                            variant="subtle" compact color={org.color}
                            onClick={() => rejectInvitation()}
                            loading={rejectQuery.isLoading}
                            disabled={acceptQuery.isLoading}
                        >
                            Reject
                        </Button>
                    </Tooltip>
                </Group>
            </Stack>
        </Alert>
    )
}