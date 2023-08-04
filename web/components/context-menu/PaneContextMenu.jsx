import { FocusTrap, NavLink, Popover, Stack, TextInput } from "@mantine/core"
import { useWindowEvent } from "@mantine/hooks"
import { RF_STORE_PROPERTIES } from "@web/modules/constants"
import { useProjectRFToScreen } from "@web/modules/graph"
import { createActionNode, useStoreProperty } from "@web/modules/nodes"
import classNames from "classnames"
import { useRef, useState } from "react"
import { TbArrowBack, TbArrowForward } from "react-icons/tb"
import KeyboardShortcut from "../KeyboardShortcut"
import NodeSearch from "../NodeSearch"
import { useEffect } from "react"
import { useReactFlow } from "reactflow"


export default function PaneContextMenu() {

    const rf = useReactFlow()

    const [opened, setOpened] = useStoreProperty(RF_STORE_PROPERTIES.PANE_CONTEXT_MENU_OPENED)
    const [paneContextMenuPosition] = useStoreProperty(RF_STORE_PROPERTIES.PANE_CONTEXT_MENU_POSITION)

    const close = () => setOpened(false)
    const andClose = (fn) => () => {
        fn()
        close()
    }

    const screen = useProjectRFToScreen(paneContextMenuPosition)

    const [undo] = useStoreProperty(RF_STORE_PROPERTIES.UNDO)
    const [redo] = useStoreProperty(RF_STORE_PROPERTIES.REDO)

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

        if (ev.key == "ArrowDown")
            return resultContainerRef.current?.firstChild?.focus()

        if (!ev.ctrlKey && global.document.activeElement != searchRef.current)
            searchRef.current?.focus()
    })

    const addNode = definition => {
        createActionNode(rf, definition.id, paneContextMenuPosition)
        close()
    }

    return (
        <Popover
            opened={opened} onClose={close}
            clickOutsideEvents={["pointerdown", "touchstart"]}
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
                    <Stack className="gap-xs w-50">
                        <TextInput
                            value={query} onChange={ev => setQuery(ev.currentTarget.value)}
                            placeholder="Start typing to search nodes..."
                            size="xs"
                            ref={searchRef}
                        />

                        <div className="bg-white base-border shadow-md rounded-sm overflow-hidden">
                            {query ?
                                <Stack className="gap-0" ref={resultContainerRef}>
                                    <NodeSearch query={query} onAdd={addNode} />
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