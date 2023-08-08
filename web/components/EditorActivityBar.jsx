import { ActionIcon, Group, Indicator, Space, Tabs, Text, Tooltip } from "@mantine/core"
import { useHotkeys, useLocalStorage } from "@mantine/hooks"
import { ACTIVITY, ACTIVITY_BAR_ELEMENT_ID, LOCAL_STORAGE_KEYS } from "@web/modules/constants"
import { TbChartDots3, TbRobot, TbStack2, TbStarFilled, TbVersions, TbX } from "react-icons/tb"
import ActionsActivity from "./ActionsActivity"
import KeyboardShortcut from "./KeyboardShortcut"
import ScrollBox from "./ScrollBox"
import VersionsActivity from "./VersionsActivity"


export default function EditorActivityBar() {

    const [activityTab, setActivityTab] = useLocalStorage({
        key: LOCAL_STORAGE_KEYS.EDITOR_ACTIVITY_TAB,
        defaultValue: ACTIVITY.ACTIONS,
    })

    useHotkeys([
        ["/", () => setActivityTab(ACTIVITY.ACTIONS)]
    ])

    return (
        <Tabs
            id={ACTIVITY_BAR_ELEMENT_ID}
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
                <ActivityTabIcon title="Actions" value={ACTIVITY.ACTIONS} icon={TbChartDots3} keyboardShortcut={["/"]} />
                <ActivityTabIcon title="Integration Accounts" value={ACTIVITY.ACCOUNTS} icon={TbStack2} />
                <Space h="xs" />
                <ActivityTabIcon title="Versions" value={ACTIVITY.VERSIONS} icon={TbVersions} premium />
                <Space h="xs" />
                <ActivityTabIcon title="Workflow Assistant" value={ACTIVITY.ASSISTANT} icon={TbRobot} premium />
            </Tabs.List>

            <ActivityPanel
                title="Actions"
                value={ACTIVITY.ACTIONS}
            >
                <ActionsActivity />
            </ActivityPanel>

            <ActivityPanel
                title="Integration Accounts"
                value={ACTIVITY.ACCOUNTS}
            >
                Integration Accounts
            </ActivityPanel>

            <ActivityPanel
                title="Versions"
                value={ACTIVITY.VERSIONS}
            >
                <VersionsActivity />
            </ActivityPanel>

            <ActivityPanel
                title="Workflow Assistant 🪄"
                value={ACTIVITY.ASSISTANT}
            >
                Workflow Assistant
            </ActivityPanel>
        </Tabs>
    )
}


function ActivityTabIcon({ title, value, keyboardShortcut, icon: Icon, premium = false }) {

    return (
        <Tooltip
            label={<Group>
                <Text>{title}</Text>
                {premium &&
                    <Text className="text-yellow font-bold">Pro</Text>}
                {keyboardShortcut &&
                    <KeyboardShortcut keys={keyboardShortcut} lowkey withPluses />}
            </Group>}
            position="right"
        >
            <Indicator
                label={<TbStarFilled className="text-yellow stroke-white" />}
                classNames={{ indicator: "bg-transparent" }}
                offset={3} disabled={!premium}
            >
                <Tabs.Tab value={value}>
                    <Icon />
                </Tabs.Tab>
            </Indicator>
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