import { Menu, NavLink } from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"
import { CLICK_OUTSIDE_PD_TS, LOCAL_STORAGE_KEYS } from "@web/modules/constants"
import { searchNodes } from "@web/modules/search"
import { useState } from "react"
import { useMemo } from "react"
import { TbPin, TbPinnedOff } from "react-icons/tb"


export default function NodeSearch({ query, onAdd }) {

    const results = useMemo(() => searchNodes(query), [query])

    return (
        <>
            {results.slice(0, 8).map(result =>
                <ResultRow definition={result} onClick={() => onAdd?.(result)} key={result.id} />
            )}
        </>
    )
}


function ResultRow({ definition, onClick }) {

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

    return (
        <Menu
            opened={menuOpened} onOpen={() => setMenuOpened(true)} onClose={() => setMenuOpened(false)}
            trigger="hover" openDelay={1000}
            clickOutsideEvents={CLICK_OUTSIDE_PD_TS}
            position="right" withArrow shadow="md"
        >
            <Menu.Target>
                <NavLink
                    tabIndex="0"
                    className="focus:bg-primary-100"
                    icon={<definition.icon />}
                    label={definition.name}
                    onClick={onClick}
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
                            ev.target.click()
                        }
                    }}
                    onContextMenu={ev => {
                        ev.preventDefault()
                        ev.stopPropagation()
                        setMenuOpened(true)
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
    )
}