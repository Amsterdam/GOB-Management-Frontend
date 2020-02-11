import { get_gob_api } from "./api";

export async function get_db_locks() {
  const locks = await fetch(get_gob_api() + "gob/info/locks");
  return locks.json();
}

export async function get_db_queries() {
  const activities = await fetch(get_gob_api() + "gob/info/activity");
  return activities.json();
}
