import { ScrollArea } from "@mantine/core"
import classNames from "classnames"


/**
 * @param {{
 * insideFlex?: boolean,
 * className?: string,
 * } & import("@mantine/core").ScrollAreaAutosizeProps} props
 */
export default function ScrollBox({ children, insideFlex = false, className, ...props }) {

    const scrollAreaComponent =
        <ScrollArea.Autosize
            scrollbarSize={9} offsetScrollbars
            {...props}
            className={classNames("grow basis-0 min-h-0", className)}
        >
            {children}
        </ScrollArea.Autosize>

    return insideFlex ?
        scrollAreaComponent :
        <div className="flex flex-col h-full">
            {scrollAreaComponent}
        </div>
}
