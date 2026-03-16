export const ADMIN_SESSION_COOKIE_NAME = "anikitty_admin_session";
const ADMIN_SESSION_DURATION_MS = 1000 * 60 * 60 * 12;
const ADMIN_SESSION_VERSION = 1;

type AdminSessionTokenPayload = {
  sub: string;
  role: "admin";
  iat: number;
  exp: number;
  v: number;
};

export type AdminSession = {
  email: string;
  role: "admin";
  issuedAt: string;
  expiresAt: string;
};

export function getAdminAuthConfigState() {
  const email = process.env.ADMIN_EMAIL?.trim() ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  const sessionSecret = process.env.ADMIN_SESSION_SECRET ?? "";

  return {
    isConfigured: Boolean(email && password && sessionSecret.length >= 32),
    emailConfigured: Boolean(email),
    passwordConfigured: Boolean(password),
    sessionSecretConfigured: sessionSecret.length >= 32,
  };
}

export function verifyAdminCredentials(input: { email: string; password: string }) {
  const configuredEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const configuredPassword = process.env.ADMIN_PASSWORD ?? "";
  const submittedEmail = input.email.trim().toLowerCase();

  if (!configuredEmail || !configuredPassword) {
    return null;
  }

  if (submittedEmail !== configuredEmail || input.password !== configuredPassword) {
    return null;
  }

  return configuredEmail;
}

export async function createAdminSessionToken(email: string) {
  const payload: AdminSessionTokenPayload = {
    sub: email.trim().toLowerCase(),
    role: "admin",
    iat: Date.now(),
    exp: Date.now() + ADMIN_SESSION_DURATION_MS,
    v: ADMIN_SESSION_VERSION,
  };
  const payloadEncoded = encodeBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await signValue(payloadEncoded);
  const signatureEncoded = encodeBase64Url(signature);

  return `${payloadEncoded}.${signatureEncoded}`;
}

export async function readAdminSession(token: string | null | undefined): Promise<AdminSession | null> {
  if (!token) {
    return null;
  }

  const [payloadEncoded, signatureEncoded] = token.split(".");

  if (!payloadEncoded || !signatureEncoded) {
    return null;
  }

  let expectedSignature: Uint8Array;

  try {
    expectedSignature = await signValue(payloadEncoded);
  } catch {
    return null;
  }

  const providedSignature = decodeBase64Url(signatureEncoded);

  if (!timingSafeEqual(expectedSignature, providedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(decodeBase64Url(payloadEncoded)),
    ) as AdminSessionTokenPayload;

    if (
      payload.role !== "admin" ||
      payload.v !== ADMIN_SESSION_VERSION ||
      typeof payload.sub !== "string" ||
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number" ||
      payload.exp <= Date.now()
    ) {
      return null;
    }

    return {
      email: payload.sub,
      role: "admin",
      issuedAt: new Date(payload.iat).toISOString(),
      expiresAt: new Date(payload.exp).toISOString(),
    };
  } catch {
    return null;
  }
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: new Date(Date.now() + ADMIN_SESSION_DURATION_MS),
  };
}

export function getExpiredAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: new Date(0),
  };
}

async function signValue(value: string) {
  const sessionSecret = process.env.ADMIN_SESSION_SECRET ?? "";

  if (sessionSecret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be set and at least 32 characters long.");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(sessionSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));

  return new Uint8Array(signature);
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left[index] ^ right[index];
  }

  return mismatch === 0;
}

function encodeBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}
