
/**
 * @typedef {object} BaseHandleDefinition
 * @property {string} type
 */

/**
 * @typedef {object} BaseInputDefinition
 * @augments BaseHandleDefinition
 */

/**
 * @typedef {object} BaseOutputDefinition
 * @augments BaseHandleDefinition
 */

/**
 * @typedef {object} NodeDefinitionBase
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {Object.<string, BaseInputDefinition>} inputs
 * @property {Object.<string, BaseOutputDefinition>} outputs
 */


export default {
    id: "default",
    name: "Default",
    description: "Default",

    inputs: {},

    outputs: {},
}