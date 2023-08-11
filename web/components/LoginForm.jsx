import { Button, Center, Loader, Space, Stack, Text, TextInput, Title } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useLocalStorage } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import { LOCAL_STORAGE_KEYS } from "@web/modules/constants"
import { sendEmailSignInLink, signInWithGoogle } from "@web/modules/firebase/auth"
import { useRouter } from "next/router"
import { useState } from "react"
import { FcGoogle } from "react-icons/fc"
import { TbArrowLeft, TbMail } from "react-icons/tb"
import { useMutation } from "react-query"


export default function LoginForm({ redirect = "/dashboard" }) {

    const router = useRouter()

    const [signInState, setSignInState] = useState()
    const [, setHasLoggedIn] = useLocalStorage({ key: LOCAL_STORAGE_KEYS.HAS_LOGGED_IN })

    const showErrorNotification = () => notifications.show({
        title: "Login Failed",
        message: "There was a problem logging you in.",
        color: "red",
    })

    const { mutate: googleSignIn, ...googleQuery } = useMutation(() => signInWithGoogle(), {
        onSuccess: () => {
            setHasLoggedIn(true)
            router.push(redirect)
        },
        onError: () => {
            setSignInState(null)
            showErrorNotification()
        },
    })

    const { mutate: emailSignIn, ...emailQuery } = useMutation((email) => sendEmailSignInLink(email), {
        onSuccess: () => {
            setSignInState("emailSuccess")
        },
        onError: () => {
            setSignInState(null)
            showErrorNotification()
        },
    })

    const emailForm = useForm({
        initialValues: {
            email: "",
        },
        validate: {
            email: value => (!value || !value.includes("@")) && "Please enter a valid email",
        }
    })

    switch (signInState) {
        case "google": return googleQuery.isLoading ?
            <LoginShell title="Signing you in...">
                <Center my="xl">
                    <Loader size="sm" />
                </Center>
            </LoginShell> :
            <LoginShell title="Success!" />

        case "email": return (
            <form onSubmit={emailForm.onSubmit(values => {
                emailSignIn(values.email)
            })}>
                <Stack spacing="xs">
                    <Text color="dimmed" align="center">
                        Enter your email
                    </Text>
                    <TextInput
                        placeholder="mark@facebook.com"
                        type="email"
                        {...emailForm.getInputProps("email")}
                        disabled={emailQuery.isLoading}
                    />

                    <Space h="xs" />

                    <Button type="submit" loading={emailQuery.isLoading}>
                        Next
                    </Button>
                    <Button leftIcon={<TbArrowLeft />} variant="subtle" onClick={() => {
                        setSignInState(null)
                    }}>
                        Go back
                    </Button>
                </Stack>
            </form>
        )

        case "emailSuccess": return (
            <LoginShell title="">
                <Text align="center">A sign-in link has been sent to your email.</Text>
                <Text size="sm" color="dimmed" align="center">You may close this window.</Text>
            </LoginShell>
        )
    }

    return (
        <LoginShell>
            <Text size="sm" color="dimmed" align="center">
                If you don&apos;t have an account, one will be created.
            </Text>

            <Space h="xs" />

            <Button
                variant="white"
                color="gray"
                radius="xl"
                leftIcon={<FcGoogle />}
                className="base-border hover:bg-gray-50"
                onClick={() => {
                    setSignInState("google")
                    googleSignIn()
                }}
            >
                Sign in with Google
            </Button>

            <Button
                radius="xl"
                variant="light"
                leftIcon={<TbMail />}
                onClick={() => setSignInState("email")}
            >
                Sign in with email
            </Button>
        </LoginShell>
    )
}


function LoginShell({ children, title }) {

    const [hasLoggedIn] = useLocalStorage({ key: LOCAL_STORAGE_KEYS.HAS_LOGGED_IN })

    title ??= <>
        Sign {hasLoggedIn ? "in to" : "up for"}
        <Text span weight={600} color="primary"> minus</Text>
    </>

    return (
        <Stack spacing="xs">
            <Title align="center" size="1.5rem">
                {title}
            </Title>

            {children}
        </Stack>
    )
}