import { Timestamp } from "firebase/firestore"

export function aOrAn(word) {
    return "aeiou".includes(word[0]) ? "an" : "a"
}

export function plural(word, q) {
    return q === 1 ? word : word + "s"
}

/**
 * @param {Date | Timestamp} date
 * @param {boolean} [showDate=true]
 * @param {boolean} [showTime=true]
 */
export function formatDate(date, showDate = true, showTime = true) {
    if (date instanceof Timestamp)
        date = date.toDate()

    return date?.toLocaleString(undefined, {
        dateStyle: showDate ? "short" : undefined,
        timeStyle: showTime ? "short" : undefined,
    })
}