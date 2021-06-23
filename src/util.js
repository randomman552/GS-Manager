export async function apiPost(apiKey, data, url) {
    data = {
        "apikey": apiKey,
        "data": data
    }

    let response = await fetch (
        url,
        {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            method: "post",
            body: JSON.stringify(data)
        }
    );
    return await response.json()
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