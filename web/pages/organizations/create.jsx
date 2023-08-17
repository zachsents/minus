import { Badge, Box, Button, Group, SegmentedControl, Space, Stack, Text, TextInput, Title } from "@mantine/core"
import { useForm } from "@mantine/form"
import DashboardHeader from "@web/components/DashboardHeader"
import Footer from "@web/components/Footer"
import PageHead from "@web/components/PageHead"
import Section from "@web/components/Section"
import { useCreateOrganization } from "@web/modules/organizations"
import { PLAN_INFO } from "@web/modules/plans"
import { useQueryParam } from "@web/modules/router"
import classNames from "classnames"
import Link from "next/link"
import { useRouter } from "next/router"
import { TbArrowRight, TbExternalLink, TbReportMoney } from "react-icons/tb"
import { PLAN } from "shared/constants/plans"


export default function CreateOrganizationPage() {

    const router = useRouter()

    const form = useForm({
        initialValues: {
            name: "",
            billingFrequency: "annual",
        },
        validate: {
            name: value => value.trim().length == 0,
        },
    })

    const [plan, setPlan] = useQueryParam("plan", PLAN.FREE)
    const PlanInfo = PLAN_INFO[plan]

    const [createOrg, createOrgQuery] = useCreateOrganization()

    const submit = async values => {
        const { orgId } = await createOrg({
            name: values.name,
        })
        router.push(`/organizations/${orgId}`)
    }

    let button
    switch (plan) {
        case PLAN.FREE: button = <Button
            type="submit" rightIcon={<TbArrowRight />}
            disabled={!form.isValid()}
            loading={createOrgQuery.isLoading}
        >
            Create Organization
        </Button>
            break
        case PLAN.EXPERTS: button = <Button
            rightIcon={<TbExternalLink />}
            component={Link} href="https://calendly.com/zachsents/minus-experts-discovery" target="_blank"
            leftIcon={<Badge radius="sm">Free</Badge>}
        >
            Book a Call
        </Button>
            break
        default: button = <Button
            leftIcon={<TbReportMoney />}
            component={Link} href="#"
        >
            Go to Payment
        </Button>
    }

    return (
        <>
            <PageHead title="Create an Organization" />

            <DashboardHeader />

            <Section size="xs" className="mt-xl">
                <Title order={2}>Create an Organization</Title>

                <form className="mt-md" onSubmit={form.onSubmit(submit)}>
                    <Stack spacing="xl">
                        <TextInput
                            label="Organization Name"
                            placeholder="Zapier" required
                            disabled={createOrgQuery.isLoading}
                            {...form.getInputProps("name")}
                        />

                        <Stack className="gap-1">
                            <Text fz="sm">Select a Plan</Text>
                            <SegmentedControl
                                data={planData}
                                color={PlanInfo?.color}
                                value={plan}
                                onChange={value => setPlan(value)}
                                disabled={createOrgQuery.isLoading}
                            />
                        </Stack>

                        {plan &&
                            <PlanCard plan={plan} annual={form.values.billingFrequency == "annual"} />}

                        <Group position="center">
                            <Text fz="xs">Billing Frequency</Text>
                            <SegmentedControl
                                data={[
                                    { value: "monthly", label: "Monthly" },
                                    { value: "annual", label: "Annually" },
                                ]}
                                {...form.getInputProps("billingFrequency")}
                                size="xs"
                            />
                        </Group>

                        <div className="self-center">
                            {button}
                        </div>
                    </Stack>
                </form>
            </Section>

            <Space h="10rem" />

            <Footer showCompanies={false} />
        </>
    )
}


const planData = Object.entries(PLAN_INFO).map(([plan, info]) => ({
    value: plan,
    label: <Group noWrap spacing="xs" position="center">
        <info.icon className="text-sm" />
        <Text>{info.label}</Text>
    </Group>,
}))


function PlanCard({ plan, annual = false }) {

    const info = PLAN_INFO[plan]

    return (
        <Box
            className={classNames({
                "rounded-md px-xl py-md border-solid border-2": true,
                "bg-dark cta-bg": plan === PLAN.EXPERTS,
            })}
            bg={`${info.color}.1`}
            sx={theme => ({
                borderColor: theme.fn.themeColor(info.color, 6)
            })}
        >
            <Group noWrap position="apart" className={classNames({
                "invert": plan === PLAN.EXPERTS,
            })}>
                <Stack className="gap-xs">
                    <Text
                        className="font-bold text-lg"
                        c={`${info.color}.9`}
                    >
                        {info.tagLine}
                    </Text>
                    <Text className="text-gray-800 text-sm">
                        {info.createOrgDescription}
                    </Text>
                </Stack>
                <Stack className="gap-0 items-end">
                    <Text
                        className="font-bold text-2xl"
                        c={`${info.color}.9`}
                    >
                        ${annual ? info.annualPrice : info.monthlyPrice}
                    </Text>
                    <Text className="text-gray-800 text-xs text-right">per month {annual ? "billed annually" : ""}</Text>
                </Stack>
            </Group>
        </Box>
    )
}