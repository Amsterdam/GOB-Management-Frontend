export const lastAPIError = {
    error: null,
    text: null
}

function APIError(error, text) {
    lastAPIError.error = error;
    lastAPIError.text = text;
    return {}
}

export const JSONResponse = response => response.json()

export async function guardedGet(url, getContent) {
    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const result = await getContent(response)
        return result
    } catch (error) {
        return APIError(error, `API call "${url}" failed`)
    }
}

export async function guardRequest(request) {
    try {
        const result = await request()
        return result
    } catch (error) {
        return APIError(error, error.message)
    }
}