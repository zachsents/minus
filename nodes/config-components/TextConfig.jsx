import { TextInput, Textarea } from "@mantine/core"
import { useInputValue } from "web/modules/graph/interfaces"


/**
 * @param {{ 
 * inputId: string,
 * multiline: boolean,
 * } & (import("@mantine/core").TextareaProps | import("@mantine/core").TextInputProps)} props
 */
export default function TextConfig({ inputId, multiline, onChange, defaultValue = "", ...otherProps }) {

    const [value, setValue] = useInputValue(undefined, inputId, defaultValue)

    const passedProps = {
        value: value ?? "",
        onChange: ev => {
            setValue(ev.currentTarget.value)
            onChange?.(ev)
        },
        ...otherProps,
    }

    return multiline ?
        <Textarea {...passedProps} /> :
        <TextInput {...passedProps} />
}
