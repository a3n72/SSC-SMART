import {
  buildTokenRequest,
  getAuthContext,
  persistAuthContext,
  resolveSmartEndpoints
} from "../../src/smart-auth.js";

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    }
  };
}

describe("smart-auth helpers", () => {
  test("persistAuthContext 與 getAuthContext 應該保存 confidential client 相關設定", () => {
    const storage = createMemoryStorage();

    persistAuthContext({
      iss: "https://launcher.example/fhir",
      clientId: "client-123",
      clientSecret: "secret-456",
      redirectUri: "https://app.example/index.html",
      scope: "launch/patient patient/*.read",
      tokenEndpoint: "https://launcher.example/token",
      tokenAuthMethod: "client_secret_post"
    }, storage);

    const context = getAuthContext(storage);

    expect(context.iss).toBe("https://launcher.example/fhir");
    expect(context.clientId).toBe("client-123");
    expect(context.clientSecret).toBe("secret-456");
    expect(context.tokenAuthMethod).toBe("client_secret_post");
  });

  test("buildTokenRequest 應該支援 client_secret_post", () => {
    const request = buildTokenRequest({
      code: "abc",
      clientId: "client-123",
      clientSecret: "secret-456",
      redirectUri: "https://app.example/index.html",
      codeVerifier: "verifier-789",
      tokenEndpoint: "https://launcher.example/token",
      tokenAuthMethod: "client_secret_post"
    });

    expect(request.resolvedMethod).toBe("client_secret_post");
    expect(request.init.headers.Authorization).toBeUndefined();
    expect(request.init.body.get("client_id")).toBe("client-123");
    expect(request.init.body.get("client_secret")).toBe("secret-456");
  });

  test("buildTokenRequest 應該支援 client_secret_basic", () => {
    const request = buildTokenRequest({
      code: "abc",
      clientId: "client-123",
      clientSecret: "secret-456",
      redirectUri: "https://app.example/index.html",
      codeVerifier: "verifier-789",
      tokenEndpoint: "https://launcher.example/token",
      tokenAuthMethod: "client_secret_basic"
    });

    expect(request.resolvedMethod).toBe("client_secret_basic");
    expect(request.init.headers.Authorization).toBeDefined();
    expect(request.init.body.get("client_id")).toBeNull();
    expect(request.init.body.get("client_secret")).toBeNull();
  });

  test("resolveSmartEndpoints 應該優先使用 well-known 設定", () => {
    const endpoints = resolveSmartEndpoints({
      issUrl: "https://launcher.example/fhir",
      mode: "ehr-launch",
      smartConfig: {
        authorization_endpoint: "https://launcher.example/oauth2/authorize",
        token_endpoint: "https://launcher.example/oauth2/token"
      }
    });

    expect(endpoints.authEndpoint).toBe("https://launcher.example/oauth2/authorize");
    expect(endpoints.tokenEndpoint).toBe("https://launcher.example/oauth2/token");
  });
});
