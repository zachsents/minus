import { ScrollArea, useMantineTheme } from "@mantine/core"
import classNames from "classnames"


/**
 * @param {{
 * base?: boolean,
 * insideFlex?: boolean,
 * className?: string,
 * viewportPadding?: import("@mantine/core").SpacingValue,
 * } & import("@mantine/core").ScrollAreaAutosizeProps} props
 */
export default function ScrollBox({ children, base = false, insideFlex = false, className, viewportPadding, ...props }) {

    const theme = useMantineTheme()

    const scrollAreaProps = {
        scrollbarSize: 9,
        offsetScrollbars: true,
        styles: {
            viewport: {
                padding: viewportPadding && theme.spacing[viewportPadding]
            },
        },
    }

    if (base)
        return (
            <ScrollArea.Autosize
                {...scrollAreaProps}
                {...props}
                className={className}
            >
                {children}
            </ScrollArea.Autosize>)

    const scrollAreaComponent =
        <ScrollArea.Autosize
            {...scrollAreaProps}
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
