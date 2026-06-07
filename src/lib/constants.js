export const RESERVED_HANDLES = [
  "login",
  "signup",
  "dashboard",
  "api",
  "auth",
  "admin",
];

/**
 * Returns true when handle matches a reserved route name (case-insensitive).
 */
export function isReservedHandle(handle) {
  return RESERVED_HANDLES.includes(String(handle).toLowerCase());
}
