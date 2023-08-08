import { Group, Menu, NavLink, Stack, Text } from "@mantine/core"
import { useDebouncedValue, useLocalStorage, useWindowEvent } from "@mantine/hooks"
import { CLICK_OUTSIDE_PD_TS, LOCAL_STORAGE_KEYS } from "@web/modules/constants"
import { searchNodes } from "@web/modules/search"
import classNames from "classnames"
import { useEffect, useMemo, useState } from "react"
import { TbPin, TbPinnedOff } from "react-icons/tb"


export default function NodeSearch({ query, tags, onAdd, maxResults = Infinity, showDescription = false, draggable = false, focused = false }) {

    const [debouncedQuery] = useDebouncedValue(query, 100)
    const results = useMemo(() => searchNodes(query, tags), [debouncedQuery, tags])

    const [selected, setSelected] = useState(0)

    useEffect(() => {
        setSelected(0)
    }, [query])

    useWindowEvent("keydown", ev => {
        if (!focused)
            return

        switch (ev.key) {
            case "ArrowDown":
                setSelected(Math.min(selected + 1, results.length - 1, maxResults - 1))
                ev.preventDefault()
                break
            case "ArrowUp":
                setSelected(Math.max(selected - 1, 0))
                ev.preventDefault()
                break
            case "Enter":
                onAdd?.(results[selected])
                ev.preventDefault()
        }
    })

    return (
        <>
            {results.slice(0, maxResults).map((result, i) =>
                <ResultRow
                    definition={result}
                    onAdd={onAdd}
                    showDescription={showDescription}
                    draggable={draggable}
                    selected={i === selected}
                    // key={result.id}
                    key={i}
                />
            )}
        </>
    )
}


function ResultRow({ definition, onAdd, showDescription = false, draggable = false, selected = false }) {

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
                    className={classNames({
                        "active:scale-95 transition-transform": true,
                        "bg-primary-100 hover:bg-primary-200": selected,
                    })}
                    icon={<definition.icon />}
                    label={<Stack className="gap-0">
                        <Text>{definition.name}</Text>
                        {showDescription &&
                            <Text size="xs" color="dimmed" lineClamp={3}>
                                {definition.description}
                            </Text>}
                    </Stack>}
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
                className="rounded base-border fixed -translate-x-1/2 -translate-y-1/2 z-[10]"
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