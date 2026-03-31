const STORAGE_KEYS = {
  iss: "oauth_iss",
  clientId: "oauth_client_id",
  clientSecret: "oauth_client_secret",
  scope: "oauth_scope",
  redirectUri: "oauth_redirect_uri",
  authEndpoint: "oauth_auth_endpoint",
  tokenEndpoint: "oauth_token_endpoint",
  loginType: "oauth_login_type",
  launch: "oauth_launch",
  state: "oauth_state",
  codeVerifier: "oauth_code_verifier",
  tokenAuthMethod: "oauth_token_auth_method",
  accessToken: "access_token",
  tokenResponse: "token_response",
  patientId: "patient_id"
};

export const DEFAULT_SCOPE = "launch/patient patient/*.read patient/*.write openid fhirUser";

export function getStorageKeys() {
  return { ...STORAGE_KEYS };
}

export function getAuthContext(storage = globalThis?.sessionStorage) {
  if (!storage) {
    return {};
  }

  return {
    iss: storage.getItem(STORAGE_KEYS.iss) || "",
    clientId: storage.getItem(STORAGE_KEYS.clientId) || "",
    clientSecret: storage.getItem(STORAGE_KEYS.clientSecret) || "",
    scope: storage.getItem(STORAGE_KEYS.scope) || "",
    redirectUri: storage.getItem(STORAGE_KEYS.redirectUri) || "",
    authEndpoint: storage.getItem(STORAGE_KEYS.authEndpoint) || "",
    tokenEndpoint: storage.getItem(STORAGE_KEYS.tokenEndpoint) || "",
    loginType: storage.getItem(STORAGE_KEYS.loginType) || "",
    launch: storage.getItem(STORAGE_KEYS.launch) || "",
    state: storage.getItem(STORAGE_KEYS.state) || "",
    codeVerifier: storage.getItem(STORAGE_KEYS.codeVerifier) || "",
    tokenAuthMethod: storage.getItem(STORAGE_KEYS.tokenAuthMethod) || "auto"
  };
}

export function persistAuthContext(context, storage = globalThis?.sessionStorage) {
  if (!storage) {
    return context;
  }

  const mapping = {
    iss: STORAGE_KEYS.iss,
    clientId: STORAGE_KEYS.clientId,
    clientSecret: STORAGE_KEYS.clientSecret,
    scope: STORAGE_KEYS.scope,
    redirectUri: STORAGE_KEYS.redirectUri,
    authEndpoint: STORAGE_KEYS.authEndpoint,
    tokenEndpoint: STORAGE_KEYS.tokenEndpoint,
    loginType: STORAGE_KEYS.loginType,
    launch: STORAGE_KEYS.launch,
    state: STORAGE_KEYS.state,
    codeVerifier: STORAGE_KEYS.codeVerifier,
    tokenAuthMethod: STORAGE_KEYS.tokenAuthMethod
  };

  Object.entries(mapping).forEach(([field, key]) => {
    const value = context[field];
    if (value) {
      storage.setItem(key, value);
    } else {
      storage.removeItem(key);
    }
  });

  return getAuthContext(storage);
}

export function clearAuthArtifacts(storage = globalThis?.sessionStorage) {
  if (!storage) {
    return;
  }

  [
    STORAGE_KEYS.iss,
    STORAGE_KEYS.clientId,
    STORAGE_KEYS.clientSecret,
    STORAGE_KEYS.scope,
    STORAGE_KEYS.redirectUri,
    STORAGE_KEYS.authEndpoint,
    STORAGE_KEYS.tokenEndpoint,
    STORAGE_KEYS.loginType,
    STORAGE_KEYS.launch,
    STORAGE_KEYS.state,
    STORAGE_KEYS.codeVerifier,
    STORAGE_KEYS.tokenAuthMethod,
    STORAGE_KEYS.accessToken,
    STORAGE_KEYS.tokenResponse,
    STORAGE_KEYS.patientId
  ].forEach((key) => storage.removeItem(key));
}

export function readLaunchParams(search = "") {
  const params = new URLSearchParams(search || "");
  return {
    code: params.get("code") || "",
    state: params.get("state") || "",
    iss: params.get("iss") || "",
    launch: params.get("launch") || "",
    error: params.get("error") || "",
    errorDescription: params.get("error_description") || ""
  };
}

export function toAbsoluteUrl(input, baseHref = globalThis?.location?.href || "") {
  if (!input) {
    return "";
  }

  return new URL(input, baseHref).toString();
}

export function randomString(length) {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const values = new Uint8Array(length);
  globalThis.crypto.getRandomValues(values);
  return Array.from(values, (value) => charset[value % charset.length]).join("");
}

function base64UrlEncode(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function generatePkce() {
  const codeVerifier = randomString(96);
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data);

  return {
    codeVerifier,
    codeChallenge: base64UrlEncode(digest)
  };
}

export async function fetchSmartConfiguration(issUrl, fetchImpl = globalThis.fetch) {
  if (!issUrl || typeof fetchImpl !== "function") {
    return null;
  }

  try {
    const configUrl = new URL(".well-known/smart-configuration", `${issUrl.replace(/\/+$/, "")}/`).toString();
    const response = await fetchImpl(configUrl);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    return null;
  }
}

export function resolveSmartEndpoints({
  issUrl,
  mode = "standalone",
  smartConfig = null,
  authEndpoint = "",
  tokenEndpoint = ""
}) {
  const issOrigin = new URL(issUrl).origin;
  const resolvedAuthEndpoint =
    authEndpoint ||
    smartConfig?.authorization_endpoint ||
    (mode === "ehr-launch" ? `${issOrigin}/auth/authorize` : `${issOrigin}/provider-login`);

  const resolvedTokenEndpoint =
    tokenEndpoint || smartConfig?.token_endpoint || `${issOrigin}/auth/token`;

  return {
    authEndpoint: resolvedAuthEndpoint,
    tokenEndpoint: resolvedTokenEndpoint
  };
}

export function buildAuthorizationUrl({
  authEndpoint,
  clientId,
  redirectUri,
  scope,
  state,
  codeChallenge,
  iss,
  launch = "",
  loginType = "",
  mode = "standalone"
}) {
  const url = new URL(authEndpoint);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("aud", iss);

  if (mode === "ehr-launch" && launch) {
    url.searchParams.set("launch", launch);
  } else if (loginType) {
    url.searchParams.set("login_type", loginType);
  }

  return url.toString();
}

export async function prepareLaunch({
  iss,
  clientId,
  clientSecret = "",
  scope = DEFAULT_SCOPE,
  redirectUri,
  authEndpoint = "",
  tokenEndpoint = "",
  loginType = "",
  launch = "",
  mode = "standalone",
  tokenAuthMethod = "auto",
  fetchImpl = globalThis.fetch,
  storage = globalThis?.sessionStorage,
  baseHref = globalThis?.location?.href || ""
}) {
  if (!iss) {
    throw new Error("缺少 ISS URL");
  }
  if (!clientId) {
    throw new Error("缺少 Client ID");
  }
  if (!redirectUri) {
    throw new Error("缺少 Redirect URI");
  }

  const smartConfig = await fetchSmartConfiguration(iss, fetchImpl);
  const endpoints = resolveSmartEndpoints({
    issUrl: iss,
    mode,
    smartConfig,
    authEndpoint,
    tokenEndpoint
  });

  const absoluteRedirectUri = toAbsoluteUrl(redirectUri, baseHref);
  const { codeVerifier, codeChallenge } = await generatePkce();
  const state = randomString(24);

  const context = persistAuthContext({
    iss,
    clientId,
    clientSecret,
    scope,
    redirectUri: absoluteRedirectUri,
    authEndpoint: endpoints.authEndpoint,
    tokenEndpoint: endpoints.tokenEndpoint,
    loginType,
    launch,
    state,
    codeVerifier,
    tokenAuthMethod
  }, storage);

  return {
    authUrl: buildAuthorizationUrl({
      authEndpoint: endpoints.authEndpoint,
      clientId,
      redirectUri: absoluteRedirectUri,
      scope,
      state,
      codeChallenge,
      iss,
      launch,
      loginType,
      mode
    }),
    context,
    smartConfig
  };
}

function encodeBasicAuth(value) {
  if (typeof btoa === "function") {
    return btoa(value);
  }

  return Buffer.from(value, "utf8").toString("base64");
}

export function buildTokenRequest({
  code,
  clientId,
  clientSecret = "",
  redirectUri,
  codeVerifier,
  tokenEndpoint,
  tokenAuthMethod = "auto"
}) {
  if (!code) {
    throw new Error("缺少授權碼");
  }
  if (!clientId) {
    throw new Error("缺少 Client ID");
  }
  if (!redirectUri) {
    throw new Error("缺少 Redirect URI");
  }
  if (!codeVerifier) {
    throw new Error("缺少 PKCE code_verifier");
  }
  if (!tokenEndpoint) {
    throw new Error("缺少 Token Endpoint");
  }

  const resolvedMethod =
    tokenAuthMethod === "auto"
      ? (clientSecret ? "client_secret_post" : "none")
      : tokenAuthMethod;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier
  });
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded"
  };

  if (resolvedMethod === "client_secret_basic") {
    headers.Authorization = `Basic ${encodeBasicAuth(`${clientId}:${clientSecret}`)}`;
  } else {
    body.set("client_id", clientId);
    if (resolvedMethod === "client_secret_post" && clientSecret) {
      body.set("client_secret", clientSecret);
    }
  }

  return {
    url: tokenEndpoint,
    init: {
      method: "POST",
      headers,
      body
    },
    resolvedMethod
  };
}

export async function exchangeToken({
  code,
  context = getAuthContext(),
  fetchImpl = globalThis.fetch,
  storage = globalThis?.sessionStorage
}) {
  if (!context?.tokenEndpoint || !context?.clientId || !context?.redirectUri || !context?.codeVerifier) {
    throw new Error("授權上下文不完整，請重新開始授權流程");
  }

  const request = buildTokenRequest({
    code,
    clientId: context.clientId,
    clientSecret: context.clientSecret,
    redirectUri: context.redirectUri,
    codeVerifier: context.codeVerifier,
    tokenEndpoint: context.tokenEndpoint,
    tokenAuthMethod: context.tokenAuthMethod || "auto"
  });

  const response = await fetchImpl(request.url, request.init);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`交換 Token 失敗: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const tokenResponse = await response.json();
  if (storage) {
    storage.setItem(STORAGE_KEYS.accessToken, tokenResponse.access_token || "");
    storage.setItem(STORAGE_KEYS.tokenResponse, JSON.stringify(tokenResponse));
    if (tokenResponse.patient) {
      storage.setItem(STORAGE_KEYS.patientId, tokenResponse.patient);
    }
  }

  return tokenResponse;
}
