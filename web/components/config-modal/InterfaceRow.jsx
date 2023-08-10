import { Group } from "@mantine/core"
import { INPUT_MODE } from "@web/modules/constants"
import { useDefinition, useNodePropertyValue } from "@web/modules/graph/nodes"
import { useInputValidation } from "@web/modules/graph/inputs"
import classNames from "classnames"
import { TbEyeOff, TbFunction, TbSettings, TbSettingsOff } from "react-icons/tb"
import HandleDefinitionLabel from "./HandleDefinitionLabel"


function InterfaceRow({ interf, dataKey, selected, onSelect, onDeselect, inGroup = false, error, rightSectionIcons }) {

    const nodeDefinition = useDefinition()
    const definition = nodeDefinition?.[dataKey][interf.definition]

    const name = useNodePropertyValue(undefined, `data.${dataKey}.${interf.id}.name`)
    const hidden = useNodePropertyValue(undefined, `data.${dataKey}.${interf.id}.hidden`)

    return (
        <Group
            position="apart" noWrap
            className={classNames({
                "group p-2 border-solid border-0 border-gray-300 cursor-pointer hover:bg-gray-100": true,
                "!bg-primary-100": selected,
                "border-b-1": !inGroup,
                "pl-4": inGroup,
            })}
            onClick={() => (selected ? onDeselect : onSelect)?.()}
        >
            <HandleDefinitionLabel
                {...!inGroup && {
                    required: definition?.required,
                    description: definition?.description,
                    secondaryLabel: name && definition?.name,
                }}
                icon={definition?.icon}
                hidden={hidden}
                error={error}
                label={name || definition?.name}
                classNames={{
                    label: inGroup && "text-xs",
                    icon: inGroup && "text-xs",
                }}
            />

            <Group className="gap-2 text-gray shrink-0 group-hover:hidden">
                {rightSectionIcons}
                {hidden && <TbEyeOff />}
            </Group>

            {selected ?
                <TbSettingsOff className="text-gray shrink-0 hidden group-hover:block" /> :
                <TbSettings className="text-gray shrink-0 hidden group-hover:block" />}
        </Group>
    )
}


export function InputRow({ interf, inGroup = false, selected, onSelect, onDeselect }) {

    const mode = useNodePropertyValue(undefined, `data.inputs.${interf.id}.mode`)
    const error = useInputValidation(undefined, interf.id)

    return (
        <InterfaceRow
            interf={interf}
            dataKey="inputs"
            selected={selected}
            onSelect={onSelect}
            onDeselect={onDeselect}
            inGroup={inGroup}
            error={error}
            rightSectionIcons={mode == INPUT_MODE.HANDLE && <TbFunction className="text-blue" />}
        />
    )
}


export function OutputRow({ interf, inGroup = false, selected, onSelect, onDeselect }) {

    return (
        <InterfaceRow
            interf={interf}
            dataKey="outputs"
            selected={selected}
            onSelect={onSelect}
            onDeselect={onDeselect}
            inGroup={inGroup}
        />
    )
}