import { DATA_TYPE } from "shared/constants/index.js"


/** @type {import("../../defaults/base-defaults.js").BaseNodeDefinition} */
export default {
    id: "text.Template",
    name: "Substitute Text",
    description: "Substitutes values into a template.",

    inputs: {
        template: {
            type: DATA_TYPE.STRING,
            required: true,
        },
        substitution: {
            type: DATA_TYPE.ANY,
            group: true,
        },
    },

    outputs: {
        result: {
            type: DATA_TYPE.STRING,
        }
    },
}