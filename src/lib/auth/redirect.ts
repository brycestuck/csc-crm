import "server-only";

export function getPublicAppUrl(request: Request, pathname = "/") {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const proto = forwardedProto || (host?.includes("localhost") ? "http" : "https");

  if (host) {
    return new URL(pathname, `${proto}://${host}`);
  }

  return new URL(pathname, request.url);
}
