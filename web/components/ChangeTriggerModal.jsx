import { Center, Group, Loader, Stack, Text, ThemeIcon } from "@mantine/core"
import { modals } from "@mantine/modals"
import { MODALS } from "@web/modules/constants"
import { useAPI } from "@web/modules/firebase/api"
import { useSearch } from "@web/modules/search"
import { TRIGGER_INFO } from "@web/modules/triggers"
import { useWorkflow } from "@web/modules/workflows"
import classNames from "classnames"
import { TbArrowRight } from "react-icons/tb"
import { API_ROUTE } from "shared/firebase"
import SearchInput from "./SearchInput"


const triggers = Object.entries(TRIGGER_INFO).map(([id, info]) => ({ ...info, id }))


export default function ChangeTriggerModal({ id, context }) {

    const [workflow] = useWorkflow(null, true)
    const hasTrigger = !!workflow?.trigger

    const [filteredTriggers, query, setQuery] = useSearch(triggers, {
        selector: trigger => trigger.name,
    })

    const [changeTrigger, changeTriggerQuery] = useAPI(API_ROUTE.CHANGE_WORKFLOW_TRIGGER, {
        triggerId: workflow?.trigger?.id,
    }, {
        onSuccess: () => context.closeModal(id)
    })

    return (
        <Stack>
            {hasTrigger &&
                <div>
                    <Text className="text-xs text-gray uppercase font-bold">Current Trigger</Text>
                    <TriggerSearchResult trigger={workflow.trigger.info} />
                </div>}

            <SearchInput
                value={query}
                onChange={event => setQuery(event.currentTarget.value)}
                onClear={() => setQuery("")}
                noun="trigger"
                quantity={triggers.length ?? 0}
            />

            {changeTriggerQuery.isLoading ?
                <Center py="xl">
                    <Loader size="sm" />
                </Center> :
                filteredTriggers.map(trigger => (
                    <TriggerSearchResult
                        trigger={trigger}
                        withBorder
                        onClick={() => changeTrigger({ newTriggerType: trigger.id })}
                        key={trigger.id}
                    />
                ))}
        </Stack>
    )
}


function TriggerSearchResult({ trigger, onClick, withBorder = false }) {
    return (
        <div
            onClick={onClick}
            className={classNames({
                "group rounded-sm px-md py-xs": true,
                "hover:bg-gray-50 cursor-pointer": !!onClick,
                "base-border": withBorder,
            })}
        >
            <Group noWrap position="apart">
                <Group noWrap>
                    <ThemeIcon color={trigger.color}>
                        <trigger.icon />
                    </ThemeIcon>
                    <div>
                        <Text>
                            {trigger.name}
                        </Text>
                        <Text className="text-gray text-sm">
                            {trigger.whenName}
                        </Text>
                    </div>
                </Group>

                {!!onClick &&
                    <Group noWrap className="gap-xs text-primary font-bold hidden group-hover:flex">
                        <Text>Set up</Text>
                        <TbArrowRight />
                    </Group>}
            </Group>
        </div>
    )
}


export function openChangeTriggerModal() {
    modals.openContextModal({
        modal: MODALS.CHANGE_TRIGGER,
        centered: true,
        size: "xl",
        title: "Change Trigger",
    })
}