import { Button, Divider, Group, Stack, Text, Tooltip } from "@mantine/core"
import { uniqueId, useIsClient } from "@web/modules/util"
import classNames from "classnames"
import { useState } from "react"
import { TbClock, TbStar } from "react-icons/tb"


const versions = Array(20).fill().map((_, i, arr) => ({
    id: uniqueId(),
    name: `Version ${i + 1}`,
    createdAt: new Date(Date.now() - (arr.length - i) * 24 * 60 * 60 * 1000),
}))


export default function VersionsActivity() {

    versions.sort((a, b) => b.createdAt - a.createdAt)

    const [expanded, setExpanded] = useState()

    return (
        <Stack className="py-xs gap-1">

            <Group noWrap className="px-sm py-1">
                <TbStar className="fill-yellow" />
                <div className="flex-1">
                    <Text className="text-sm font-bold">Current Version</Text>
                    <Text className="text-xs" color="dimmed">Version 21</Text>
                    <Text className="text-xs" color="dimmed">Restored from Version 15</Text>
                </div>
            </Group>

            <Button size="xs" mx="sm">Save Current as Version</Button>

            <Divider my="xs" mx="sm" />

            {versions.map(version =>
                <VersionRow
                    version={version}
                    expanded={expanded == version.id}
                    onExpand={() => setExpanded(version.id)}
                    key={version.name}
                />
            )}
        </Stack>
    )
}

function VersionRow({ version, icon = <TbClock />, expanded, onExpand }) {

    const isClient = useIsClient()

    return (
        <Stack
            className={classNames({
                "px-sm py-1 hover:bg-gray-100 rounded cursor-pointer": true,
                "border-solid border-0 border-l-4 border-primary-500 rounded-l-none": expanded,
            })}
            onClick={() => onExpand?.()}
        >
            <Group>
                {icon}
                <div>
                    <Text className="text-sm">{version.name}</Text>
                    {isClient &&
                        <Text className="text-xs" color="dimmed">
                            {version.createdAt instanceof Date ?
                                version.createdAt.toLocaleString("en", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                }) :
                                version.createdAt}
                        </Text>}
                </div>
            </Group>

            {expanded &&
                <Group>
                    <Tooltip label="The current version will be saved as a version first." withinPortal>
                        <Button size="xs" compact>
                            Restore as Current
                        </Button>
                    </Tooltip>
                </Group>}
        </Stack>
    )
}