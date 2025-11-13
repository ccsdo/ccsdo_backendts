import xss from "xss";

function sanitize<T>(value: T):T {
  if (typeof value === "string") {
    return xss(value.trim()) as unknown as T; // trim + remove malicious scripts
  }
  return value;
}

export default sanitize;
