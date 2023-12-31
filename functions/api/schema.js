import { HttpsError } from "firebase-functions/v2/https"
import Joi from "joi"
import { API_ROUTE } from "shared/firebase.js"


/**
 * @param {Joi.Schema} schema
 * @param {*} data
 */
export async function validateSchema(schema, data) {
    if (data === undefined)
        throw new HttpsError("invalid-argument", "Schema validation failed: data is undefined")

    try {
        return await schema.validateAsync(data)
    }
    catch (error) {
        throw new HttpsError("invalid-argument", error.message)
    }
}


export const APIRequestSchema = Joi.object({
    route: Joi.string().lowercase().required(),
    params: Joi.object().required(),
})


export const APIRouteSchema = {
    [API_ROUTE.DELETE_ORGANIZATION]: Joi.object({
        orgId: Joi.string().alphanum().required(),
    }),
}