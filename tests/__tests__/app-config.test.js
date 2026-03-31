import { defaultLaunchSettings, mergeLaunchSettings } from "../../examples/app-config.js";

describe("app-config merge behavior", () => {
  test("正式部署的憑證與 redirect 設定不應被舊 localStorage 覆蓋", () => {
    const merged = mergeLaunchSettings(defaultLaunchSettings, {
      clientId: "old-client-id",
      clientSecret: "old-secret",
      redirectUri: "./index.html",
      tokenAuthMethod: "none",
      issUrl: "https://launcher.example/fhir"
    });

    expect(merged.clientId).toBe(defaultLaunchSettings.clientId);
    expect(merged.clientSecret).toBe(defaultLaunchSettings.clientSecret);
    expect(merged.redirectUri).toBe(defaultLaunchSettings.redirectUri);
    expect(merged.tokenAuthMethod).toBe(defaultLaunchSettings.tokenAuthMethod);
    expect(merged.issUrl).toBe("https://launcher.example/fhir");
  });
});
