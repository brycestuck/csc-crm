import { NextResponse } from "next/server";
import { buildMicrosoftAuthorizeUrl, hasMicrosoftAuthConfig } from "@/lib/auth/microsoft";
import { clearAuthError, createOAuthState } from "@/lib/auth/session";

export async function GET(request: Request) {
  if (!hasMicrosoftAuthConfig()) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  clearAuthError();
  const state = createOAuthState();
  return NextResponse.redirect(buildMicrosoftAuthorizeUrl(state));
}
