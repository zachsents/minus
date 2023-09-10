import { produce } from "immer"
import _ from "lodash"
import { useCallback } from "react"
import { create } from "zustand"


export const initialData = {
    nodeBeingConfigured: null,
    paneContextMenuOpened: false,
    paneContextMenuPosition: null,
    undo: () => { },
    redo: () => { },
    selectedRun: null,
}

export const useEditorStore = create(() => ({
    ...initialData,
}))


/**
 * @param {keyof initialData} path
 */
export function useEditorStoreProperty(path) {
    const value = useEditorStore(s => _.get(s, path))
    const setValue = useCallback(
        value => useEditorStore.setState(produce(s => _.set(s, path, value))),
        [path]
    )
    return [value, setValue]
}
