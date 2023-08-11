import { Center, Container } from "@mantine/core"
import classNames from "classnames"


export default function Section({ children, className, ...props }) {
    return (
        <Center>
            <Container className={classNames("px-xl grow", className)} {...props}>
                {children}
            </Container>
        </Center>
    )
}
