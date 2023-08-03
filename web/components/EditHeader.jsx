import { Button, Checkbox, Divider, Grid, Group, Menu, Switch, Text } from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"
import { LOCAL_STORAGE_KEYS } from "@web/modules/constants"
import classNames from "classnames"
import { useRouter } from "next/router"
import { useState } from "react"
import { TbArrowLeft, TbChevronRight, TbDotsVertical, TbGridPattern, TbHeart, TbLayout, TbMap, TbPointer, TbSettings } from "react-icons/tb"
import EditableText from "./EditableText"
import LinkKeepParams from "./LinkKeepParams"


export default function EditHeader() {

    const [enabled, setEnabled] = useState(false)

    const [followMouse, setFollowMouse] = useLocalStorage({ key: LOCAL_STORAGE_KEYS.EDITOR_FOLLOW_MOUSE, defaultValue: true })
    const [autoLayout, setAutoLayout] = useLocalStorage({ key: LOCAL_STORAGE_KEYS.EDITOR_AUTO_LAYOUT, defaultValue: true })
    const [showGrid, setShowGrid] = useLocalStorage({ key: LOCAL_STORAGE_KEYS.EDITOR_SHOW_GRID, defaultValue: false })
    const [showMinimap, setShowMinimap] = useLocalStorage({ key: LOCAL_STORAGE_KEYS.EDITOR_SHOW_MINIMAP, defaultValue: false })

    const [title, setTitle] = useState("Handle CVP form submissions")

    return (
        <Grid
            className="px-sm py-xs bg-dark [&>*]:text-dark-50 hover:[&_button]:bg-dark-300 hover:[&_button]:text-white"
            align="center" gutter={0}
        >
            <Grid.Col span={4} className="flex justify-start" >
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

                            <Menu
                                trigger="hover" position="right-start" closeOnItemClick={false}
                                width="15rem" shadow="md"
                            >
                                <Menu.Target>
                                    <Menu.Item icon={<TbSettings />} rightSection={<TbChevronRight />}>
                                        Editor Settings
                                    </Menu.Item>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    <CheckableMenuItem
                                        icon={TbGridPattern}
                                        value={showGrid} onChange={setShowGrid}
                                    >
                                        Show Grid
                                    </CheckableMenuItem>
                                    <CheckableMenuItem
                                        icon={TbMap}
                                        value={showMinimap} onChange={setShowMinimap}
                                    >
                                        Show Minimap
                                    </CheckableMenuItem>
                                    <CheckableMenuItem
                                        icon={TbPointer}
                                        value={followMouse} onChange={setFollowMouse}
                                    >
                                        Follow Mouse
                                    </CheckableMenuItem>
                                    <CheckableMenuItem
                                        icon={TbLayout}
                                        value={autoLayout} onChange={setAutoLayout}
                                    >
                                        Auto-Layout
                                    </CheckableMenuItem>
                                </Menu.Dropdown>
                            </Menu>
                        </Menu.Dropdown>
                    </Menu>

                    <TabLinks
                        tabs={[
                            { label: "Edit", href: "/workflows/[workflowId]/edit" },
                            { label: "Runs", href: "/workflows/[workflowId]/runs" },
                        ]}
                    />
                </Group>
            </Grid.Col>

            <Grid.Col span={4} className="flex justify-center">
                <EditableText
                    value={title}
                    onChange={setTitle}
                    classNames={{ group: "hover:!bg-dark-400" }}
                    showSaveButton
                >
                    <Text>{title}</Text>
                </EditableText>
            </Grid.Col>

            <Grid.Col span={4} className="flex justify-end">
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
            </Grid.Col>
        </Grid>
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


function CheckableMenuItem({ children, value, onChange, icon: Icon }) {

    return (
        <Menu.Item
            icon={<Icon />}
            rightSection={<Checkbox
                radius="sm" checked={value} readOnly
            />}
            onClick={() => onChange?.(!value)}
        >
            {children}
        </Menu.Item>
    )
}