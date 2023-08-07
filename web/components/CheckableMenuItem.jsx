import { Checkbox, Menu } from "@mantine/core"


/**
 * @param {{
 * value: boolean,
 * onChange: (value: boolean) => void,
 * icon: React.ComponentType,
 * props: {
 * checklist: import("@mantine/core").CheckboxProps,
 * menuItem: import("@mantine/core").MenuItemProps,
 * }
 * }} props
 */
export default function CheckableMenuItem({
    children, value, onChange, icon: Icon,
    props: { checklist: checklistProps = {}, menuItem: menuItemProps = {} } = {},
}) {

    return (
        <Menu.Item
            closeMenuOnClick={false}
            icon={<Icon />}
            rightSection={<Checkbox
                radius="sm" checked={value} readOnly
                {...checklistProps}
            />}
            onClick={() => onChange?.(!value)}
            {...menuItemProps}
        >
            {children}
        </Menu.Item>
    )
}