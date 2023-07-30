
export default {
    id: "text.Template",
    name: "Fill Template",
    description: "Inserts values into a template.",

    inputs: {
        template: {
            type: "string",
            required: true,
        }
    },

    outputs: {
        result: {
            type: "string",
        }
    },
}