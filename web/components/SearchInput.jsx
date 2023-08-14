import { ActionIcon, Kbd, TextInput } from "@mantine/core"
import { useFocusWithin, useHotkeys, useHover, useMergedRef } from "@mantine/hooks"
import { forwardRef, useRef } from "react"
import { TbSearch, TbX } from "react-icons/tb"


const SearchInput = forwardRef(({
    noun, quantity,
    hotkeys = ["/"],
    onClear,

    onKeyDown,
    ...props
}, ref) => {

    // focusing & hovering states
    const { focused, ref: focusRef } = useFocusWithin()
    const { hovered, ref: hoverRef } = useHover()
    const hoverAndFocusRef = useMergedRef(focusRef, hoverRef)

    // search input ref
    const inputRef = useRef()
    const mergedRef = useMergedRef(inputRef, ref)

    // hotkey for search
    useHotkeys(hotkeys.map(hk => [hk, () => {
        inputRef.current?.focus()
        inputRef.current?.select()
    }]))

    // clearing text input
    const handleClear = () => {
        inputRef.current?.focus()
        onClear?.()
    }

    return (
        // hover ref goes on wrapper so right section doesn't interfere with hover detection
        <div ref={hoverAndFocusRef}>
            <TextInput
                size="sm" icon={<TbSearch />}
                placeholder={(noun != null & quantity != null) ?
                    `Search ${quantity ?? ""} ${noun}${quantity == 1 ? "" : "s"}` :
                    undefined}
                rightSection={
                    hovered ?
                        <ActionIcon size="sm" radius="sm" onClick={handleClear}>
                            <TbX size="0.9em" />
                        </ActionIcon> :
                        focused ?
                            // need this empty div to prevent the input from shrinking
                            <div></div> :
                            <Kbd size="xs">/</Kbd>
                }
                {...props}
                ref={mergedRef}

                // blur when escape is pressed
                onKeyDown={event => {
                    event.key === "Escape" && inputRef.current?.blur()
                    onKeyDown?.(event)
                }}
            />
        </div>
    )
})

SearchInput.displayName = "SearchInput"

export default SearchInput