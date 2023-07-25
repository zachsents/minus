import { additionalCSSVariables } from "@web/theme"
import { Head, Html, Main, NextScript } from "next/document"


export default function Document() {

    return (
        <Html lang="en">
            <Head>
                {/* Setup */}
                <meta charSet="UTF-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

                {/* Title & Description */}
                <title key="title">xxx</title>
                <meta
                    name="description"
                    content="xxx"
                    key="description"
                />

                {/* Favicon & other icons */}
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="icon" href="/favicon.ico" type="image/x-icon" />
                <link rel="manifest" href="/site.webmanifest" />

                {/* OpenGraph */}
                <meta
                    property="og:title"
                    content="xxx"
                    key="ogtitle"
                />
                <meta
                    property="og:description"
                    content="xxx"
                    key="ogdescription"
                />
                <meta property="og:image" content="/og.png" />

                {/* Assets */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=JetBrains+Mono:wght@300;400;500;600&family=Rubik:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap" rel="stylesheet" />

                {/* Global Styles */}
                <style>
                    {`html { ${additionalCSSVariables} }`}
                </style>
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}