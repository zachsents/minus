import Link from "next/link"
import { useRouter } from "next/router"


export default function LinkKeepParams({ children, href, ...props }) {

    const router = useRouter()

    return (
        <Link href={{
            pathname: href,
            query: router.query
        }} {...props}>
            {children}
        </Link>
    )
}
