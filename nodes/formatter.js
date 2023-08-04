
export class DefinitionFormatter extends Map {

    constructor(definitions, key = "id") {
        if (Array.isArray(definitions))
            super(definitions.map(def => [def[key], def]))
        else if (typeof definitions === "object")
            super(Object.entries(definitions))
        else
            throw new Error("Invalid definitions format.")

        this.asArray = Array.from(this.values())
        this.asObject = Object.fromEntries(this)
    }

    byProperty(key, value) {
        return this.asArray.filter(def => def[key] === value)
    }
}