import { get_gob_api } from "./api";

export async function get_db_locks() {
  return fetch(get_gob_api() + "gob/info/locks").json();
}

export async function get_db_queries() {
  return fetch(get_gob_api() + "gob/info/activity").json();
}
