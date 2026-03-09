import "server-only";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { ensureWorkspaceSeeded } from "@/lib/db/crm";
import { createRandomStateToken, createSessionToken, readSessionToken } from "@/lib/auth/session-cookie";
import type { UserRole } from "@/lib/types/domain";

const SESSION_COOKIE_NAME = "the_hub_session";
const AUTH_STATE_COOKIE_NAME = "the_hub_auth_state";
const AUTH_ERROR_COOKIE_NAME = "the_hub_auth_error";
const SESSION_TTL_SECONDS = 60 * 60 * 10;
const LOCAL_ADMIN_DEFAULT_NAME = "Bryce Stuckenschneider";
const LOCAL_ADMIN_DEFAULT_COLOR = "#111827";

export type CurrentUser = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarColor: string;
  avatarImagePath: string | null;
};

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function getCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction(),
    path: "/",
    maxAge,
  };
}

export async function createSessionForUser(userId: string) {
  const cookieStore = cookies();
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const token = createSessionToken({ userId, exp });

  cookieStore.set(SESSION_COOKIE_NAME, token, getCookieOptions(SESSION_TTL_SECONDS));
  cookieStore.delete(AUTH_ERROR_COOKIE_NAME);
}

export function clearSession() {
  cookies().delete(SESSION_COOKIE_NAME);
}

export function createOAuthState() {
  const state = createRandomStateToken();
  cookies().set(AUTH_STATE_COOKIE_NAME, state, getCookieOptions(60 * 10));
  return state;
}

export function verifyOAuthState(state: string | null) {
  const cookieStore = cookies();
  const expected = cookieStore.get(AUTH_STATE_COOKIE_NAME)?.value ?? null;
  cookieStore.delete(AUTH_STATE_COOKIE_NAME);
  return Boolean(state && expected && state === expected);
}

export function setAuthError(message: string) {
  cookies().set(AUTH_ERROR_COOKIE_NAME, message, getCookieOptions(60 * 15));
}

export function clearAuthError() {
  cookies().delete(AUTH_ERROR_COOKIE_NAME);
}

export function getAuthErrorMessage() {
  return cookies().get(AUTH_ERROR_COOKIE_NAME)?.value ?? null;
}

function getLocalAdminEmail() {
  return process.env.LOCAL_ADMIN_EMAIL?.trim().toLowerCase() || null;
}

function getLocalAdminPassword() {
  return process.env.LOCAL_ADMIN_PASSWORD || null;
}

function getLocalAdminName() {
  return process.env.LOCAL_ADMIN_NAME?.trim() || LOCAL_ADMIN_DEFAULT_NAME;
}

export function hasLocalAdminCredentials() {
  return Boolean(getLocalAdminEmail() && getLocalAdminPassword());
}

function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function validateLocalAdminCredentials(input: { email: string; password: string }) {
  const configuredEmail = getLocalAdminEmail();
  const configuredPassword = getLocalAdminPassword();

  if (!configuredEmail || !configuredPassword) {
    return false;
  }

  const submittedEmail = input.email.trim().toLowerCase();
  return (
    constantTimeEqual(submittedEmail, configuredEmail) &&
    constantTimeEqual(input.password, configuredPassword)
  );
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const sessionToken = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return null;
  }

  const payload = readSessionToken(sessionToken);
  if (!payload) {
    return null;
  }

  await ensureWorkspaceSeeded();

  const db = getDb();
  const row = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      role: users.role,
      avatarColor: users.avatarColor,
      avatarImagePath: users.avatarImagePath,
    })
    .from(users)
    .where(and(eq(users.id, payload.userId), isNull(users.deletedAt), eq(users.isActive, true)))
    .limit(1);

  return row[0] ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") {
    redirect("/");
  }

  return user;
}

export async function findUserForMicrosoftProfile(input: { email: string; msOid: string }) {
  await ensureWorkspaceSeeded();
  const db = getDb();
  const normalizedEmail = input.email.trim().toLowerCase();

  const byEmail = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      role: users.role,
      avatarColor: users.avatarColor,
      avatarImagePath: users.avatarImagePath,
      msOid: users.msOid,
    })
    .from(users)
    .where(
      and(
        isNull(users.deletedAt),
        eq(users.isActive, true),
        sql`lower(${users.email}) = ${normalizedEmail}`
      )
    )
    .limit(1);

  if (byEmail[0]) {
    if (byEmail[0].msOid !== input.msOid) {
      await db
        .update(users)
        .set({ msOid: input.msOid, updatedAt: new Date() })
        .where(eq(users.id, byEmail[0].id));
    }

    return byEmail[0];
  }

  const byOid = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      role: users.role,
      avatarColor: users.avatarColor,
      avatarImagePath: users.avatarImagePath,
      msOid: users.msOid,
    })
    .from(users)
    .where(and(isNull(users.deletedAt), eq(users.isActive, true), eq(users.msOid, input.msOid)))
    .limit(1);

  return byOid[0] ?? null;
}

export async function ensureLocalAdminUser() {
  await ensureWorkspaceSeeded();

  const localAdminEmail = getLocalAdminEmail();
  if (!localAdminEmail) {
    throw new Error("LOCAL_ADMIN_EMAIL is not set.");
  }

  const db = getDb();
  const existing = await db
    .select({
      id: users.id,
    })
    .from(users)
    .where(and(isNull(users.deletedAt), sql`lower(${users.email}) = ${localAdminEmail}`))
    .limit(1);

  if (existing[0]) {
    await db
      .update(users)
      .set({
        displayName: getLocalAdminName(),
        role: "admin",
        isActive: true,
        avatarColor: LOCAL_ADMIN_DEFAULT_COLOR,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing[0].id));

    return existing[0].id;
  }

  const inserted = await db
    .insert(users)
    .values({
      email: localAdminEmail,
      displayName: getLocalAdminName(),
      role: "admin",
      isActive: true,
      avatarColor: LOCAL_ADMIN_DEFAULT_COLOR,
    })
    .returning({ id: users.id });

  return inserted[0].id;
}
