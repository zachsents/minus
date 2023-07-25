import { ActionIcon, Button, Checkbox, Divider, Group, Menu, Switch, Text } from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"
import classNames from "classnames"
import { useRouter } from "next/router"
import { TbArrowLeft, TbChevronRight, TbDotsVertical, TbHeart, TbLayout, TbPencil, TbPointer, TbSettings } from "react-icons/tb"
import LinkKeepParams from "./LinkKeepParams"
import { useState } from "react"


export default function EditHeader() {

    const [enabled, setEnabled] = useState(false)

    const [followMouse, setFollowMouse] = useLocalStorage({ key: "editorFollowMouse", defaultValue: true })
    const [autoLayout, setAutoLayout] = useLocalStorage({ key: "editorAutoLayout", defaultValue: true })

    return (
        <Group
            className="px-sm py-xs bg-dark [&>*]:text-dark-50 hover:[&_button]:bg-dark-300 hover:[&_button]:text-white"
            position="apart"
        >
            <Group>
                <Menu shadow="md">
                    <Menu.Target>
                        <Button
                            size="sm" px="xs" variant="subtle"
                            className="text-white"
                        >
                            <Group noWrap spacing="xs">
                                <TbDotsVertical />
                                <Text fw="bold">minus</Text>
                            </Group>
                        </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item icon={<TbArrowLeft />}>
                            Back to Workflows
                        </Menu.Item>

                        <Menu trigger="hover" position="right-start" closeOnItemClick={false} shadow="md">
                            <Menu.Target>
                                <Menu.Item icon={<TbSettings />} rightSection={<TbChevronRight />}>
                                    Editor Settings
                                </Menu.Item>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item
                                    icon={<TbPointer />}
                                    rightSection={<Checkbox
                                        radius="sm" checked={followMouse}
                                    />}
                                    onClick={() => setFollowMouse(!followMouse)}
                                >
                                    Follow Mouse
                                </Menu.Item>
                                <Menu.Item
                                    icon={<TbLayout />}
                                    rightSection={<Checkbox
                                        radius="sm" ml="xl" checked={autoLayout}
                                    />}
                                    onClick={() => setAutoLayout(!autoLayout)}
                                >

                                    Auto-Layout
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Menu.Dropdown>
                </Menu>

                <Group className="group" spacing="xs">
                    <Text>Handle CVP form submissions</Text>
                    <ActionIcon className="opacity-0 group-hover:opacity-100">
                        <TbPencil />
                    </ActionIcon>
                </Group>

                <TabLinks
                    tabs={[
                        { label: "Edit", href: "/workflows/[workflowId]/edit" },
                        { label: "Runs", href: "/workflows/[workflowId]/runs" },
                    ]}
                />
            </Group>

            <Group spacing="xl">
                <Switch
                    label="Enabled"
                    classNames={{
                        root: "[&_*]:cursor-pointer",
                        label: "text-white font-medium",
                        track: classNames({
                            "border-none": true,
                            "bg-dark-300": !enabled,
                        })
                    }}
                    checked={enabled} onChange={ev => setEnabled(ev.currentTarget.checked)}
                />

                <Divider orientation="vertical" />

                <Button
                    component="a" href="https://google.com" target="_blank"
                    compact size="xs" color="dark" variant="white"
                    className="group hover:scale-110 transition-transform"
                    leftIcon={<TbHeart className="group-hover:scale-150 group-hover:fill-red transition" />}
                >
                    Leave Feedback
                </Button>
            </Group>
        </Group>
    )
}


function TabLinks({ tabs }) {

    const router = useRouter()

    return (
        <Group className="gap-1">
            {tabs.map(tab =>
                <Button
                    component={LinkKeepParams} href={tab.href} replace shallow
                    variant="subtle" size="sm" compact key={tab.href}
                    className={classNames({
                        "text-dark-50 hover:bg-dark-300 rounded-xl px-md": true,
                        "bg-dark-300": router.pathname === tab.href,
                    })}
                >
                    {tab.label}
                </Button>
            )}
        </Group>
    )
}