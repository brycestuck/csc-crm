import { NextResponse } from "next/server";
import { getPublicAppUrl } from "@/lib/auth/redirect";
import { clearSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  clearSession();
  return NextResponse.redirect(getPublicAppUrl(request));
}
