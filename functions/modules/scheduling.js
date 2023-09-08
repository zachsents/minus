

/** 
 * @typedef {object} RecurringSchedule
 * @property {number} interval
 * @property {"minute" | "hour" | "day" | "week" | "month"} intervalUnit 
 * @property {number} [atMinute] Minute of the hour, e.g. 30
 * @property {string} [atTime] Time in 24 hour format, e.g. "13:00"
 * @property {number} [onWeekday] 0-6, 0 is Sunday
 * @property {number} [onDay] 1-31
 */


/**
 * Gets the date for the first execution of a recurring schedule.
 *
 * @export
 * @param {RecurringSchedule} schedule
 */
export function getStartDateFromSchedule(schedule) {

    // Set up dates starting now
    const now = new Date()
    const nextScheduledFor = new Date()

    // Split atTime into hours and minutes
    const splitAtTime = schedule.atTime?.split(":").map(val => parseInt(val))

    // Set up nextScheduledFor based on intervalUnit
    switch (schedule.intervalUnit) {
        case "minute":
            // first execution is in 1 minute
            nextScheduledFor.setMinutes(now.getMinutes() + schedule.interval)
            break
        case "hour":
            // set minute
            nextScheduledFor.setMinutes(schedule.atMinute)
            // move to next hour if time has passed
            nextScheduledFor <= now && nextScheduledFor.setHours(nextScheduledFor.getHours() + 1)
            break
        case "day":
            // set time
            nextScheduledFor.setHours(splitAtTime[0], splitAtTime[1])
            // move to next day if time has passed
            nextScheduledFor <= now && nextScheduledFor.setDate(nextScheduledFor.getDate() + 1)
            break
        case "week":
            // set date based on weekday
            nextScheduledFor.setDate(nextScheduledFor.getDate() + (schedule.onWeekday - nextScheduledFor.getDay() + 7) % 7)
            // set time
            nextScheduledFor.setHours(splitAtTime[0], splitAtTime[1])
            // move to next week if time has passed
            nextScheduledFor <= now && nextScheduledFor.setDate(nextScheduledFor.getDate() + 7)
            break
        case "month":
            // set date
            nextScheduledFor.setDate(schedule.onDay)
            // set time
            nextScheduledFor.setHours(splitAtTime[0], splitAtTime[1])
            // move to next month if time has passed
            nextScheduledFor <= now && nextScheduledFor.setMonth(nextScheduledFor.getMonth() + 1)
            break
    }

    return nextScheduledFor
}


/**
 * Gets the date for the next execution of a recurring schedule
 * given the last execution date.
 *
 * @export
 * @param {RecurringSchedule} schedule
 * @param {number | Date} lastDate
 */
export function getNextDateFromSchedule(schedule, lastDate) {

    // Make sure lastDate is a Date object
    if (typeof lastDate === "number")
        lastDate = new Date(lastDate)

    // Set up newTime starting with lastDate
    const newTime = new Date(lastDate.getTime())

    // Add interval to newTime based on intervalUnit
    switch (schedule.intervalUnit) {
        case "minute":
            newTime.setMinutes(newTime.getMinutes() + schedule.interval)
            break
        case "hour":
            newTime.setHours(newTime.getHours() + schedule.interval)
            break
        case "day":
            newTime.setDate(newTime.getDate() + schedule.interval)
            break
        case "week":
            newTime.setDate(newTime.getDate() + (schedule.interval * 7))
            break
        case "month":
            newTime.setMonth(newTime.getMonth() + schedule.interval)
            break
    }

    return newTime
}