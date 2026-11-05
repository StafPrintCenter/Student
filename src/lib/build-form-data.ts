/** Payload -> FormData : ignore undefined, gère File, booléens ("1"/"0") et null */
export function buildFormData(payload: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    if (value instanceof File) fd.append(key, value);
    else if (typeof value === "boolean") fd.append(key, value ? "1" : "0");
    else if (value === null) fd.append(key, "");
    else fd.append(key, String(value));
  }
  return fd;
}