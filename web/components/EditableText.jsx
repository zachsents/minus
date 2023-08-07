import { ActionIcon, Group, TextInput } from "@mantine/core"
import { getHotkeyHandler, useClickOutside } from "@mantine/hooks"
import { CLICK_OUTSIDE_PD_TS } from "@web/modules/constants"
import { stopPropagation } from "@web/modules/props"
import classNames from "classnames"
import { useEffect } from "react"
import { useState } from "react"
import { TbCheck, TbPencil } from "react-icons/tb"


/**
 * @param {{
 *     value: string,
 *     onChange?: (value: any) => void,
 *     cancelOnClickOutside?: boolean,
 *     showSaveButton?: boolean,
 *     iconTakesUpSpace?: boolean,
 *     className?: string,
 *     classNames?: {
 *         group?: string,
 *         icon?: string,
 *         input?: string,
 *     },
 * }} props
 */
export default function EditableText({
    children, value, onChange, cancelOnClickOutside = false, showSaveButton = false,
    iconTakesUpSpace = true,
    className = "",
    classNames: {
        group: groupClassName = "",
        icon: iconClassName = "",
        input: inputClassName = "",
    } = {},
}) {

    const [editing, setEditing] = useState(false)
    const [workingValue, setWorkingValue] = useState(value ?? "")

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

    const clickOutsideRef = useClickOutside(cancelOnClickOutside ? cancelEditing : finishEditing, CLICK_OUTSIDE_PD_TS)

    useEffect(() => {
        if (editing)
            setTimeout(() => {
                clickOutsideRef.current?.focus()
                clickOutsideRef.current?.select()
            })
    }, [editing])

    return (
        <div className={className}>
            {editing ?
                <TextInput
                    value={workingValue} onChange={ev => setWorkingValue(ev.target.value)}
                    onKeyDown={hotKeyHandler}
                    classNames={{ input: "min-h-[2em] h-[2em]" }}
                    rightSection={showSaveButton ?
                        <ActionIcon size="xs" radius="sm" {...stopPropagation()} onClick={finishEditing}>
                            <TbCheck />
                        </ActionIcon> :
                        undefined}
                    w={`${(workingValue?.length ?? 0) + 2}ch`} miw="8rem" maw="100%"
                    ref={clickOutsideRef}
                    className={inputClassName}
                /> :
                <Group
                    spacing="xs" noWrap onClick={startEditing}
                    className={classNames("group px-xs rounded-sm cursor-text hover:bg-gray-100", groupClassName)}
                >
                    {children}
                    <TbPencil
                        className={classNames({
                            "opacity-0 group-hover:opacity-100": iconTakesUpSpace,
                            "hidden group-hover:block": !iconTakesUpSpace,
                        }, iconClassName)}
                    />
                </Group>}
        </div>
    )
}
