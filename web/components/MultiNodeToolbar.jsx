import { Group, Text } from "@mantine/core"
import { useDeleteElements, useDuplicateElements, useSelection, useSelectionRect } from "@web/modules/nodes"
import { TbCopy, TbTrash } from "react-icons/tb"
import ToolbarIcon from "./ToolbarIcon"
import { modals } from "@mantine/modals"


export default function MultiNodeToolbar() {

    const { selected, selectedNodes, selectedEdges } = useSelection()
    const { screen } = useSelectionRect()

    const duplicate = useDuplicateElements(selectedNodes, selectedEdges)
    const deleteElements = useDeleteElements(selectedNodes, selectedEdges)

    const confirmDelete = () => modals.openConfirmModal({
        title: `Delete ${selectedNodes.length} nodes`,
        children: <Text size="sm">Are you sure you want to delete these nodes?</Text>,
        labels: {
            confirm: "Delete",
            cancel: "Cancel",
        },
        confirmProps: { color: "red", variant: "filled" },
        cancelProps: { variant: "outline" },
        centered: true,
        onConfirm: deleteElements,
    })

    return selected.length > 1 &&
        <div className="absolute z-[4] pointer-events-none outline-dashed outline-gray outline-1 outline-offset-8 rounded-sm" style={{
            top: `${screen.y}px`,
            // left: `${screen.x + screen.width / 2}px`,
            left: `${screen.x}px`,
            width: `${screen.width}px`,
            height: `${screen.height}px`,
        }}>
            <Group noWrap className="pointer-events-auto gap-0 rounded-sm bg-white shadow-sm base-border mb-md absolute bottom-full left-1/2 -translate-x-1/2">
                <ToolbarIcon
                    label="Duplicate"
                    onClick={duplicate}
                    icon={TbCopy}
                />

                <ToolbarIcon
                    label="Delete"
                    onClick={confirmDelete}
                    icon={TbTrash}
                />
            </Group>
        </div>
}
