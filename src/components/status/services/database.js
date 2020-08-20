import {getDbLocks as _getDbLocks, getDbQueries as _getDbQueries} from "../../../services/gob_api";
import {memoize} from "../../../services/utils";

// Get new data only if last call is more than 1500 msecs ago
const memoizedLocks = memoize(_getDbLocks, 1500)

export async function getDbLocks() {
    return memoizedLocks()
}

// Get new data only if last call is more than 1500 msecs ago
const memoizedQueries = memoize(_getDbQueries, 1500)

export async function getDbQueries() {
    return memoizedQueries()
}
