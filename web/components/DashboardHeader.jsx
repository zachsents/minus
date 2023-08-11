import { Group } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import HeaderBase from "./HeaderBase"
import { NavLink } from "./NavLink"


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
                    <NavLink href="/dashboard" size="sm">Dashboard</NavLink>
                    <NavLink href="/organizations" size="sm">Organizations</NavLink>
                    <NavLink href="/workflows" size="sm">Workflows</NavLink>
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
