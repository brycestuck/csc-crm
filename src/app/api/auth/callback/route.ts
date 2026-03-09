import { NextResponse } from "next/server";
import { getPublicAppUrl } from "@/lib/auth/redirect";
import { exchangeMicrosoftCode, fetchMicrosoftProfile } from "@/lib/auth/microsoft";
import {
  createSessionForUser,
  findUserForMicrosoftProfile,
  setAuthError,
  verifyOAuthState,
} from "@/lib/auth/session";

function getAppBaseUrl(request: Request) {
  return getPublicAppUrl(request);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error_description") || url.searchParams.get("error");

  if (!verifyOAuthState(state)) {
    setAuthError("Microsoft sign-in could not be verified. Please try again.");
    return NextResponse.redirect(getAppBaseUrl(request));
  }

  if (oauthError) {
    setAuthError(oauthError);
    return NextResponse.redirect(getAppBaseUrl(request));
  }

  if (!code) {
    setAuthError("Microsoft sign-in did not return an authorization code.");
    return NextResponse.redirect(getAppBaseUrl(request));
  }

  try {
    const token = await exchangeMicrosoftCode(code);
    const profile = await fetchMicrosoftProfile(token.access_token);
    const email = (profile.mail || profile.userPrincipalName || "").trim().toLowerCase();

    if (!email) {
      setAuthError("Microsoft sign-in did not return an approved CSC email.");
      return NextResponse.redirect(getAppBaseUrl(request));
    }

    const user = await findUserForMicrosoftProfile({ email, msOid: profile.id });
    if (!user) {
      setAuthError("Your Microsoft account is not on the approved CSC team roster.");
      return NextResponse.redirect(getAppBaseUrl(request));
    }

    await createSessionForUser(user.id);
    return NextResponse.redirect(getAppBaseUrl(request));
  } catch (error) {
    setAuthError(error instanceof Error ? error.message : "Microsoft sign-in failed.");
    return NextResponse.redirect(getAppBaseUrl(request));
  }
}
