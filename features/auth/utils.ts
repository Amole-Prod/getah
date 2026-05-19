import { DEFAULT_AUTH_REDIRECT } from "@/lib/constants/routes";
import { sanitizeNextPath } from "@/lib/utils/redirect";

export function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function resolveNextPath(value: string | string[] | undefined) {
  return sanitizeNextPath(readSearchParam(value) ?? DEFAULT_AUTH_REDIRECT);
}
