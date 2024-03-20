import {CONNECT_TO_LOCAL_API, ACCEPTANCE_API, PRODUCTION_API} from "./config"
import {runsOnProduction} from "./auth";

export function get_api() {
  // Returns the address of the GOB Management API
  let api;
  if (CONNECT_TO_LOCAL_API) {
    var base = "";
    if (window.location.hostname === "localhost") {
      base = "127.0.0.1:8143";
    } else if (runsOnProduction()) {
      return PRODUCTION_API;  // Already includes https://
    } else {
      base = window.location.hostname.replace("iris", "api");
    }
    api = `${window.location.protocol}//${base}/`;
  } else {
    api = ACCEPTANCE_API
  }
  return api;
}

export function get_gob_api() {
  // Returns the address of the GOB API
  return get_api().replace("8143", "8141");
}
