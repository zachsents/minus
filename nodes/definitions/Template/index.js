import { DataType } from "shared/index.js"


/** @type {import("../../defaults/base-defaults.js").BaseNodeDefinition} */
export default {
    id: "text.Template",
    name: "Substitute Text",
    description: "Substitutes values into a template.",

    inputs: {
        template: {
            type: DataType.STRING,
            required: true,
        },
        substitution: {
            type: DataType.ANY,
            group: true,
        },
    },

    outputs: {
        result: {
            type: DataType.STRING,
        }
    },
}