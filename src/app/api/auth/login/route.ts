import { NextResponse } from "next/server";
import { getPublicAppUrl } from "@/lib/auth/redirect";
import { buildMicrosoftAuthorizeUrl, hasMicrosoftAuthConfig } from "@/lib/auth/microsoft";
import { clearAuthError, createOAuthState } from "@/lib/auth/session";

export async function GET(request: Request) {
  if (!hasMicrosoftAuthConfig()) {
    return NextResponse.redirect(getPublicAppUrl(request));
  }

  clearAuthError();
  const state = createOAuthState();
  return NextResponse.redirect(buildMicrosoftAuthorizeUrl(state));
}
