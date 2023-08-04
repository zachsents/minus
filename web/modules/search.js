import lunr from "lunr"
import WebDefinitions from "nodes/web"

const interfaceDescriptionExtractor = (typeKey, nodeDef) => Object.values(nodeDef[typeKey]).map(interf => interf.description ?? "").join(" ")

const nodeSearchIndex = lunr(function () {
    this.ref("id")
    this.field("name")
    this.field("description")
    this.field("tags", {
        extractor: nodeDef => nodeDef.tags.join(" "),
    })
    this.field("interfaceDescriptions", {
        extractor: nodeDef => interfaceDescriptionExtractor("inputs", nodeDef) + " " +
            interfaceDescriptionExtractor("outputs", nodeDef),
        boost: 0.3,
    })

    WebDefinitions.asArray.forEach(nodeDef => {
        this.add(nodeDef)
    })
})

export function searchNodes(query) {
    try {
        const fixedQuery = query.split(/\s+/g).map(token => {
            if (/^\w+$/.test(token))
                return `+${token}~4`
            return token
        }).join(" ")

        return nodeSearchIndex.search(fixedQuery)
            .map(result => WebDefinitions.get(result.ref))
    }
    catch (err) {
        return []
    }
} 