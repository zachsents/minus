import { Button, Group, Stack, Text, TextInput } from "@mantine/core"
import { useRef } from "react"
import { useState } from "react"
import NodeSearch from "./NodeSearch"
import { createActionNode } from "@web/modules/nodes"
import { useReactFlow } from "reactflow"
import { useMemo } from "react"
import { searchTags } from "@web/modules/search"
import { TbPlus, TbX } from "react-icons/tb"
import { useListState, useLocalStorage } from "@mantine/hooks"
import { projectAbsoluteScreenPointToRF } from "@web/modules/graph"
import { useEffect } from "react"
import { ACTIVITY, LOCAL_STORAGE_KEYS } from "@web/modules/constants"


export default function ActionsActivity() {

    const rf = useReactFlow()

    const [query, setQuery] = useState("")
    const searchRef = useRef()
    const resultContainerRef = useRef()

    const addNode = (definition, position) => {
        createActionNode(rf, definition.id, position && projectAbsoluteScreenPointToRF(rf, position))
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

    return (
        <Stack className="my-1 gap-1">
            <TextInput
                value={query} onChange={ev => setQuery(ev.currentTarget.value)}
                placeholder="Search actions..."
                size="xs" variant="filled" className="p-1"
                ref={searchRef}
            />
            {selectedTags.length > 0 &&
                <Group className="gap-1">
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
                <Stack className="gap-2 my-xs">
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
                    />
                </Stack>
            </Stack>
        </Stack>
    )
}
