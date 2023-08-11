import { Card, Center, Text } from "@mantine/core"
import LoginForm from "@web/components/LoginForm"
import Link from "next/link"


export default function LoginPage() {

    return (
        <Center w="100vw" h="100vh" pb={100} pos="relative" px="sm" className="grid-bg grid-bg-anim">
            <Card w={350} withBorder shadow="sm" className="px-sm py-xl sm:px-xl">
                <LoginForm />
            </Card>

            <div className="absolute top-0 left-0">
                <Link href="/">
                    <Text className="text-gray font-bold text-2xl px-xl py-sm hover:text-primary transition-colors">
                        minus
                    </Text>
                </Link>
            </div>
        </Center>
    )
}
