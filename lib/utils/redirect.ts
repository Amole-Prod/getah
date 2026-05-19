import { DEFAULT_AUTH_REDIRECT } from "@/lib/constants/routes";

export function sanitizeNextPath(path: string | null | undefined) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return DEFAULT_AUTH_REDIRECT;
  }

  return path;
}
