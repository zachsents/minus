import { TbAbacus, TbBusinessplan, TbHeartHandshake, TbStarFilled, TbTriangleSquareCircle } from "react-icons/tb"
import { PLAN } from "shared/constants/plans"


export const PLAN_INFO = {
    [PLAN.FREE]: {
        label: "Free",
        icon: TbTriangleSquareCircle,
        color: "gray",
        monthlyPrice: 0,
        annualPrice: 0,
        tagLine: "Get hooked on automation.",
        createOrgDescription: "See what it means to build automations."
    },
    [PLAN.STARTER]: {
        label: "Starter",
        icon: TbAbacus,
        color: "blue",
        monthlyPrice: 35,
        annualPrice: 29,
        tagLine: "For individuals and small teams.",
        createOrgDescription: "Streamline your business with simple automations.",
    },
    [PLAN.PRO]: {
        label: "Pro",
        icon: TbStarFilled,
        color: "yellow",
        monthlyPrice: 115,
        annualPrice: 99,
        tagLine: "For advanced builders.",
        createOrgDescription: "Access advanced features to automate your business."

    },
    [PLAN.BUSINESS]: {
        label: "Business",
        icon: TbBusinessplan,
        color: "orange",
        monthlyPrice: 350,
        annualPrice: 299,
        tagLine: "For teams that need more.",
        createOrgDescription: "Access all features and invite your team to collaborate on workflows.",
    },
    [PLAN.EXPERTS]: {
        label: "Experts",
        icon: TbHeartHandshake,
        color: "dark",
        monthlyPrice: 1055,
        annualPrice: 949,
        tagLine: "Automation experts at your service.",
        createOrgDescription: "Provide us with some information about your automation needs and we'll contact you to book a call.",
    },
}