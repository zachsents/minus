import merge from "lodash.merge"
import mapValues from "lodash.mapvalues"
import { DefinitionFormatter } from "./formatter.js"
import baseDefinitions from "./definitions/base-definitions.js"
import webDefinitions from "./definitions/web-definitions.js"
import { BaseInputDefinitionDefaults, BaseInterfaceDefinitionDefaults, BaseNodeDefinitionDefaults, BaseOutputDefinitionDefaults } from "./defaults/base-defaults.js"
import { WebInputDefinitionDefaults, WebInterfaceDefinitionDefaults, WebNodeDefinitionDefaults, WebOutputDefinitionDefaults } from "./defaults/web-defaults.js"


const mergedDefs = webDefinitions.map((def, i) => {

    const baseDef = baseDefinitions[i]

    baseDef.inputs = mapValues(
        baseDef.inputs,
        inputDef => merge({}, BaseInterfaceDefinitionDefaults, BaseInputDefinitionDefaults, inputDef)
    )
    baseDef.outputs = mapValues(
        baseDef.outputs,
        outputDef => merge({}, BaseInterfaceDefinitionDefaults, BaseOutputDefinitionDefaults, outputDef)
    )

    def.inputs = mapValues(
        def.inputs,
        inputDef => merge({}, WebInterfaceDefinitionDefaults, WebInputDefinitionDefaults, inputDef)
    )
    def.outputs = mapValues(
        def.outputs,
        outputDef => merge({}, WebInterfaceDefinitionDefaults, WebOutputDefinitionDefaults, outputDef)
    )

    return merge({}, BaseNodeDefinitionDefaults, WebNodeDefinitionDefaults, baseDef, def)
})

export default new DefinitionFormatter(mergedDefs)