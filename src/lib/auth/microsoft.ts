import "server-only";

const MICROSOFT_SCOPES = ["openid", "profile", "email", "User.Read"];

type TokenResponse = {
  access_token: string;
};

export type MicrosoftProfile = {
  id: string;
  displayName: string;
  mail: string | null;
  userPrincipalName: string | null;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set.`);
  }

  return value;
}

export function hasMicrosoftAuthConfig() {
  return Boolean(
    process.env.MICROSOFT_CLIENT_ID &&
      process.env.MICROSOFT_CLIENT_SECRET &&
      process.env.MICROSOFT_TENANT_ID &&
      process.env.MICROSOFT_REDIRECT_URI
  );
}

function getAuthorizeBaseUrl() {
  const tenantId = getRequiredEnv("MICROSOFT_TENANT_ID");
  return `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`;
}

function getTokenUrl() {
  const tenantId = getRequiredEnv("MICROSOFT_TENANT_ID");
  return `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
}

export function buildMicrosoftAuthorizeUrl(state: string) {
  const params = new URLSearchParams({
    client_id: getRequiredEnv("MICROSOFT_CLIENT_ID"),
    response_type: "code",
    redirect_uri: getRequiredEnv("MICROSOFT_REDIRECT_URI"),
    response_mode: "query",
    scope: MICROSOFT_SCOPES.join(" "),
    state,
    prompt: "select_account",
  });

  return `${getAuthorizeBaseUrl()}?${params.toString()}`;
}

export async function exchangeMicrosoftCode(code: string) {
  const params = new URLSearchParams({
    client_id: getRequiredEnv("MICROSOFT_CLIENT_ID"),
    client_secret: getRequiredEnv("MICROSOFT_CLIENT_SECRET"),
    grant_type: "authorization_code",
    code,
    redirect_uri: getRequiredEnv("MICROSOFT_REDIRECT_URI"),
    scope: MICROSOFT_SCOPES.join(" "),
  });

  const response = await fetch(getTokenUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Microsoft token exchange failed: ${body}`);
  }

  return (await response.json()) as TokenResponse;
}

export async function fetchMicrosoftProfile(accessToken: string) {
  const response = await fetch(
    "https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Microsoft profile fetch failed: ${body}`);
  }

  return (await response.json()) as MicrosoftProfile;
}
