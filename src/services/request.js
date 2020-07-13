import {GraphQLClient} from "graphql-request";
import auth from "./auth";
import {get_api} from "./api";
import {guardRequest} from "./api_guard";

export async function request(api, query) {
    const token = await auth.token();
    const headers = token
        ? {
            Authorization: "Bearer " + token
        }
        : {};
    const client = new GraphQLClient(api, {headers});
    return guardRequest(async () => {
        const response = await client.request(query)
        return response
    })
}

export async function get(url, options = {}) {
    const token = await auth.token();
    return guardRequest(async () => {
        const response = await fetch(get_api() + url, {
            ...options,
            headers: {
                Authorization: "Bearer " + token,
                ...options.headers
            }
        })
        if (!response.ok) {
            throw new Error(`API call "${url}" failed`);
        }
        return response
    });
}
