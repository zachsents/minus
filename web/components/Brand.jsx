import { Text, useMantineTheme } from "@mantine/core"
import classNames from "classnames"
import { motion } from "framer-motion"
import Link from "next/link"


/**
 * @param {Object} props
 * @param {"normal" | "gray" | "white" | "white-shiny"} [props.variant="normal"]
 */
export default function Brand({ linkProps = {}, variant = "normal", ...props }) {

    const theme = useMantineTheme()

    const textProps = {
        size: "2rem",
        weight: 600,
    }

    return (
        <Link href="/" {...linkProps}>
            {variant === "normal" &&
                <Text {...textProps} color={theme.fn.primaryColor()} {...props}>
                    <motion.span {...normalAnim(theme, 4)}>
                        minus
                    </motion.span>
                </Text>}

            {variant === "gray" &&
                <Text {...textProps} {...props}>
                    <motion.span {...grayAnim(theme)}>
                        minus
                    </motion.span>
                </Text>}

            {variant === "white" &&
                <Text {...textProps} color="white" {...props}>
                    <motion.span {...normalAnim(theme, 8)}>
                        minus
                    </motion.span>
                </Text>}

            {variant === "white-shiny" &&
                <Text
                    {...textProps} color="transparent" {...props}
                    className={classNames("sliding-color-bg bg-clip-text", props.className)}
                >
                    minus
                </Text>}
        </Link>
    )
}

const ShadowOffset = 0.06

const normalAnim = (theme, shade) => ({
    initial: {
        textShadow: "none"
    },
    whileHover: {
        textShadow: `${ShadowOffset}em ${ShadowOffset}em 0 ${theme.colors.pink[shade]}, ${ShadowOffset * 2}em ${ShadowOffset * 2}em 0 ${theme.colors.yellow[shade]}`
    },
})

const grayAnim = theme => {
    const inherit = normalAnim(theme, 4)
    return {
        initial: {
            ...inherit.initial,
            color: theme.colors.gray[5],
        },
        whileHover: {
            ...inherit.whileHover,
            color: theme.fn.primaryColor(),
        },
    }
}