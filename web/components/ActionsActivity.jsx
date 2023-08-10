import { Button, Group, Stack, Text, TextInput } from "@mantine/core"
import { useFocusWithin, useListState, useLocalStorage } from "@mantine/hooks"
import { ACTIVITY, LOCAL_STORAGE_KEYS } from "@web/modules/constants"
import { projectAbsoluteScreenPointToRF } from "@web/modules/graph"
import { useAddActionNode } from "@web/modules/graph/nodes"
import { searchTags } from "@web/modules/search"
import { useEffect, useMemo, useRef, useState } from "react"
import { TbPlus, TbX } from "react-icons/tb"
import { useReactFlow } from "reactflow"
import NodeSearch from "./NodeSearch"


export default function ActionsActivity() {

    const rf = useReactFlow()

    const [query, setQuery] = useState("")
    const searchRef = useRef()
    const resultContainerRef = useRef()

    const _addNode = useAddActionNode()
    const addNode = (definition, position) => {
        _addNode(definition.id, position && projectAbsoluteScreenPointToRF(rf, position))
    }

    const [selectedTags, selectedTagsHandlers] = useListState([])
    const tags = useMemo(() => searchTags(query).filter(tag => !selectedTags.includes(tag)), [query, selectedTags])

    const [activityTab] = useLocalStorage({
        key: LOCAL_STORAGE_KEYS.EDITOR_ACTIVITY_TAB,
        defaultValue: ACTIVITY.ACTIONS,
    })

    useEffect(() => {
        if (activityTab == ACTIVITY.ACTIONS)
            searchRef.current?.focus()
    }, [activityTab])

    const { ref: containerRef, focused } = useFocusWithin()

    return (
        <Stack className="my-1 gap-1" ref={containerRef}>
            <TextInput
                value={query} onChange={ev => setQuery(ev.currentTarget.value)}
                placeholder="Search actions..."
                size="xs" variant="filled" className="p-1"
                onFocus={() => searchRef.current?.select()}
                ref={searchRef}
            />
            {selectedTags.length > 0 &&
                <Group className="gap-1 px-1">
                    {selectedTags.map((tag, i) =>
                        <Button
                            size="xs" compact variant="outline"
                            leftIcon={<TbX />}
                            onClick={() => selectedTagsHandlers.remove(i)}
                            key={tag}
                        >
                            {tag}
                        </Button>
                    )}
                </Group>}

            {tags.length > 0 &&
                <Stack className="gap-2 my-xs px-1">
                    <Text size="xxs" color="dimmed" ta="center">Categories</Text>
                    <Group className="gap-1">
                        {tags.map(tag =>
                            <Button
                                size="xs" compact variant="outline"
                                leftIcon={<TbPlus />} color="gray"
                                onClick={() => selectedTagsHandlers.append(tag)}
                                key={tag}
                            >
                                {tag}
                            </Button>
                        )}
                    </Group>
                </Stack>}

            <Stack className="gap-2">
                <Text size="xxs" color="dimmed" ta="center">Actions</Text>
                <Stack className="gap-xs" ref={resultContainerRef}>
                    <NodeSearch
                        query={query} tags={selectedTags}
                        onAdd={addNode}
                        showDescription draggable
                        focused={focused}
                    />
                </Stack>
            </Stack>
        </Stack>
    )
}
