import { Center, Loader } from "@mantine/core"


export default function CenteredLoader({ noPadding = false, size = "xs", containerProps = {}, loaderProps = {} }) {
    return (
        <Center py={noPadding ? undefined : "xl"} {...containerProps}>
            <Loader size={size} {...loaderProps} />
        </Center>
    )
}
