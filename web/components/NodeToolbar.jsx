import { Group, Text } from "@mantine/core"
import { modals } from "@mantine/modals"
import { useDefinition, useDeleteNode, useDuplicateNode, useNodeProperty } from "@web/modules/nodes"
import { TbCopy, TbTrash } from "react-icons/tb"
import ToolbarIcon from "./ToolbarIcon"


export default function NodeToolbar() {

    const definition = useDefinition()
    const [name] = useNodeProperty(undefined, "data.name")
    const displayName = name || definition?.name

    const duplicateNode = useDuplicateNode(undefined)

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

    return (
        <Group className="gap-0 rounded-sm bg-white shadow-sm base-border absolute bottom-full left-1/2 -translate-x-1/2 mb-xs">
            <ToolbarIcon
                label="Duplicate"
                onClick={duplicateNode}
                icon={TbCopy}
            />

            <ToolbarIcon
                label="Delete"
                onClick={confirmDelete}
                icon={TbTrash}
            />
        </Group>
    )
}


