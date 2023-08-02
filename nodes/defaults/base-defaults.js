
/**
 * @typedef {object} BaseNodeDefinition
 * 
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {Object.<string, BaseInputDefinition>} inputs
 * @property {Object.<string, BaseOutputDefinition>} outputs
 */

/** @type {BaseNodeDefinition} */
export const BaseNodeDefinitionDefaults = {
    id: "default",
    name: "Default",
    description: "Default description",
    inputs: {},
    outputs: {},
}


/**
 * @typedef {object} BaseInterfaceDefinition
 * 
 * @property {string} type
 * @property {boolean} group
 */

/** @type {BaseInterfaceDefinition} */
export const BaseInterfaceDefinitionDefaults = {
    type: "any",
    group: false,
}


/**
 * @typedef {object} PartialBaseInputDefinition
 * 
 * @property {boolean} required
 */

/**
 * @typedef {BaseInterfaceDefinition & PartialBaseInputDefinition} BaseInputDefinition
 */

/** @type {BaseInputDefinition} */
export const BaseInputDefinitionDefaults = {
    required: false,
}


/**
 * @typedef {BaseInterfaceDefinition} BaseOutputDefinition
 */

/** @type {BaseOutputDefinition} */
export const BaseOutputDefinitionDefaults = {

}