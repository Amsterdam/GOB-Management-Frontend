import {get_gob_api} from "./api";
import {guardedGet, JSONResponse} from "./api_guard";

export async function getDbLocks() {
    return guardedGet(get_gob_api() + "gob/public/info/locks/", JSONResponse)
}

export async function getDbQueries() {
    return guardedGet(get_gob_api() + "gob/public/info/activity/", JSONResponse);
}
