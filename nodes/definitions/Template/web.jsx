import { TbTemplate } from "react-icons/tb"
import { Textarea } from "@mantine/core"


export default {
    id: "text.Template",
    icon: TbTemplate,
    color: "green",

    inputs: {
        template: {
            name: "Template",
            nameEditable: false,
            description: "Inserts values into a template.",

            renderConfiguration: () => {
                return (
                    <Textarea
                        placeholder="Hello {FirstName} {LastName}! It's {Time} o'clock."

                    />
                )
            }
        },
    }
}