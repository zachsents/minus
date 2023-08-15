import { ScrollArea } from "@mantine/core"
import { useEventListener, useViewportSize } from "@mantine/hooks"
import { useEffect, useState } from "react"


export default function HorizontalScrollBox({ className, children }) {

    const [width, setWidth] = useState(0)

    const containerRef = el => {
        const w = el?.offsetWidth
        if (w && w != width)
            setWidth(w - 1)
    }

    const { width: viewportWidth } = useViewportSize()

    useEffect(() => {
        setWidth(0)
    }, [viewportWidth])

    const viewportRef = useEventListener("wheel", ev => {
        ev.preventDefault()
        if (ev.deltaY == 0) return
        viewportRef.current.scrollTo({
            left: viewportRef.current.scrollLeft + ev.deltaY * 2,
            behavior: "smooth"
        })
    })

    return (
        <div className={className} ref={containerRef}>
            <ScrollArea
                w={width} h="100%"
                scrollbarSize={9} offsetScrollbars
                classNames={{
                    viewport: "[&>div]:h-full [&>div]:!block",
                }}
                viewportRef={viewportRef}
            >
                {children}
            </ScrollArea>
        </div>
    )
}
