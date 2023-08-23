import { Button, Text } from "@mantine/core"
import classNames from "classnames"
import Link from "next/link"
import { useRouter } from "next/router"


export function NavLink({ children, button = false, href, className, ...props }) {

    const router = useRouter()

    const isHash = href?.startsWith("#")
    const isActive = isHash ? router.asPath.includes(href) : router.asPath === href

    return (
        <Link
            href={href}
            shallow={isHash} scroll={!isHash}
            className="text-dark"
        >
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
