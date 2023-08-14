import { Button, Group, Stack, Text, TextInput } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useState } from "react"


/**
 * @typedef {object} ConfirmImportantModalProps
 * @property {string} description
 * @property {string} confirmText
 * @property {string} confirmTest
 * @property {() => void} onConfirm
 * @property {() => void} onCancel
 */


export default function ConfirmImportantModal({ context, id, innerProps: {
    description = "This can't be undone.",
    confirmText = "Confirm",
    confirmTest = "confirm",
    onConfirm,
    onCancel,
} = {} }) {

    const form = useForm({
        initialValues: {
            confirm: "",
        },
        validate: {
            confirm: (value) => value.toLowerCase() == confirmTest.toLowerCase() ? null : "Incorrect confirmation text",
        },
        validateInputOnChange: true,
    })

    const [isLoading, setIsLoading] = useState(false)

    const confirm = async () => {
        setIsLoading(true)
        await onConfirm?.()
        context.closeModal(id)
        setIsLoading(false)
    }

    const cancel = () => {
        context.closeModal(id)
        onCancel?.()
    }

    return (
        <form onSubmit={form.onSubmit(confirm)}>
            <Stack>
                <Text className="text-sm" color="dimmed">{description}</Text>
                {confirmTest &&
                    <TextInput
                        placeholder={`Type "${confirmTest}" to confirm`}
                        data-autofocus
                        {...form.getInputProps("confirm")}
                    />}
                <Group position="apart">
                    <Button variant="subtle" onClick={cancel}>
                        Cancel
                    </Button>
                    <Button color="red" loading={isLoading} disabled={!form.isValid()} type="submit">
                        {confirmText}
                    </Button>
                </Group>
            </Stack>
        </form>
    )
}
