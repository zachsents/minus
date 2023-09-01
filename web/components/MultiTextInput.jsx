import { ActionIcon, Button, Group, Stack, Text, TextInput, Tooltip } from "@mantine/core"
import classNames from "classnames"
import { useRef } from "react"
import { TbPlus, TbX } from "react-icons/tb"


export default function MultiTextInput({
    children, value, onChange, error, label, inputProps = {}, emptyLabel = "No items", addLabel = "Add Item",
    max = Infinity, min = 0,
}) {

    const handleChange = (newValue, index) => {
        const newArr = [...value]
        newArr[index] = newValue
        onChange(newArr)
    }

    const handleAdd = () => {
        if (value.length < max)
            onChange([...value, ""])
    }

    const handleRemove = index => {
        if (value.length > min) {
            const newArr = [...value]
            newArr.splice(index, 1)
            onChange(newArr)
        }
    }

    const inputRefs = useRef([])

    return (
        <div>
            {label &&
                <Text className={classNames("text-sm", { "text-red": error })}>
                    {label}
                </Text>}

            {children}

            <Stack spacing="xs">
                {value?.length > 0 ?
                    value.map((item, i) =>
                        <Group key={i}>
                            <TextInput
                                value={item} onChange={ev => handleChange(ev.currentTarget.value, i)}
                                className="flex-1"
                                {...inputProps}
                                ref={el => inputRefs.current[i] = el}
                            />
                            {value.length > min &&
                                <Tooltip label="Remove" withinPortal withArrow position="right">
                                    <ActionIcon onClick={() => handleRemove(i)} className="hover:text-red">
                                        <TbX />
                                    </ActionIcon>
                                </Tooltip>}
                        </Group>
                    ) :
                    <Text className="text-xs text-gray">{emptyLabel}</Text>}
                {value?.length < max &&
                    <Button
                        leftIcon={<TbPlus />} size="sm" compact variant="subtle"
                        className="self-start"
                        onClick={handleAdd}
                    >
                        {addLabel}
                    </Button>}
            </Stack>
        </div>
    )
}
