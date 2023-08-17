import { Button, Space, Stack, TextInput, Title } from "@mantine/core"
import { useForm } from "@mantine/form"
import DashboardHeader from "@web/components/DashboardHeader"
import Footer from "@web/components/Footer"
import PageHead from "@web/components/PageHead"
import Section from "@web/components/Section"
import { useCreateWorkflow } from "@web/modules/workflows"
import { useRouter } from "next/router"
import { TbArrowRight } from "react-icons/tb"


export default function CreateWorkflowPage() {

    const router = useRouter()

    const form = useForm({
        initialValues: {
            name: "",
        },
        validate: {
            name: value => value.trim().length == 0,
        },
    })

    const [createWorkflow, createWorkflowQuery] = useCreateWorkflow()

    const submit = async values => {
        const { workflowId } = await createWorkflow({
            name: values.name,
            orgId: router.query.orgId,
        })
        router.push(`/workflows/${workflowId}/edit`)
    }

    return (
        <>
            <PageHead title="Create a Workflow" />

            <DashboardHeader />

            <Section size="xs" className="mt-xl">
                <Title order={2}>Create a Workflow</Title>

                <form className="mt-md" onSubmit={form.onSubmit(submit)}>
                    <Stack spacing="xl">
                        <TextInput
                            label="Workflow Name"
                            placeholder="Handle customer support emails" required
                            disabled={createWorkflowQuery.isLoading}
                            {...form.getInputProps("name")}
                        />

                        <div className="self-center">
                            <Button
                                type="submit" rightIcon={<TbArrowRight />}
                                disabled={!form.isValid()}
                                loading={createWorkflowQuery.isLoading}
                            >
                                Create Workflow
                            </Button>
                        </div>
                    </Stack>
                </form>
            </Section>

            <Space h="10rem" />

            <Footer showCompanies={false} />
        </>
    )
}
