import { SpotlightProvider as MantineSpotlightProvider } from "@mantine/spotlight"
import { useUserOrganizations } from "@web/modules/organizations"
import { useWorkflowsAcrossOrganizations } from "@web/modules/workflows"
import { useRouter } from "next/router"
import { TbBrandStackshare, TbComponents, TbSearch } from "react-icons/tb"


export function SpotlightProvider({ children }) {

    const router = useRouter()
    const orgs = useUserOrganizations()

    const orgActions = orgs.all.map(org => ({
        title: org.name,
        description: "Organization",
        onTrigger: () => router.push(`/organizations/${org.id}`),
        icon: <TbComponents />,
    }))

    const allWorkflows = useWorkflowsAcrossOrganizations()

    const workflowActions = allWorkflows?.map(workflow => ({
        title: workflow.name,
        description: "Workflow",
        onTrigger: () => router.push(`/workflows/${workflow.id}/edit`),
        icon: <TbBrandStackshare />,
    }))

    return (
        <MantineSpotlightProvider
            actions={[
                ...orgActions,
                ...workflowActions,
            ]}
            searchIcon={<TbSearch />}
            searchPlaceholder="Search..."
            shortcut={spotlightShortcuts}
            nothingFoundMessage="Nothing found."
        >
            {children}
        </MantineSpotlightProvider>
    )
}

const spotlightShortcuts = ["/", "mod+k"]