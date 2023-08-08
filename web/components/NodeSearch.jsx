import { Group, Menu, NavLink, Stack, Text } from "@mantine/core"
import { useDebouncedValue, useLocalStorage, useWindowEvent } from "@mantine/hooks"
import { CLICK_OUTSIDE_PD_TS, LOCAL_STORAGE_KEYS } from "@web/modules/constants"
import { searchNodes } from "@web/modules/search"
import { useMemo, useState } from "react"
import { TbPin, TbPinnedOff } from "react-icons/tb"


export default function NodeSearch({ query, tags, onAdd, showDescription = false, draggable = false }) {

    const [debouncedQuery] = useDebouncedValue(query, 100)
    const results = useMemo(() => searchNodes(query, tags), [debouncedQuery, tags])

    return (
        <>
            {results.slice(0, 8).map(result =>
                <ResultRow
                    definition={result}
                    onAdd={onAdd}
                    showDescription={showDescription}
                    draggable={draggable}
                    key={result.id}
                />
            )}
        </>
    )
}


function ResultRow({ definition, onAdd, showDescription = false, draggable = false }) {

    const [menuOpened, setMenuOpened] = useState(false)

    const [pinned, setPinned] = useLocalStorage({
        key: LOCAL_STORAGE_KEYS.PINNED_NODES,
        defaultValue: [],
    })

    const isPinned = pinned.includes(definition.id)

    const addPinned = () => {
        setPinned([...new Set([...pinned, definition.id])])
    }

    const removePinned = () => {
        setPinned(pinned.filter(id => id != definition.id))
    }

    const [dragStartPosition, setDragStartPosition] = useState(false)
    const [dragPosition, setDragPosition] = useState(false)

    useWindowEvent("pointerup", ev => {
        if (dragStartPosition) {
            const distance = Math.sqrt((ev.clientX - dragStartPosition.x) ** 2 + (ev.clientY - dragStartPosition.y) ** 2)
            setDragStartPosition(false)
            setDragPosition(false)
            document.activeElement?.blur()

            if (distance < 10) {
                onAdd?.(definition)
            }
            else {
                if (!draggable)
                    return

                onAdd?.(definition, {
                    x: ev.clientX - 100,
                    y: ev.clientY - 50,
                })
            }
        }
    })

    useWindowEvent("pointermove", ev => {
        if (dragStartPosition && draggable) {
            setDragPosition({ x: ev.clientX, y: ev.clientY })
        }
    })

    return (<>
        <Menu
            opened={menuOpened} onOpen={() => setMenuOpened(true)} onClose={() => setMenuOpened(false)}
            trigger="hover" openDelay={1000} closeDelay={500} disabled={!!dragStartPosition}
            clickOutsideEvents={CLICK_OUTSIDE_PD_TS}
            position="right" withArrow shadow="md" withinPortal
        >
            <Menu.Target>
                <NavLink
                    tabIndex="0"
                    className="focus:bg-primary-100 active:scale-95 transition-transform"
                    icon={<definition.icon />}
                    label={<Stack className="gap-0">
                        <Text>{definition.name}</Text>
                        {showDescription &&
                            <Text size="xs" color="dimmed" lineClamp={3}>
                                {definition.description}
                            </Text>}
                    </Stack>}
                    onKeyDown={ev => {
                        if (ev.key == "ArrowDown") {
                            ev.preventDefault()
                            ev.stopPropagation()
                            ev.target.nextSibling?.nextSibling?.focus()
                        }
                        if (ev.key == "ArrowUp") {
                            ev.preventDefault()
                            const prev = ev.target.previousSibling?.previousSibling
                            if (prev) {
                                prev?.focus()
                                ev.stopPropagation()
                            }
                        }
                        if (ev.key == "Enter") {
                            ev.preventDefault()
                            ev.stopPropagation()
                            onAdd?.(definition)
                        }
                    }}
                    onContextMenu={ev => {
                        ev.preventDefault()
                        ev.stopPropagation()
                        setMenuOpened(true)
                    }}
                    onPointerDown={ev => {
                        if (ev.button == 0)
                            setDragStartPosition({ x: ev.clientX, y: ev.clientY })
                    }}
                />
            </Menu.Target>
            <Menu.Dropdown>
                {isPinned ?
                    <Menu.Item icon={<TbPinnedOff />} onClick={removePinned}>
                        Unpin
                    </Menu.Item> :
                    <Menu.Item icon={<TbPin />} onClick={addPinned}>
                        Pin
                    </Menu.Item>}
            </Menu.Dropdown>
        </Menu>

        {dragPosition &&
            <div
                className="rounded base-border fixed -translate-x-1/2 -translate-y-1/2"
                style={{
                    left: dragPosition.x,
                    top: dragPosition.y,
                }}
            >
                <Group
                    className="gap-xs px-xs py-1 min-w-[16rem] text-white font-bold"
                    bg={definition.color}
                >
                    <definition.icon />
                    <Text>{definition.name}</Text>
                </Group>

                <Group noWrap position="apart" className="bg-white pb-xs pt-lg">
                    <Stack className="w-[30%] -ml-2 gap-3">
                        <div className="h-4 rounded-full base-border bg-gray-50" />
                        <div className="h-4 rounded-full base-border bg-gray-50" />
                    </Stack>
                    <Stack className="w-[30%] -mr-2 gap-3">
                        <div className="h-4 rounded-full base-border bg-gray-50" />
                        <div className="h-4 rounded-full base-border bg-gray-50" />
                    </Stack>
                </Group>
            </div>}
    </>)
}