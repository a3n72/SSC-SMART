import { defaultLaunchSettings, mergeLaunchSettings } from "../../examples/app-config.js";

describe("app-config merge behavior", () => {
  test("正式部署的憑證與 redirect 設定不應被舊 localStorage 覆蓋", () => {
    // 憑證已移到本機設定檔，這裡用假的部署值驗證合併規則
    const deployed = { ...defaultLaunchSettings, clientId: "deployed-id", clientSecret: "deployed-secret" };
    const merged = mergeLaunchSettings(deployed, {
      clientId: "old-client-id",
      clientSecret: "old-secret",
      redirectUri: "./index.html",
      tokenAuthMethod: "none",
      issUrl: "https://launcher.example/fhir"
    });

    expect(merged.clientId).toBe("deployed-id");
    expect(merged.clientSecret).toBe("deployed-secret");
    expect(merged.redirectUri).toBe(defaultLaunchSettings.redirectUri);
    expect(merged.tokenAuthMethod).toBe(defaultLaunchSettings.tokenAuthMethod);
    expect(merged.issUrl).toBe("https://launcher.example/fhir");
  });
});
