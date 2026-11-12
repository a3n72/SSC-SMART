/**
 * 部署前請依測試單位提供的資訊調整這份設定。
 * 這些值會作為 launch.html 與 redirect 頁面的預設值，
 * 讓私人 launcher 直接打到 redirect URI 時也能自動發起授權。
 * client_secret 不放在這裡：預設以公開 client + PKCE 授權（tokenAuthMethod "auto"）。
 * 需要 confidential client 時，把 clientSecret 與 tokenAuthMethod 放在 examples/app-config.local.js（不進版本控制）。
 */
export const defaultLaunchSettings = {
  clientId: "cc344727-6f90-496c-94fd-c7829aa9a51d",
  clientSecret: "",
  scope: "launch/patient patient/*.read patient/*.write openid fhirUser",
  redirectUri: "./metabolic-syndrome.html",
  tokenAuthMethod: "auto",
  loginType: "",
  issUrl: ""
};

let cachedLaunchSettings = null;

export function mergeLaunchSettings(baseSettings = {}, overrideSettings = {}) {
  const merged = {
    ...baseSettings,
    ...overrideSettings
  };

  // 若部署時已提供正式測試憑證或固定回調頁，就不要再被舊 localStorage 覆蓋。
  if (baseSettings.clientId) {
    merged.clientId = baseSettings.clientId;
  }
  if (baseSettings.clientSecret) {
    merged.clientSecret = baseSettings.clientSecret;
  }
  if (baseSettings.redirectUri) {
    merged.redirectUri = baseSettings.redirectUri;
  }
  if (baseSettings.tokenAuthMethod) {
    merged.tokenAuthMethod = baseSettings.tokenAuthMethod;
  }

  return merged;
}

export async function loadLaunchSettings() {
  if (cachedLaunchSettings) {
    return cachedLaunchSettings;
  }

  let localOverrides = {};

  try {
    const localModule = await import("./app-config.local.js");
    localOverrides =
      localModule.localLaunchSettings ||
      localModule.defaultLaunchSettings ||
      localModule.default ||
      {};
  } catch (error) {
    localOverrides = {};
  }

  cachedLaunchSettings = {
    ...defaultLaunchSettings,
    ...localOverrides
  };

  return cachedLaunchSettings;
}
