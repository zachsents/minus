import { Group } from "@mantine/core"
import classNames from "classnames"
import HandleDefinitionLabel from "./HandleDefinitionLabel"
import { TbEyeOff, TbFunction, TbSettings, TbSettingsOff } from "react-icons/tb"
import { INPUT_MODE } from "@web/modules/constants"
import { useDefinition, useInputValidation, useNodeProperty } from "@web/modules/nodes"


function InterfaceRow({ interf, dataKey, selected, onSelect, onDeselect, inGroup = false, error, rightSectionIcons }) {

    const nodeDefinition = useDefinition()
    const definition = nodeDefinition?.[dataKey][interf.definition]

    const [name] = useNodeProperty(undefined, `data.${dataKey}.id=${interf.id}.name`)
    const [hidden] = useNodeProperty(undefined, `data.${dataKey}.id=${interf.id}.hidden`)

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

    const [mode] = useNodeProperty(undefined, `data.inputs.id=${interf.id}.mode`)
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