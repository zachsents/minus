import { Center, Loader } from "@mantine/core"


export default function CenteredLoader({ containerProps = {}, loaderProps = {} }) {
    return (
        <Center py="xl" {...containerProps}>
            <Loader size="xs" {...loaderProps} />
        </Center>
    )
}
