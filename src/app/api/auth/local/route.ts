import { NextResponse } from "next/server";
import { getPublicAppUrl } from "@/lib/auth/redirect";
import {
  clearAuthError,
  createSessionForUser,
  ensureLocalAdminUser,
  hasLocalAdminCredentials,
  setAuthError,
  validateLocalAdminCredentials,
} from "@/lib/auth/session";

function redirectHome(request: Request) {
  return NextResponse.redirect(getPublicAppUrl(request));
}

export async function POST(request: Request) {
  if (!hasLocalAdminCredentials()) {
    setAuthError("Local admin login is not configured.");
    return redirectHome(request);
  }

  const formData = await request.formData();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  if (!validateLocalAdminCredentials({ email, password })) {
    setAuthError("Local admin credentials were not accepted.");
    return redirectHome(request);
  }

  clearAuthError();
  const userId = await ensureLocalAdminUser();
  await createSessionForUser(userId);
  return redirectHome(request);
}
