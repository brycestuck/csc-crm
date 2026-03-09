import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export type SessionTokenPayload = {
  userId: string;
  exp: number;
};

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set.");
  }

  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function toBuffer(value: string) {
  return Buffer.from(value, "utf8");
}

export function createSignedValue(value: string) {
  return `${value}.${sign(value)}`;
}

export function verifySignedValue(signedValue: string) {
  const lastSeparator = signedValue.lastIndexOf(".");
  if (lastSeparator === -1) {
    return null;
  }

  const value = signedValue.slice(0, lastSeparator);
  const providedSignature = signedValue.slice(lastSeparator + 1);
  const expectedSignature = sign(value);

  const providedBuffer = toBuffer(providedSignature);
  const expectedBuffer = toBuffer(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  return value;
}

export function createSessionToken(payload: SessionTokenPayload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return createSignedValue(encoded);
}

export function readSessionToken(token: string): SessionTokenPayload | null {
  const encoded = verifySignedValue(token);
  if (!encoded) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionTokenPayload;
    if (!payload?.userId || typeof payload.exp !== "number") {
      return null;
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function createRandomStateToken() {
  return randomBytes(24).toString("base64url");
}
