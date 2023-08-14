import { onCall } from "firebase-functions/v2/https"
import { API_ROUTE } from "shared/constants/firebase.js"
import { assertUserMustOwnOrganization, createOrganization, deleteOrganization } from "../modules/organizations.js"
import { APIRequestSchema, validateSchema } from "./schema.js"


export const api = onCall(async ({ data, auth }) => {

    const { route, params } = await validateSchema(APIRequestSchema, data)

    switch (route) {
        case API_ROUTE.DELETE_ORGANIZATION:
            await assertUserMustOwnOrganization(params.orgId, auth.uid)
            return await deleteOrganization(params.orgId)
        case API_ROUTE.CREATE_ORGANIZATION:
            return createOrganization({
                owner: auth.uid,
            })
    }
})
