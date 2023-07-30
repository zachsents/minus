import merge from "lodash.merge"
import { DefinitionFormatter } from "./formatter.js"
import baseDefinitions from "./definitions/base-definitions.js"
import serverDefinitions from "./definitions/server-definitions.js"
import baseTemplate from "./templates/base-template.js"
import serverTemplate from "./templates/server-template.js"

const mergedDefs = serverDefinitions.map(
    (def, i) => merge({}, baseTemplate, serverTemplate, baseDefinitions[i], def)
)

export default new DefinitionFormatter(mergedDefs)