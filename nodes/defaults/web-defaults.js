import { TbSquare } from "react-icons/tb"
import { INPUT_MODE } from "web/modules/constants"
import TextConfig from "../config-components/TextConfig"


/**
 * @typedef {object} WebNodeDefinition
 * 
 * @property {string} color
 * @property {Function} icon
 * @property {Object.<string, WebInputDefinition>} inputs
 * @property {Object.<string, WebOutputDefinition>} outputs
 */

/** @type {WebNodeDefinition} */
export const WebNodeDefinitionDefaults = {
    color: "gray",
    icon: TbSquare,
    inputs: {},
    outputs: {},
}


/**
 * @typedef {object} WebInterfaceDefinition
 * 
 * @property {string} name
 * @property {boolean} nameEditable
 * @property {string} description
 * @property {Function} [dynamicDescription] Used to dynamically generate the description based on the input.
 * @property {Function} [icon]
 * 
 * @property {boolean} defaultHidden Whether this interface should be hidden by default.
 * 
 * @property {number} groupMin If this is a grouped interface, the minimum number of inputs/outputs it can have.
 * @property {number} groupMax If this is a grouped interface, the maximum number of inputs/outputs it can have.
 */

/** @type {WebInterfaceDefinition} */
export const WebInterfaceDefinitionDefaults = {
    name: "Default",
    nameEditable: false,
    description: "Default description",
    defaultHidden: false,
    groupMin: 0,
    groupMax: Infinity,
}


/**
 * @typedef {object} PartialWebInputDefinition
 * 
 * @property {string} defaultMode
 * @property {string[]} allowedModes
 * @property {Function} renderConfiguration Used to render the configuration UI for this input.
 * @property {(value: any) => (boolean | string)} [validateConfiguration] Used to validate the value the input is configured to be. A truthy value indicates an error. A string value is used as the error message.
 * @property {Function} [validateInput] Used to validate the input itself.
 * @property {Function} [deriveInputs] Used to create new inputs when this input is configured.
 */

/**
 * @typedef {WebInterfaceDefinition & PartialWebInputDefinition} WebInputDefinition
 */

/** @type {WebInputDefinition} */
export const WebInputDefinitionDefaults = {
    defaultMode: INPUT_MODE.HANDLE,
    allowedModes: [INPUT_MODE.HANDLE, INPUT_MODE.CONFIGURATION],
    renderConfiguration: TextConfig,
}


/**
 * @typedef {WebInterfaceDefinition} WebOutputDefinition
 */

/** @type {WebOutputDefinition} */
export const WebOutputDefinitionDefaults = {

}