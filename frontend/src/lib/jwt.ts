/**
 * jwt.ts
 * Minimal, dependency-free helpers for reading the payload of a JWT
 * (access token) on the client so we know WHEN it expires.
 *
 * We never verify the signature here (the backend already did that) —
 * we only read the "exp" claim so the UI can warn the user before the
 * session dies and log them out automatically when it does.
 */

export interface JwtPayload {
  sub?: string;
  role?: string;
  exp?: number; // seconds since epoch
  [key: string]: unknown;
}

/**
 * Decodes a JWT's payload. Returns null if the token is missing/malformed.
 */
export function decodeJwt(token: string | null | undefined): JwtPayload | null {
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Returns the token's expiry as a millisecond epoch timestamp, or null. */
export function getTokenExpiryMs(token: string | null | undefined): number | null {
  const payload = decodeJwt(token);
  if (!payload?.exp) return null;
  return payload.exp * 1000;
}

/** True if the token is missing, malformed, or already expired. */
export function isTokenExpired(token: string | null | undefined): boolean {
  const expiryMs = getTokenExpiryMs(token);
  if (expiryMs === null) return true;
  return Date.now() >= expiryMs;
}