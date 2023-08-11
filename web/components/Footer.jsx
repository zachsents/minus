/* eslint-disable @next/next/no-img-element */
import { Box, Container, Group, Space, Stack, Text } from "@mantine/core"
import Brand from "./Brand"
import { NavLink } from "./NavLink"


export default function Footer({ showCompanies = true }) {
    return (
        // This makes the footer look like stick to the bottom of the page
        <footer className="flex-1 flex flex-col justify-end">
            <Box
                className="bg-primary"
                sx={theme => ({
                    boxShadow: `0 -1rem ${theme.colors.pink[6]}, 0 -1.5rem ${theme.colors.yellow[5]}`,
                })}
            >
                <Container p="xl">
                    {showCompanies && <>
                        <Stack align="center" spacing="sm">
                            <Text weight={500} color="white">Trusted by teams at</Text>
                            <Group position="center" spacing="lg">
                                <img
                                    src="/upfront_dist.avif" alt="Upfront Distribution logo"
                                    loading="lazy" className="w-32"
                                />
                                <img
                                    src="/virtue.png" alt="Virtue Marketing Group logo"
                                    loading="lazy" className="w-32"
                                />
                            </Group>
                        </Stack>
                        <Space h="3rem" />
                    </>}
                    <Group position="apart" align="flex-end">
                        <Stack spacing="xs">
                            <Brand variant="white-shiny" />
                            <Group>
                                <NavLink href="/pricing" weight={500} size="sm" className="text-primary-200 hover:text-white">Pricing</NavLink>
                                <NavLink href="/team" weight={500} size="sm" className="text-primary-200 hover:text-white">Team</NavLink>
                                <NavLink href="/docs" weight={500} size="sm" className="text-primary-200 hover:text-white">Docs</NavLink>
                                <NavLink href="/terms-of-service" weight={500} size="sm" className="text-primary-200 hover:text-white">Terms of Service</NavLink>
                                <NavLink href="/privacy-policy" weight={500} size="sm" className="text-primary-200 hover:text-white">Privacy Policy</NavLink>
                            </Group>
                        </Stack>
                        <Box>
                            <Text className="text-primary-100" size="sm">Questions, comments, suggestions?</Text>
                            <Text
                                component="a" color="white" size="sm" weight={600}
                                href="mailto:info@minuscode.app?subject=Minus%20Inquiry"
                            >
                                info@minuscode.app
                            </Text>
                        </Box>
                    </Group>
                </Container>
            </Box>
        </footer>
    )
}
