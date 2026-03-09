import assert from "node:assert/strict";
import test from "node:test";
import {
  createRandomStateToken,
  createSessionToken,
  createSignedValue,
  readSessionToken,
  verifySignedValue,
} from "@/lib/auth/session-cookie";

process.env.SESSION_SECRET = "test-session-secret";

test("signed values round-trip", () => {
  const signed = createSignedValue("hello-world");
  assert.equal(verifySignedValue(signed), "hello-world");
});

test("tampered signed values are rejected", () => {
  const signed = createSignedValue("hello-world");
  const tampered = `${signed.slice(0, -1)}x`;
  assert.equal(verifySignedValue(tampered), null);
});

test("session tokens round-trip until expiry", () => {
  const token = createSessionToken({
    userId: "user-123",
    exp: Math.floor(Date.now() / 1000) + 60,
  });

  assert.deepEqual(readSessionToken(token), {
    userId: "user-123",
    exp: readSessionToken(token)?.exp,
  });
});

test("expired session tokens are rejected", () => {
  const token = createSessionToken({
    userId: "user-123",
    exp: Math.floor(Date.now() / 1000) - 60,
  });

  assert.equal(readSessionToken(token), null);
});

test("state tokens are non-empty", () => {
  assert.ok(createRandomStateToken().length > 10);
});
