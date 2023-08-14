import { Button, Group, SegmentedControl, Space, Stack, Text, TextInput, Textarea, Title } from "@mantine/core"
import { useForm } from "@mantine/form"
import DashboardHeader from "@web/components/DashboardHeader"
import Footer from "@web/components/Footer"
import PageHead from "@web/components/PageHead"
import Section from "@web/components/Section"
import { PLAN, PLAN_COLORS, PLAN_ICONS, PLAN_LABELS } from "@web/modules/constants"
import { useQueryParam } from "@web/modules/router"
import { TbArrowRight } from "react-icons/tb"


export default function CreateOrganizationPage() {

    const form = useForm({
        initialValues: {
            name: "",
            message: "",
        },
        validate: {
            name: value => value.trim().length == 0,
        },
    })

    const [plan, setPlan] = useQueryParam("plan", PLAN.FREE)

    return (
        <>
            <PageHead title="Your Organizations" />

            <DashboardHeader />

            <Section size="xs" className="mt-xl">
                <Title order={2}>Create an Organization</Title>

                <form className="mt-md">
                    <Stack spacing="xl">
                        <TextInput
                            label="Organization Name"
                            placeholder="Zapier" required
                            {...form.getInputProps("name")}
                        />

                        <Stack className="gap-1">
                            <Text fz="sm">Select a Plan</Text>
                            <SegmentedControl
                                data={planData}
                                color={PLAN_COLORS[plan]}
                                value={plan}
                                onChange={value => setPlan(value)}
                            />
                        </Stack>

                        {plan === PLAN.EXPERTS && <>
                            <div className="bg-dark cta-bg rounded-md px-xl py-md">
                                <Group noWrap>
                                    <Stack className="gap-xs">
                                        <Text className="text-white font-bold text-lg">
                                            Automation experts at your service.
                                        </Text>
                                        <Text className="text-gray-300 text-sm">
                                            Provide us with some information about your automation needs and we&apos;ll contact you to book a call.
                                        </Text>
                                    </Stack>
                                    <Stack className="gap-0 items-end">
                                        <Text className="text-white font-bold text-2xl">$949</Text>
                                        <Text className="text-gray-300 text-xs">per month</Text>
                                    </Stack>
                                </Group>
                            </div>

                            <Textarea
                                label="Tell us about your organization"
                                placeholder="We are a team of 10 sales people looking to..."
                                autosize minRows={2} maxRows={10}
                                {...form.getInputProps("message")}
                            />
                        </>}

                        <Button type="submit" rightIcon={<TbArrowRight />} className="self-center">
                            Create Organization
                        </Button>
                    </Stack>
                </form>
            </Section>

            <Space h="10rem" />

            <Footer showCompanies={false} />
        </>
    )
}


const planData = Object.values(PLAN).map(plan => {
    const PlanIcon = PLAN_ICONS[plan]
    return {
        value: plan,
        label: <Group noWrap>
            <PlanIcon className="text-sm" />
            <Text>{PLAN_LABELS[plan]}</Text>
        </Group>,
    }
})