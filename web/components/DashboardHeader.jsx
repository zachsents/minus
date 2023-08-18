import { Group, Kbd, TextInput } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import HeaderBase from "./HeaderBase"
import { NavLink } from "./NavLink"
import { TbSearch } from "react-icons/tb"
import { spotlight } from "@mantine/spotlight"


export default function DashboardHeader() {

    const showDocsNotif = () => notifications.show({
        title: "Coming soon!",
        message: "In the future, this link will take you to our documentation, where you'll find everything you need to know about using the platform."
    })

    return (
        <HeaderBase
            slim
            brandVariant="gray"
            showCTA={false}
            leftSection={
                <Group spacing="lg">
                    <NavLink href="/organizations" size="sm">Organizations</NavLink>

                    <div className="group cursor-pointer" onClick={() => spotlight.open()}>
                        <TextInput
                            size="xs" radius="xl"
                            placeholder="Search..."
                            icon={<TbSearch />}
                            rightSection={<Kbd size="xs" mr="xs">/</Kbd>}
                            className="w-40 pointer-events-none"
                            classNames={{
                                input: "group-hover:bg-gray-50"
                            }}
                        />
                    </div>
                </Group>
            }
            rightSection={
                <Group spacing="lg">
                    <NavLink onClick={showDocsNotif} href="#docs" size="sm"
                        className="text-gray-400"
                    >
                        Docs
                    </NavLink>
                    <NavLink onClick={showDocsNotif} href="#docs-nodes" size="sm"
                        className="text-gray-400"
                    >
                        Nodes
                    </NavLink>
                    <NavLink onClick={showDocsNotif} href="#docs-guides" size="sm"
                        className="text-gray-400"
                    >
                        Guides
                    </NavLink>
                </Group>
            }
        />
    )
}
