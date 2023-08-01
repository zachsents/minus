import { Button, Group } from "@mantine/core"
import { TbReplace, TbTemplate, TbWand } from "react-icons/tb"
import { INPUT_MODE } from "web/modules/constants"
import { useDerivedInputs, useNodeProperty } from "web/modules/nodes"
import TextConfig from "../../config-components/TextConfig"


export default {
    id: "text.Template",
    icon: TbTemplate,
    description: "Inserts values into a template.",

    inputs: {
        template: {
            name: "Template",
            nameEditable: false,
            description: "The template to insert values into. Use {SubstitutionName} to insert a value.",
            icon: TbTemplate,

            defaultMode: INPUT_MODE.CONFIGURATION,
            allowedModes: [INPUT_MODE.HANDLE, INPUT_MODE.CONFIGURATION],

            renderConfiguration: props => {

                const deriveInputs = useDerivedInputs(undefined, props.inputId)

                return (<>
                    <TextConfig
                        multiline
                        placeholder="Hello {FirstName} {LastName}! It's {Time} o'clock."
                        {...props}
                    />
                    <Group position="right">
                        <Button
                            onClick={deriveInputs}
                            leftIcon={<TbWand />} size="sm" compact
                        >
                            Create Substitutions
                        </Button>
                    </Group>
                </>)
            },
            validateConfiguration: value => !value && "The template is blank.",

            deriveInputs: (input) => {
                if (input.mode != INPUT_MODE.CONFIGURATION)
                    return

                const substitutions = input?.value?.match(/(?<={).+?(?=})/g) ?? []
                return substitutions.map(sub => ({
                    merge: {
                        definition: "substitution",
                        name: sub,
                    },
                }))
            },
        },
        substitution: {
            name: "Substitution",
            groupName: "Substitutions",
            nameEditable: true,
            description: "A value to insert into the template. If your template contains {FirstName}, a substitution named FirstName will replace it.",
            dynamicDescription: ({ input }) => `This is the value that will replace {${input.name}} in the template.`,
            icon: TbReplace,

            defaultMode: INPUT_MODE.HANDLE,
            allowedModes: [INPUT_MODE.CONFIGURATION, INPUT_MODE.HANDLE],

            groupMin: 0,
            groupMax: Infinity,

            renderConfiguration: props => {

                const [subName] = useNodeProperty(undefined, `data.inputs.id=${props.inputId}.name`)

                return (
                    <TextConfig
                        multiline
                        placeholder={`This is the value that will replace {${subName}} in the template.`}
                        {...props}
                    />
                )
            },
            validateInput: (input, inputs) =>
                inputs?.filter(i => i.definition === input?.definition && i.name === input?.name).length > 1 &&
                "You can't have two substitutions with the same name.",
        },
    }
}