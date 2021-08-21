/**
 * Method to send a request to the api backend
 * @param url {string} URL to send request to.
 * @param data Object containing data to send with request.
 * @param method {string} HTTP method to use, defaults to 'post'.
 * @param auth Object containing authorisation information.
 * @returns {Promise<any>} Promise of return data as object.
 */
export async function apiFetch(url, data, method = "post", auth = null) {
    data = {
        "auth": auth,
        "data": data
    }

    let response = await fetch(
        url,
        {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            method: method,
            body: JSON.stringify(data)
        }
    );
    return await response.json();
}
