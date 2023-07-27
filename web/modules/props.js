
export function stopPropagation(events = ["onMouseDown", "onTouchStart"]) {

    if (Array.isArray(events))
        events = Object.fromEntries(events.map(event => [event, null]))

    const functionEntries = Object.entries(events).map(([event, func]) => [
        event,
        (ev, ...args) => {
            ev.stopPropagation()
            func?.(ev, ...args)
        }
    ])

    return Object.fromEntries(functionEntries)
}