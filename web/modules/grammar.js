
export function aOrAn(word) {
    return "aeiou".includes(word[0]) ? "an" : "a"
}

export function plural(word, q) {
    return q === 1 ? word : word + "s"
}