
export class DefinitionFormatter {

    constructor(definitions, key = "id") {
        this._definitions = definitions
        this._key = key
    }

    get asArray() {
        return Array.isArray(this._definitions) ?
            this._definitions :
            Object.values(this._definitions)
    }

    get asObject() {
        return Array.isArray(this._definitions) ?
            Object.fromEntries(this._definitions.map(def => [def[this._key], def])) :
            this._definitions
    }

    byProperty(key, value) {
        return this.asArray.filter(def => def[key] === value)
    }
}