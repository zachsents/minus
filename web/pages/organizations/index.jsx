import { Alert, Chip, Container, Grid, Group, Loader, SimpleGrid, Space, Stack, Text, Title } from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"
import DashboardHeader from "@web/components/DashboardHeader"
import Footer from "@web/components/Footer"
import GlassButton from "@web/components/GlassButton"
import OrganizationCard from "@web/components/OrganizationCard"
import PageHead from "@web/components/PageHead"
import SearchInput from "@web/components/SearchInput"
import Section from "@web/components/Section"
import { LOCAL_STORAGE_KEYS } from "@web/modules/constants"
import { useUserOrganizations } from "@web/modules/organizations"
import { useMustBeLoggedIn } from "@web/modules/router"
import { useSearch } from "@web/modules/search"
import Link from "next/link"
import { useState } from "react"
import { TbPlus } from "react-icons/tb"


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
