
/** @type {import("../../defaults/base-defaults.js").BaseNodeDefinition} */
export default {
    id: "text.Template",
    name: "Fill Template",
    description: "Inserts values into a template.",

    inputs: {
        template: {
            type: "string",
            required: true,
        },
        substitution: {
            type: "string",
            group: true,
        },
    },

    outputs: {
        result: {
            type: "string",
        }
    },
}