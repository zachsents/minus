import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { Notifications } from "@mantine/notifications"
import "@web/modules/firebase"
import { fire } from "@web/modules/firebase"
import "@web/styles/globals.css"
import "@web/styles/backgrounds.css"
import { mantineTheme } from "@web/theme"
import { QueryClient, QueryClientProvider } from "react-query"
import { AuthProvider, FirebaseAppProvider, FirestoreProvider } from "reactfire"
import { MODALS } from "@web/modules/constants"
import ConfirmImportantModal from "@web/components/ConfirmImportantModal"
import TimeAgo from 'javascript-time-ago'
import en from "javascript-time-ago/locale/en"


const queryClient = new QueryClient()
TimeAgo.addDefaultLocale(en)


export default function MyApp({ Component, pageProps }) {
    return (
        <FirebaseAppProvider firebaseApp={fire.app}>
            <AuthProvider sdk={fire.auth}>
                <FirestoreProvider sdk={fire.db}>
                    <QueryClientProvider client={queryClient}>
                        <MantineProvider theme={mantineTheme} withNormalizeCSS withGlobalStyles withCSSVariables>
                            <ModalsProvider modals={modals}>
                                {/* This wrapper makes the footer stick to the bottom of the page */}
                                <div className="min-h-screen flex flex-col">
                                    <Component {...pageProps} />
                                </div>
                                <Notifications autoClose={3000} />
                            </ModalsProvider>
                        </MantineProvider>
                    </QueryClientProvider>
                </FirestoreProvider>
            </AuthProvider>
        </FirebaseAppProvider>
    )
}

const modals = {
    [MODALS.IMPORTANT_CONFIRM]: ConfirmImportantModal,
}

