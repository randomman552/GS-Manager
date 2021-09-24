import {apiFetch, buildUrl, StorageCache} from "./util";

/**
 * Class to represent a rest based api resource on the server.
 * Provides some simple methods for getting, creating, modifying and deleting resources.
 * Further endpoints can be added using the addEndpoint method.
 */
export default class Resource {
    cache = new StorageCache()
    baseUrl = "/";

    addChangeListener = (func) => {this.cache.addChangeListener(func)}
    removeChangeListener = (func) => {this.cache.removeChangeListener(func)}

    constructor(baseUrl) {
        this.baseUrl = baseUrl
    }

    /**
     * Data accessor.
     * Can access data.asArray to access the data in an array.
     * Or data.asObject to access the data in an object map.
     * @returns {{}|{readonly asArray: *[], readonly asObject: {}}|*[]}
     */
    get data() {
        const cache = this.cache;
        const asArray = cache.asArray;
        const asObject = cache.asObject;

        return {
            get asArray() {
                return asArray;
            },
            get asObject() {
                return asObject;
            },
            get(id) {
                return cache.getObject(id);
            }
        }
    }

    // region Basic api queries (present in all rest resources)
    /**
     * Get the specified resource from the server.
     * @param id The id to query. If no id is provided, all objects will be returned.
     * @returns {Promise<*>}
     */
    get(id=null) {
        // If id specified, query for particular object
        if (id) {
            const url = buildUrl(this.baseUrl, id);
            return apiFetch(url).then(json => {
                if (json.success)
                    this.cache.updateObj(json.data);
                return json;
            });
        }
        // Otherwise query for all objects
        return apiFetch(this.baseUrl).then(json => {
            // Update cache if request was successful
            if (json.success)
                this.cache.fromArray(json.data);
            return json;
        });
    }

    /**
     * Delete the given resource from the server.
     * @param id The id of the resource to delete.
     * @returns {Promise<*>}
     */
    delete(id) {
        const url = buildUrl(this.baseUrl, id);
        return apiFetch(url, null, "delete").then(json => {
            if (json.success)
                this.cache.deleteObj(json.data);
            return json;
        });
    }

    /**
     * Modify the given resource with the given data.
     * @param id The id of the resource.
     * @param data The data to update it with.
     * @returns {Promise<*>}
     */
    modify(id, data) {
        const url = buildUrl(this.baseUrl, id);
        return apiFetch(url, data, "put").then(json => {
            if (json.success)
                this.cache.updateObj(json.data);
            return json;
        });
    }

    /**
     * Create the given resource.
     * @param data The data to create it with.
     * @returns {Promise<*>}
     */
    create(data) {
        return apiFetch(this.baseUrl, data, "put").then(json => {
            if (json.success)
                this.cache.addObj(json.data)
            return json;
        });
    }
    // endregion
}
