import { Button, Text } from "@mantine/core"
import classNames from "classnames"
import Link from "next/link"
import { useRouter } from "next/router"


export function NavLink({ children, button = false, href, className, ...props }) {

    const router = useRouter()
    const isActive = router.asPath.includes(href)

    return (
        <Link href={href} shallow={href?.startsWith("#")} scroll={!href?.startsWith("#")}>
            {button ?
                <Button radius="xl" size="md" {...props}>
                    {children}
                </Button> :
                <Text
                    size="md" weight={600} {...props}
                    className={classNames("hover:text-primary", {
                        "text-primary": isActive,
                    }, className)}
                >
                    {children}
                </Text>}
        </Link>
    )
}
