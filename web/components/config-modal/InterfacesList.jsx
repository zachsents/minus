import { Stack } from "@mantine/core"
import { useDefinition, useNodePropertyValue } from "@web/modules/graph/nodes"
import { useMemo } from "react"
import ScrollBox from "../ScrollBox"


export default function InterfacesList({ dataKey, rowComponent: RowComponent, groupComponent: GroupComponent, selectedInterface, setSelectedInterface }) {

    const definition = useDefinition()
    const interfaceDefs = useMemo(
        () => Object.entries(definition?.[dataKey] || {})
            .map(([id, def]) => ({ id, ...def })),
        [definition?.[dataKey]]
    )

    const interfaces = useNodePropertyValue(undefined, `data.${dataKey}`)

    const groups = useMemo(() => interfaceDefs.map(def => ({
        definition: def,
        interfaces: Object.values(interfaces)?.filter(
            interf => interf.definition == def.id
        ),
    })), [interfaceDefs, interfaces])

    return (
        <ScrollBox offsetScrollbars={false}>
            <Stack spacing={0}>
                {groups.map(group => {
                    const rows = group.interfaces?.map(interf =>
                        <RowComponent
                            interf={interf}
                            selected={selectedInterface?.id == interf.id}
                            onSelect={() => setSelectedInterface(interf)}
                            onDeselect={() => setSelectedInterface(null)}
                            inGroup={group.definition.group}
                            key={interf.id}
                        />
                    )
                    return group.definition.group ?
                        <GroupComponent
                            definition={group.definition}
                            onCreate={interf => setSelectedInterface(interf)}
                            key={group.definition.id}
                        >
                            {rows}
                        </GroupComponent> :
                        rows
                })}
            </Stack>
        </ScrollBox>
    )
}