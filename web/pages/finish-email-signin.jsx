import { LoadingOverlay, Text } from "@mantine/core"
import { finishEmailSignIn } from "@web/modules/firebase/auth"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { useMutation } from "react-query"


export default function FinishEmailSignInPage() {

    const router = useRouter()

    const { mutate: signIn, ...query } = useMutation(finishEmailSignIn, {
        onSuccess: () => {
            router.push("/dashboard")
        }
    })

    useEffect(() => {
        signIn()
    }, [])

    return <>
        <LoadingOverlay visible={query.isLoading} />
        <Text className="text-xl text-center my-xl">
            {query.isSuccess ?
                "You've been signed in!" :
                <>
                    Uh oh. We ran into an issue signing you in. <Link href="/login">Please try again.</Link>
                </>}
        </Text>
    </>
}