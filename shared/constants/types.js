

export const DATA_TYPE = {
    ANY: "any",
    STRING: "string",
    NUMBER: "number",
    BOOLEAN: "boolean",
    OBJECT: "object",
    ARRAY: "array",
}

export const DATA_TYPE_LABELS = {
    [DATA_TYPE.ANY]: "Any",
    [DATA_TYPE.STRING]: "String",
    [DATA_TYPE.NUMBER]: "Number",
    [DATA_TYPE.BOOLEAN]: "Boolean",
    [DATA_TYPE.OBJECT]: "Object",
    [DATA_TYPE.ARRAY]: "List",
}

export function typesMatch(typeA, typeB) {
    return typeA === DATA_TYPE.ANY || typeB === DATA_TYPE.ANY || typeA === typeB
}