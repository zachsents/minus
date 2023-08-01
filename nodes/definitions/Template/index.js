
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
            required: false,
        },
    },

    outputs: {
        result: {
            type: "string",
        }
    },
}