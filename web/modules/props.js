
/**
 * @param {string | string[] | Object.<string, Function>} events
 */
export function stopPropagation(events = ["onMouseDown", "onTouchStart"], preventDefault = false) {

    if (typeof events === "string")
        events = [events]

    if (Array.isArray(events))
        events = Object.fromEntries(events.map(event => [event, null]))

    const functionEntries = Object.entries(events).map(([event, func]) => [
        event,
        (ev, ...args) => {
            ev.stopPropagation()
            ev.nativeEvent?.stopImmediatePropagation()

            if (preventDefault) {
                ev.preventDefault()
                ev.nativeEvent?.preventDefault()
            }

            func?.(ev, ...args)
        }
    ])

    return Object.fromEntries(functionEntries)
}


/**
 * @param {string | string[] | Object.<string, Function>} events
 */
export function preventDefault(events = ["onMouseDown", "onTouchStart"]) {

    if (typeof events === "string")
        events = [events]

    if (Array.isArray(events))
        events = Object.fromEntries(events.map(event => [event, null]))

    const functionEntries = Object.entries(events).map(([event, func]) => [
        event,
        (ev, ...args) => {
            ev.preventDefault()
            ev.nativeEvent?.preventDefault()

            func?.(ev, ...args)
        }
    ])

    return Object.fromEntries(functionEntries)
}