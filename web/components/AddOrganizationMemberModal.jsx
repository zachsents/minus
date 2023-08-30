import { Avatar, Button, Center, Group, Loader, Stack, Text, TextInput } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useDebouncedValue } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import { useAPI, useAPIQuery } from "@web/modules/firebase/api"
import { TbUser } from "react-icons/tb"
import { API_ROUTE } from "shared/firebase"


export default function AddOrganizationMemberModal({ context, id, innerProps: {
    orgId,
} = {} }) {

    const form = useForm({
        initialValues: {
            email: "",
            makeAdmin: false,
        },
        validate: {
            email: (value) => !value || !value.includes("@"),
        },
        // validateInputOnChange: true,
    })

    const [debouncedEmail] = useDebouncedValue(form.values.email, 1000)

    const [emailData, emailDataQuery] = useAPIQuery(API_ROUTE.GET_PUBLIC_USER_DATA, {
        userEmail: debouncedEmail,
    }, {
        enabled: form.isValid() && !!debouncedEmail,
        retry: false,
    })
    const emailDataLoading = emailDataQuery.isFetching || debouncedEmail !== form.values.email
    const hasAccount = !!emailData

    const [inviteMember, inviteMemberQuery] = useAPI(API_ROUTE.INVITE_USER_TO_ORGANIZATION)

    const confirm = async () => {
        try {
            await inviteMember({
                orgId,
                userEmail: form.values.email,
                // makeAdmin: form.values.makeAdmin,
            })
            notifications.show({
                title: "Invitation sent!",
                message: `We've sent an invitation to ${form.values.email}.`,
            })
            context.closeModal(id)
        }
        catch (err) {
            console.error(err)
        }
    }

    const cancel = () => {
        context.closeModal(id)
    }

    return (
        <form onSubmit={form.onSubmit(confirm)}>
            <Stack>
                <TextInput
                    label="Email"
                    placeholder="mark@facebook.com"
                    disabled={inviteMemberQuery.isLoading}
                    data-autofocus
                    {...form.getInputProps("email")}
                />

                {form.isValid() &&
                    (emailDataLoading ?
                        <Center>
                            <Loader size="xs" variant="dots" />
                        </Center> :
                        hasAccount ?
                            <Group spacing="xs" position="center">
                                <Avatar color="gray" src={emailData.photoURL} radius="xl" size="sm">
                                    <TbUser />
                                </Avatar>

                                <Text size="sm">
                                    {emailData.displayName || emailData.email}
                                </Text>

                                <Text size="xs" color="dimmed">
                                    Minus User
                                </Text>
                            </Group> :
                            <Text size="xs" color="dimmed" ta="center">
                                No account found for this email. We&apos;ll send them an invitation to join Minus.
                            </Text>)}

                {/* <Divider color="gray.2" />
                <Checkbox
                    label="Make Admin"
                    {...form.getInputProps("makeAdmin")}
                />
                <Divider color="gray.2" /> */}

                {inviteMemberQuery.isError &&
                    <Text color="red" size="sm">
                        {inviteMemberQuery.error?.message}
                    </Text>}

                <Group position="apart">
                    <Button variant="subtle" onClick={cancel}>
                        Cancel
                    </Button>
                    <Button disabled={!form.isValid()} loading={inviteMemberQuery.isLoading} type="submit">
                        Invite Member
                    </Button>
                </Group>
            </Stack>
        </form>
    )
}
