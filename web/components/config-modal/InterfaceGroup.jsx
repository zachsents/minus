import { Button, Stack, Text } from "@mantine/core"
import HandleDefinitionLabel from "./HandleDefinitionLabel"
import { useNodeProperty } from "@web/modules/nodes"
import { useMemo } from "react"
import { produce } from "immer"
import { uniqueId } from "@web/modules/util"
import { TbPlus } from "react-icons/tb"


function InterfaceGroup({ children, definition, dataKey, noneLabel, onCreate, newInterfaceProps = {} }) {

    const [interfaces, setInterfaces] = useNodeProperty(undefined, `data.${dataKey}`)

    const canBeAdded = useMemo(
        () => interfaces?.filter(i => i.definition == definition.id).length < definition?.groupMax,
        [interfaces]
    )

    const createInterface = () => setInterfaces(produce(interfaces, draft => {
        const newInterface = {
            id: uniqueId(),
            definition: definition?.id,
            name: `New ${definition?.name}`,
            ...newInterfaceProps,
        }
        draft.push(newInterface)
        onCreate?.(newInterface)
    }))

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