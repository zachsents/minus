import { ActionIcon, Group, Space, Tabs, Text, Tooltip } from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"
import { LOCAL_STORAGE_KEYS } from "@web/modules/constants"
import { TbChartDots3, TbPlugConnected, TbRobot, TbStack2, TbX } from "react-icons/tb"
import ScrollBox from "./ScrollBox"
import KeyboardShortcut from "./KeyboardShortcut"
import ActionsActivity from "./ActionsActivity"


export default function EditorActivityBar() {

    const [activityTab, setActivityTab] = useLocalStorage({
        key: LOCAL_STORAGE_KEYS.EDITOR_ACTIVITY_TAB,
        defaultValue: "resources",
    })

    return (
        <Tabs
            value={activityTab} onTabChange={setActivityTab}
            orientation="vertical" variant="pills" allowTabDeactivation
            classNames={{
                tabsList: "gap-1 p-1 border-solid border-0 border-r-1 border-gray-300",
                tabLabel: "flex items-center justify-center text-lg",
                tab: "aspect-square p-2 hover:bg-primary-300",
                panel: "border-solid border-0 border-r-1 border-gray-300 w-64",
            }}
        >
            <Tabs.List>
                <ActivityTabIcon title="Resources" value="resources" icon={TbStack2} />
                <ActivityTabIcon title="Actions" value="actions" icon={TbChartDots3} keyboardShortcut={["/"]} />
                <Space h="xs" />
                <ActivityTabIcon title="Workflow Assistant" value="assistant" icon={TbRobot} />
                <Space h="xs" />
                <ActivityTabIcon title="Integration Accounts" value="accounts" icon={TbPlugConnected} />
            </Tabs.List>

            <ActivityPanel
                title="Resources"
                value="resources"
            >
                {"Resources ".repeat(100)}
            </ActivityPanel>

            <ActivityPanel
                title="Actions"
                value="actions"
            >
                <ActionsActivity />
            </ActivityPanel>

            <ActivityPanel
                title="Integration Accounts"
                value="accounts"
            >
                Integration Accounts
            </ActivityPanel>

            <ActivityPanel
                title="Workflow Assistant 🪄"
                value="assistant"
            >
                Workflow Assistant
            </ActivityPanel>
        </Tabs>
    )
}


function ActivityTabIcon({ title, value, keyboardShortcut, icon: Icon }) {

    return (
        <Tooltip label={<Group>
            <Text>{title}</Text>
            {keyboardShortcut &&
                <KeyboardShortcut keys={keyboardShortcut} lowkey withPluses />}
        </Group>} position="right">
            <Tabs.Tab value={value}>
                <Icon />
            </Tabs.Tab>
        </Tooltip>
    )
}


function ActivityPanel({ children, title, value }) {

    const [, setActivityTab] = useLocalStorage({
        key: LOCAL_STORAGE_KEYS.EDITOR_ACTIVITY_TAB,
    })

    return (
        <Tabs.Panel value={value}>
            <div className="flex flex-col h-full">
                <Group position="apart" className="p-xs border-solid border-0 border-b-1 border-gray-300">
                    <Text className="font-bold text-sm">
                        {title}
                    </Text>

                    <ActionIcon onClick={() => setActivityTab(null)}>
                        <TbX />
                    </ActionIcon>
                </Group>

                <ScrollBox insideFlex classNames={{
                    viewport: "px-1",
                }}>
                    {children}
                </ScrollBox>
            </div>
        </Tabs.Panel>
    )
}