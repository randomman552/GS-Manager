import {addMessage} from "../../pages/components/MessageDisplay";

let fetchOptions = {
    suppressError: false
}

/**
 * @param options {{suppressError: boolean}} Object specifying options for all apiFetch calls.
 */
export function setFetchOptions(options) {
    fetchOptions = {
        ...fetchOptions,
        ...options
    }
}

/**
 * Method to send a request to the api backend
 * @param url {string} URL to send request to.
 * @param data Object containing data to send with request.
 * @param method {string} HTTP method to use, defaults to 'post'.
 * @param auth Object containing authorisation information.
 * @param options {{suppressError: boolean}} Object specifying options. Includes:
 *  postMessage - Whether the fetch should show error messages to the ui.
 *  If not supplied, will use the options specified by setFetchOptions.
 * @returns {Promise<{code: number, error: string, data:any, success: boolean}>} Promise of return data as object.
 */
export async function apiFetch(url, data, method="post", auth=null, options=fetchOptions) {
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
    ).then(res => res.json()).then((json) => {
        // Set success bool so we dont have to write this boolean check everywhere
        json.success = json.code >= 200 && json.code < 300;

        // If response fails, report the error to the user.
        if (json.code >= 400 && json.code < 600) {
            if (!options.suppressError) {
                let error = json.error
                if (error.includes(":"))
                    error = error.split(":")[1]
                addMessage(error, "danger", 5000);
            }
        }
        return json;
    });
    return await response;
}

export function buildUrl(base, parts) {
    if (!(parts instanceof Array))
        return buildUrl(base, [parts])

    let url = base;
    if (base[base.length - 1] === '/')
        url = base.slice(0, base.length - 1);

    for (const part of parts) {
        url += "/" + part;
    }
    return url;
}

/**
 * Class used to cache objects from backend api.
 * WARN: Object passed MUST have an ID attribute that can be searched for.
 */
export class StorageCache {
    /**
     * Underlying store of data objects.
     * Store as id obj pairs in object.
     * @type {{}}
     * @private
     */
    _cache = {};
    /**
     * Functions that are called on data changing.
     * @type {[function]}
     * @private
     */
    _changeListeners = [];


    /**
     * All objects in cache in an array.
     * @returns {*[]}
     */
    get asArray() {
        const asArr = [];
        for (const key in this._cache)
            if (this._cache.hasOwnProperty(key))
                asArr.push(this._cache[key]);
        return asArr;
    }

    /**
     * All objects in cache in an object.
     * @returns {{}}
     */
    get asObject() {
        return this._cache;
    }

    /**
     * Get an object with a specific id.
     * @param id
     * @returns {*}
     */
    getObject(id) {
        return this._cache[id];
    }


    /**
     * Load data from an array.
     * @param arr {[Object]}
     */
    fromArray(arr) {
        this._cache = {}
        for (const obj of arr)
            this._cache[obj.id] = obj;
        this.callChangeListeners();
    }

    /**
     * Load data from an object.
     */
    fromObj(obj) {
        this._cache = obj;
        this.callChangeListeners();
    }


    callChangeListeners() {
        for (const func of this._changeListeners)
            func(this.asArray);
    }

    addChangeListener(func) {
        this._changeListeners.push(func);
    }

    removeChangeListener(func) {
        for (let i = 0; i < this._changeListeners.length; i++) {
            if (this._changeListeners[i] === func)
                this._changeListeners.splice(i, i);
        }
    }


    /**
     * Add an object to the cache.
     * @param obj
     */
    addObj(obj) {
        this._cache[obj.id] = obj;
        this.callChangeListeners();
    }

    /**
     * Update an object in the cache.
     * @param obj
     */
    updateObj(obj) {
        this.addObj(obj);
    }

    /**
     * Delete an object from the cache.
     * @param obj
     */
    deleteObj(obj) {
        delete this._cache[obj.id];
        this.callChangeListeners();
    }
}
