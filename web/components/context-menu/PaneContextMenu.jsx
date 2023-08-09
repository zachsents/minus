import { ActionIcon, FocusTrap, Group, NavLink, Popover, Stack, TextInput, Tooltip } from "@mantine/core"
import { useLocalStorage, useWindowEvent } from "@mantine/hooks"
import { CLICK_OUTSIDE_PD_TS, LOCAL_STORAGE_KEYS } from "@web/modules/constants"
import { useEditorStoreProperty } from "@web/modules/editor-store"
import { useProjectRFToScreen } from "@web/modules/graph"
import { createActionNode } from "@web/modules/nodes"
import classNames from "classnames"
import WebDefinitions from "nodes/web"
import { useEffect, useRef, useState } from "react"
import { TbArrowBack, TbArrowForward, TbPinnedOff } from "react-icons/tb"
import { useReactFlow } from "reactflow"
import KeyboardShortcut from "../KeyboardShortcut"
import NodeSearch from "../NodeSearch"


export default function PaneContextMenu() {

    const rf = useReactFlow()

    const [opened, setOpened] = useEditorStoreProperty("paneContextMenuOpened")
    const [paneContextMenuPosition] = useEditorStoreProperty("paneContextMenuPosition")

    const close = () => setOpened(false)
    const andClose = (fn) => () => {
        fn()
        close()
    }

    const screen = useProjectRFToScreen(paneContextMenuPosition)

    const [undo] = useEditorStoreProperty("undo")
    const [redo] = useEditorStoreProperty("redo")

    const searchRef = useRef()
    const [query, setQuery] = useState("")
    const resultContainerRef = useRef()

    useEffect(() => {
        if (opened)
            setQuery("")
    }, [opened])

    useWindowEvent("keydown", ev => {
        if (!opened || ev.key == "Tab" || ev.key == "Shift")
            return

        if (ev.key == "Escape")
            return close()

        // if (ev.key == "ArrowDown")
        //     return resultContainerRef.current?.firstChild?.focus()

        if (!ev.ctrlKey && global.document.activeElement != searchRef.current)
            searchRef.current?.focus()
    })

    const addNode = definition => {
        createActionNode(rf, definition.id, paneContextMenuPosition)
        close()
    }

    const [pinned] = useLocalStorage({
        key: LOCAL_STORAGE_KEYS.PINNED_NODES,
    })

    return (
        <Popover
            opened={opened} onClose={close}
            clickOutsideEvents={CLICK_OUTSIDE_PD_TS}
            classNames={{
                dropdown: "p-0 border-none bg-transparent"
            }}
            positionDependencies={[screen?.x, screen?.y]}
            transitionProps={{
                transition: "pop",
                onExited: () => setQuery(""),
            }}
        >
            <Popover.Target>
                <div
                    className={classNames({
                        "absolute w-3 h-3 bg-primary rounded-full transition-opacity": true,
                        "opacity-0": !opened,
                    })}
                    style={{
                        top: `${screen?.y}px`,
                        left: `${screen?.x}px`,
                    }}
                />
            </Popover.Target>
            <Popover.Dropdown>
                <FocusTrap active={opened}>
                    <Stack className="gap-xs w-50 relative">
                        <Group position="center" className="absolute bottom-full left-1/2 mb-8 -translate-x-1/2 w-60 gap-2">
                            {pinned?.map((id, i) =>
                                <PinnedNode id={id} onAdd={addNode} key={i} />
                            )}
                        </Group>

                        <TextInput
                            value={query} onChange={ev => setQuery(ev.currentTarget.value)}
                            placeholder="Start typing to search nodes..."
                            size="xs"
                            ref={searchRef}
                        />

                        <div className="bg-white base-border shadow-md rounded-sm overflow-hidden">
                            {query ?
                                <Stack className="gap-0" ref={resultContainerRef}>
                                    <NodeSearch query={query} onAdd={addNode} maxResults={8} />
                                </Stack> :
                                <Stack className="gap-0">
                                    <NavLink
                                        label="Undo"
                                        rightSection={<KeyboardShortcut keys={["Ctrl", "Z"]} lowkey withPluses />}
                                        icon={<TbArrowBack />}
                                        onClick={andClose(undo)}
                                    />
                                    <NavLink
                                        label="Redo"
                                        rightSection={<KeyboardShortcut keys={["Ctrl", "Y"]} lowkey withPluses />}
                                        icon={<TbArrowForward />}
                                        onClick={andClose(redo)}
                                    />
                                </Stack>}
                        </div>
                    </Stack>
                </FocusTrap>
            </Popover.Dropdown>
        </Popover>
    )
}


function PinnedNode({ id, onAdd }) {

    const definition = WebDefinitions.get(id)
    const [unpinning, setUnpinning] = useState(false)
    const toggleUnpinning = () => setUnpinning(!unpinning)

    const [, setPinnedNodes] = useLocalStorage({
        key: LOCAL_STORAGE_KEYS.PINNED_NODES,
    })
    const unpin = () => setPinnedNodes(pinned => pinned.filter(p => p != id))

    return (
        <Tooltip label={`${unpinning ? "Unpin" : "Add"} "${definition.name}"`}>
            <ActionIcon
                size="xl"
                className="bg-white base-border"
                onClick={() => {
                    if (unpinning)
                        unpin()
                    else
                        onAdd?.(definition)
                }}
                onContextMenu={ev => {
                    ev.preventDefault()
                    toggleUnpinning()
                }}
            >
                {unpinning ?
                    <TbPinnedOff /> :
                    <definition.icon />}
            </ActionIcon>
        </Tooltip>
    )
}