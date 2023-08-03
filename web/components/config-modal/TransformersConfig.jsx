import { Select, Stack, Switch } from "@mantine/core"
import MonacoEditor from "@monaco-editor/react"
import { useInterfaceProperty } from "@web/modules/nodes"
import { CUSTOM_TRANSFORMER_MODE, TRANSFORMER_MODES, } from "shared/constants"


export default function TransformersConfig({ interfaceId, dataKey }) {

    const [enabled, setEnabled] = useInterfaceProperty(undefined, dataKey, interfaceId, "transformer.enabled", false)
    const [mode, setMode] = useInterfaceProperty(undefined, dataKey, interfaceId, "transformer.mode")
    const [code, setCode] = useInterfaceProperty(undefined, dataKey, interfaceId, "transformer.code", defaultTransformer)

    return (
        <Stack spacing="xs">
            <Switch
                label="Transformer"
                description={descriptions[dataKey]}
                checked={enabled}
                onChange={ev => setEnabled(ev.currentTarget.checked)}
            />

            {enabled && <>
                <Select
                    placeholder="Select a transformer or choose &quot;Custom&quot;"
                    data={Object.keys(TRANSFORMER_MODES)}
                    value={mode} onChange={setMode}
                    withinPortal
                />

                {mode === CUSTOM_TRANSFORMER_MODE &&
                    <div className="h-60 border-solid border-1 border-gray-300 rounded-sm overflow-hidden relative">
                        <MonacoEditor
                            height="100%"
                            language="javascript"
                            theme="light"
                            value={code ?? ""}
                            onChange={newCode => setCode(newCode)}
                            options={{
                                minimap: { enabled: false },
                            }}
                        />
                    </div>}
            </>}
        </Stack>
    )
}


const descriptions = {
    "inputs": "Useful for transforming the value before it is passed into this node.",
    "outputs": "Useful for transforming the value before it is passed to the next node.",
}


const defaultTransformer = `// The value is available as \`value\`.\nreturn value`