import {apiFetch} from "../rest/util";

const system = {
    getSystemInfo() {
        return apiFetch("/api/system/");
    }
};

export default system;