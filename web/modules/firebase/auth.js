import { GoogleAuthProvider, isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink, signInWithPopup, signOut as _signOut } from "firebase/auth"
import { fire } from "."
import { LOCAL_STORAGE_KEYS } from "../constants"
import { useRouter } from "next/router"
import { useMutation } from "react-query"
import { notifications } from "@mantine/notifications"


export async function signInWithGoogle() {
    const provider = new GoogleAuthProvider()
    return signInWithPopup(fire.auth, provider)
        .then(result => {
            console.debug("Logged in with Google popup as", result.user.email)
            return result.user
        })
}


export async function sendEmailSignInLink(email) {
    await sendSignInLinkToEmail(fire.auth, email, {
        url: `${window.location.origin}/finish-email-signin`,
        handleCodeInApp: true,
    })
    window.localStorage.setItem(LOCAL_STORAGE_KEYS.SIGN_IN_EMAIL, email)
}


export async function finishEmailSignIn() {

    if (isSignInWithEmailLink(fire.auth, window.location.href)) {
        let email = window.localStorage.getItem(LOCAL_STORAGE_KEYS.SIGN_IN_EMAIL)
        if (!email)
            // TO DO: make an interface for this
            email = window.prompt("Please provide your email for confirmation")

        const result = await signInWithEmailLink(fire.auth, email, window.location.href)
        console.debug("Logged in with email link as", result.user.email)
        return result.user
    }

    throw new Error("Not a sign in link.")
}


export async function signOut() {
    await _signOut(fire.auth)
}


export function useSignOut(redirect = "/") {
    const router = useRouter()

    const { mutate, ...query } = useMutation(signOut, {
        onSuccess: () => {
            notifications.show({
                title: "You've been signed out!",
            })

            if (redirect)
                router.push(redirect)
        },
    })

    return [mutate, query]
}