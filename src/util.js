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
