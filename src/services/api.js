export function get_api() {
  var base = "";
  if (location.hostname === "localhost") {
    base = "127.0.0.1:8143";
  } else {
    base = location.hostname.replace("iris", "api");
  }
  return `${location.protocol}//${base}/`;
}

export function get_gob_api() {
  return get_api().replace("8143", "8141");
}
