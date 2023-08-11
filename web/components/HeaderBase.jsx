import { ActionIcon, Avatar, Center, Drawer, Group, Loader, Menu, Stack, Text, useMantineTheme } from "@mantine/core"
import { useDisclosure, useWindowScroll } from "@mantine/hooks"
import { useSignOut } from "@web/modules/firebase/auth"
import classNames from "classnames"
import Link from "next/link"
import { TbApps, TbGridDots, TbLogout, TbUser } from "react-icons/tb"
import { useUser } from "reactfire"
import Brand from "./Brand"
import { NavLink } from "./NavLink"


export default function HeaderBase({ leftSection, rightSection, showCTA = true, slim = false }) {

    const { data: user } = useUser()

    const theme = useMantineTheme()
    const [scroll] = useWindowScroll()

    const [signOut, signOutQuery] = useSignOut()

    const [drawerOpened, drawerHandlers] = useDisclosure()

    const brandComponent = (
        <Brand {...(slim && {
            variant: "gray",
            size: "1.5rem",
        })} />
    )

    const ctaComponent = (user ?
        <Group>
            <Menu position="bottom-end" shadow="md" width="12rem" classNames={{
                item: "py-2"
            }}>
                <Menu.Target>
                    <Avatar src={user.photoURL}
                        color="" radius="xl" size={slim ? "2rem" : "md"}
                        className="cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                    >
                        <TbUser className="text-xl" />
                    </Avatar>
                </Menu.Target>

                <Menu.Dropdown>
                    <Text className="text-xs font-medium text-center py-xs">
                        Hey{user?.displayName ? ` ${user.displayName}` : ""}!
                    </Text>

                    <Menu.Item
                        component={Link} href="/organizations"
                        icon={<TbApps />} color="primary"
                    >
                        <Text span weight={500}>Your Organizations</Text>
                    </Menu.Item>
                    <Menu.Item
                        onClick={signOut}
                        icon={signOutQuery.isLoading ? <Loader size="xs" /> : <TbLogout />}
                    >
                        Log Out
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>

            {showCTA &&
                <NavLink href="/apps" button size={slim ? "xs" : "sm"}>
                    Go to Minus
                </NavLink>}
        </Group> :

        <Group noWrap>
            <NavLink href="/login" button variant="subtle" size={slim ? "sm" : "md"}>
                Sign in
            </NavLink>

            {showCTA &&
                <NavLink href="/login" button size={slim ? "xs" : "md"}>
                    Start for free
                </NavLink>}
        </Group>
    )

    return (
        <Center
            className={classNames({
                "sticky top-0 z-50 p-2 bg-white transition-shadow": true,
                "shadow-xs": scroll.y > 0,
            })}
        >
            <Group className="max-w-screen-lg px-xl flex-1" position="apart">

                <div className="hidden md:block">
                    <Group spacing="2.5rem">
                        {brandComponent}
                        {leftSection}
                    </Group>
                </div>

                <div className="md:hidden pl-sm">
                    {brandComponent}
                </div>

                <div className="hidden md:block">
                    <Group spacing="2rem">
                        {rightSection}
                        {ctaComponent}
                    </Group>
                </div>

                <div className="md:hidden">
                    <ActionIcon size="xl" onClick={drawerHandlers.open}>
                        <TbGridDots size={theme.fontSizes.xl} />
                    </ActionIcon>

                    <Drawer
                        size="xs" position="right" closeButtonProps={{ size: "lg" }}
                        opened={drawerOpened} onClose={drawerHandlers.close}
                        className="md:hidden"
                    >
                        <Stack spacing="lg">
                            <Center py="xl">
                                {ctaComponent}
                            </Center>
                            {leftSection}
                            {rightSection}
                        </Stack>
                    </Drawer>
                </div>
            </Group>
        </Center>
    )
}