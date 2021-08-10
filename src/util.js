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

    let response = await fetch (
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

/**
 * Util the cookie with the given key
 * @param key
 */
export function getCookie(key) {
    const cookieArray = document.cookie.split(";");
    for (const cookie of cookieArray) {
        const splitCookie = cookie.split("=");
        if (splitCookie[0] === key)
            return splitCookie[1];
    }
}

export function setCookie(key, value) {
    let cookie = key + "=" + value;
    document.cookie = cookie;
}

export function deleteCookie(key) {
    let cookie = key + "=" + getCookie(key);
    document.cookie = cookie + ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
}

/**
 * Basic deep copy function.
 * Returns a deep copy of the given object.
 * NOTE: Object must be JSON serializable.
 */
export function deepCopy(object) {
    return JSON.parse(JSON.stringify(object))
}
