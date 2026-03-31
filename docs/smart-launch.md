# SMART Launch 指南

## 目標

本專案現在支援以下 SMART on FHIR 啟動情境：

- `launch.html` 手動發起 Standalone Launch
- 私人 launcher / EHR 導向 `launch.html?iss=...&launch=...`
- 私人 launcher 直接打應用程式的 Redirect URI，應用頁會自動接手授權
- confidential client 所需的 `client_id` / `client_secret` / token auth method 設定

## 設定位置

### 1. 部署預設值

請調整 `examples/app-config.js` 或本機專用的 `examples/app-config.local.js`：

```javascript
export const defaultLaunchSettings = {
  clientId: "",
  clientSecret: "",
  scope: "launch/patient patient/*.read patient/*.write openid fhirUser",
  redirectUri: "./metabolic-syndrome.html",
  tokenAuthMethod: "client_secret_post",
  loginType: "",
  issUrl: ""
};
```

### 2. 臨時測試覆蓋

`examples/launch.html` 可在瀏覽器直接輸入：

- `ISS URL`
- `client_id`
- `client_secret`
- `scope`
- `tokenAuthMethod`

儲存後會寫入瀏覽器 `localStorage`，方便用同一台機器反覆測試。

### 3. 本機專用機密設定

第二階段內部測試憑證建議放在 `examples/app-config.local.js`。此檔已加入 `.gitignore`，不會被 Git 追蹤。

## Token 驗證方式

支援以下設定：

- `auto`: 有 `client_secret` 時預設走 `client_secret_post`
- `none`: 僅送 `client_id`
- `client_secret_post`: 在 token request body 帶入 `client_secret`
- `client_secret_basic`: 以 `Authorization: Basic ...` 傳送

## 私人 Launcher 測試方式

### EHR Launch

若 launcher 會帶 `iss` 和 `launch`：

1. 導向 `launch.html?iss=...&launch=...`
2. 頁面會自動完成授權初始化
3. 回到 redirect 頁面後自動交換 token

### Standalone Launch

若 launcher 直接打 Redirect URI 並附帶 `iss`：

1. 導向 `metabolic-syndrome.html?iss=...`
2. 應用頁會讀取 `examples/app-config.js` 與本機保存設定
3. 自動發起授權
4. 回到同一頁完成 token 交換

## 注意事項

- 正式前端不建議長期保存 `client_secret`
- 若私人 launcher 網域與現有站點不同，部署站的 CSP / CORS 白名單也要同步調整
- 若對方要求 Backend Service 模式，仍需另做 JWKS / server-to-server 流程
