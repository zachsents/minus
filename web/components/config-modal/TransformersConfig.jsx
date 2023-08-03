import { Overlay, Stack, Switch } from "@mantine/core"
import MonacoEditor from "@monaco-editor/react"
import { useInterfaceProperty } from "@web/modules/nodes"
import classNames from "classnames"


export default function TransformersConfig({ interfaceId, dataKey }) {

    const [enabled, setEnabled] = useInterfaceProperty(undefined, dataKey, interfaceId, "transformer.enabled", false)
    const [transformerValue, setTransformerValue] = useInterfaceProperty(undefined, dataKey, interfaceId, "transformer.value", defaultTransformer)

    return (
        <Stack spacing="xs">
            <Switch
                label="Transformer"
                description={descriptions[dataKey]}
                checked={enabled}
                onChange={ev => setEnabled(ev.currentTarget.checked)}
            />

            <div className={classNames({
                "border-solid border-1 border-gray-300 rounded-sm overflow-hidden relative": true,
                "h-60": enabled,
                "h-20": !enabled,
            })}>
                <MonacoEditor
                    height="100%"
                    language="javascript"
                    theme="light"
                    value={transformerValue ?? ""}
                    onChange={newCode => setTransformerValue(newCode)}
                    options={{
                        minimap: { enabled: false },
                    }}
                />

                {!enabled &&
                    <Overlay opacity={0.25} />}
            </div>
        </Stack>
    )
}


const descriptions = {
    "inputs": "Useful for transforming the value before it is passed into this node.",
    "outputs": "Useful for transforming the value before it is passed to the next node.",
}


const defaultTransformer = `// The value is available as \`value\`.\nreturn value`