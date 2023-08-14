import { Button, useMantineTheme } from "@mantine/core"
import { motion } from "framer-motion"


export default function GlassButton({ children, matchColor = false, ...props }) {

    const theme = useMantineTheme()

    const buttonOutlineColor = matchColor ?
        typeof matchColor === "string" ? (theme.colors[matchColor]?.[Shade] ?? matchColor) : theme.colors[props.color || "primary"][Shade] :
        theme.colors.gray[Shade]

    return (
        <Button
            component={motion.button}
            style={{
                outlineColor: buttonOutlineColor,
                outlineStyle: "solid",
            }}
            variants={{
                idle: {
                    outlineWidth: 0,
                },
                hovered: {
                    outlineWidth: "0.5em",
                }
            }}
            initial="idle"
            whileHover="hovered"
            {...props}
        >
            {children}
        </Button>
    )
}

const Shade = 1