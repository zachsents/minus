import { NavLink } from "@mantine/core"
import { searchNodes } from "@web/modules/search"
import { useMemo } from "react"


export default function NodeSearch({ query, onAdd }) {

    const results = useMemo(() => searchNodes(query), [query])

    return (
        <>
            {results.slice(0, 8).map(result =>
                <ResultRow definition={result} onClick={() => onAdd?.(result)} key={result.id} />
            )}
        </>
    )
}


function ResultRow({ definition, onClick }) {

    return (
        <NavLink
            tabIndex="0"
            className="focus:bg-primary-100"
            icon={<definition.icon />}
            label={definition.name}
            onClick={onClick}
            onKeyDown={ev => {
                if (ev.key == "ArrowDown") {
                    ev.preventDefault()
                    ev.stopPropagation()
                    ev.target.nextSibling?.nextSibling?.focus()
                }
                if (ev.key == "ArrowUp") {
                    ev.preventDefault()
                    const prev = ev.target.previousSibling?.previousSibling
                    if (prev) {
                        prev?.focus()
                        ev.stopPropagation()
                    }
                }
                if (ev.key == "Enter") {
                    ev.preventDefault()
                    ev.stopPropagation()
                    ev.target.click()
                }
            }}
        />
    )
}