import { Button, Stack, Text } from "@mantine/core"
import { INTERFACE_ID_PREFIX } from "@web/modules/constants"
import { useCreateEntryInNode, useNodeInterfaces } from "@web/modules/graph/nodes"
import { useMemo } from "react"
import { TbPlus } from "react-icons/tb"
import HandleDefinitionLabel from "./HandleDefinitionLabel"


function InterfaceGroup({ children, definition, dataKey, noneLabel, onCreate, newInterfaceProps = {} }) {

    const interfaces = useNodeInterfaces(undefined, dataKey)

    const canBeAdded = useMemo(
        () => interfaces.filter(i => i.definition == definition.id).length < definition?.groupMax,
        [interfaces]
    )

    const _createInterface = useCreateEntryInNode(undefined, `data.${dataKey}`, INTERFACE_ID_PREFIX)
    const createInterface = () => {
        const newInterface = _createInterface({
            definition: definition?.id,
            name: `New ${definition?.name}`,
            ...newInterfaceProps,
        })
        onCreate?.(newInterface)
    }

    return (
        <Stack spacing={0} className="border-solid border-0 border-b-1 border-gray-300">
            <div className="flex">
                <HandleDefinitionLabel
                    required={definition?.required}
                    description={definition?.description}
                    label={definition?.groupName || definition?.name}
                    className="pt-2 pb-1 px-2"
                />
            </div>

            {children}

            {!children?.length &&
                <Text className="text-xs text-center my-2" color="dimmed">
                    {noneLabel}
                </Text>}

            {canBeAdded &&
                <Button
                    onClick={createInterface}
                    size="xs" compact variant="subtle" leftIcon={<TbPlus />}
                    className="self-center my-1"
                >
                    New {definition?.name}
                </Button>}
        </Stack>
    )
}


export function InputGroup({ children, definition, onCreate }) {
    return (
        <InterfaceGroup
            definition={definition}
            dataKey="inputs"
            noneLabel="No inputs."
            onCreate={onCreate}
            newInterfaceProps={{
                mode: definition?.defaultMode,
            }}
        >
            {children}
        </InterfaceGroup>
    )
}


export function OutputGroup({ children, definition, onCreate }) {
    return (
        <InterfaceGroup
            definition={definition}
            dataKey="outputs"
            noneLabel="No outputs."
            onCreate={onCreate}
            newInterfaceProps={{}}
        >
            {children}
        </InterfaceGroup>
    )
}