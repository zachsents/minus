import { Group, Kbd, Text } from "@mantine/core"
import classNames from "classnames"
import { Fragment } from "react"


const MOD_REGEX = /mod|ctrl|cmd/i

// eslint-disable-next-line no-undef
const isMac = typeof navigator !== "undefined" && /mac/i.test(navigator.userAgent)


export default function KeyboardShortcut({ keys = [], lowkey = false, withPluses = false, size = "xs", className, ...props }) {

    return (
        <Group noWrap className="gap-1">
            {keys.map((key, i) => {

                const content = (isMac && MOD_REGEX.test(key)) ? "⌘" : key

                return (
                    <Fragment key={i}>
                        {lowkey ?
                            <Text
                                size={size} color="dimmed"
                                {...props}
                                className={classNames("", className)}
                            >
                                {content}
                            </Text> :
                            <Kbd
                                size={size}
                                {...props}
                                className={classNames("py-0", className)}
                            >
                                {content}
                            </Kbd>}
                        {withPluses && i < keys.length - 1 &&
                            <Text className="text-gray">+</Text>}
                    </Fragment>
                )
            })}
        </Group>
    )
}
