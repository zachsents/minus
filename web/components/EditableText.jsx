import { ActionIcon, Group, TextInput } from "@mantine/core"
import { getHotkeyHandler, useClickOutside } from "@mantine/hooks"
import { stopPropagation } from "@web/modules/props"
import classNames from "classnames"
import { useState } from "react"
import { TbCheck, TbPencil } from "react-icons/tb"


export default function EditableText({ children, value, onChange, cancelOnClickOutside = false, showSaveButton = false,
    className = "", iconClassName = "" }) {

    const [editing, setEditing] = useState(false)
    const [workingValue, setWorkingValue] = useState(value)

    const startEditing = () => {
        setEditing(true)
        setWorkingValue(value)
    }

    const cancelEditing = () => {
        setEditing(false)
        setWorkingValue(value)
    }

    const finishEditing = () => {
        if (workingValue === value || !workingValue)
            return cancelEditing()

        setEditing(false)
        onChange?.(workingValue)
    }

    const hotKeyHandler = getHotkeyHandler([
        ["Enter", finishEditing],
        ["Escape", cancelEditing],
    ])

    const clickOutsideRef = useClickOutside(cancelOnClickOutside ? cancelEditing : finishEditing)

    return editing ?
        <TextInput
            value={workingValue} onChange={ev => setWorkingValue(ev.target.value)}
            onKeyDown={hotKeyHandler}
            classNames={{ input: "min-h-[2em] h-[2em]" }}
            rightSection={showSaveButton ?
                <ActionIcon size="xs" radius="sm" {...stopPropagation()} onClick={finishEditing}>
                    <TbCheck />
                </ActionIcon> :
                undefined}
            w={`${workingValue.length + 2}ch`} miw="8rem" maw="100%"
            ref={clickOutsideRef}
        /> :
        <Group
            spacing="xs" onClick={startEditing}
            className={classNames("group px-xs rounded-sm cursor-text hover:bg-gray-100", className)}
        >
            {children}
            <TbPencil
                className={classNames("opacity-0 group-hover:opacity-100", iconClassName)}
            />
        </Group>
}
