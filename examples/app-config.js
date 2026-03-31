/**
 * 部署前請依測試單位提供的資訊調整這份設定。
 * 這些值會作為 launch.html 與 redirect 頁面的預設值，
 * 讓私人 launcher 直接打到 redirect URI 時也能自動發起授權。
 */
export const defaultLaunchSettings = {
  clientId: "",
  clientSecret: "",
  scope: "launch/patient patient/*.read patient/*.write openid fhirUser",
  redirectUri: "./metabolic-syndrome.html",
  tokenAuthMethod: "client_secret_post",
  loginType: "",
  issUrl: ""
};

let cachedLaunchSettings = null;

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
