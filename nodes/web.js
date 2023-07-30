import merge from "lodash.merge"
import { DefinitionFormatter } from "./formatter.js"
import baseDefinitions from "./definitions/base-definitions.js"
import webDefinitions from "./definitions/web-definitions.js"
import baseTemplate from "./templates/base-template.js"
import webTemplate from "./templates/web-template.jsx"

const mergedDefs = webDefinitions.map(
    (def, i) => merge({}, baseTemplate, webTemplate, baseDefinitions[i], def)
)

export default new DefinitionFormatter(mergedDefs)