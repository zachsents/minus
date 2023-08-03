import { Group, Text } from "@mantine/core"
import { modals } from "@mantine/modals"
import { notifications } from "@mantine/notifications"
import { useCopyNodeToClipboard, useDefinition, useDeleteNode, useDuplicateNode, useNodeProperty } from "@web/modules/nodes"
import { TbClipboardCopy, TbClipboardPlus, TbCopy, TbTrash } from "react-icons/tb"
import ToolbarIcon from "./ToolbarIcon"
import { useHotkeys } from "@mantine/hooks"


export default function NodeToolbar() {

    const definition = useDefinition()
    const [name] = useNodeProperty(undefined, "data.name")
    const displayName = name || definition?.name

    const _copyNode = useCopyNodeToClipboard()
    const copyNode = () => {
        _copyNode()
        notifications.show({
            title: "Copied!",
            icon: <TbClipboardPlus />,
            color: "green",
        })
    }

    const duplicateNode = useDuplicateNode()
    const deleteNode = useDeleteNode()

    const confirmDelete = () => modals.openConfirmModal({
        title: `Delete "${displayName}"`,
        children: <Text size="sm">Are you sure you want to delete this node?</Text>,
        labels: {
            confirm: "Delete",
            cancel: "Cancel",
        },
        confirmProps: { color: "red", variant: "filled" },
        cancelProps: { variant: "outline" },
        centered: true,
        onConfirm: deleteNode,
    })

    useHotkeys([
        ["mod+c", copyNode],
        ["mod+d", duplicateNode],
    ])

    return (
        <Group className="gap-0 rounded-sm bg-white shadow-sm base-border absolute bottom-full left-1/2 -translate-x-1/2 mb-xs">
            <ToolbarIcon
                label="Copy"
                secondaryLabel="Ctrl+C"
                onClick={copyNode}
                icon={TbClipboardCopy}
            />

            <ToolbarIcon
                label="Duplicate"
                secondaryLabel="Ctrl+D"
                onClick={duplicateNode}
                icon={TbCopy}
            />

            <ToolbarIcon
                label="Delete"
                secondaryLabel="Backspace"
                onClick={confirmDelete}
                icon={TbTrash}
            />
        </Group>
    )
}


