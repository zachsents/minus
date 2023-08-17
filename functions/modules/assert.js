import { HttpsError } from "firebase-functions/v2/https"


/**
 * @param {...Function} assertions
 */
export async function assertAny(...assertions) {
    const errors = []

    for (const assertion of assertions) {
        try {
            await assertion()
            return
        } catch (err) {
            errors.push(err)
        }
    }

    throw new HttpsError("failed-precondition", errors.map(err => err.message).join("\n"))
}