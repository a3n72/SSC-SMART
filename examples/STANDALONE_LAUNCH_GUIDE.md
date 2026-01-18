# Provider Standalone Launch 使用指南

本指南說明如何使用 **Provider Standalone Launch** 模式連接到 THAS 沙盒環境。

## 📋 前置準備

### 1. 取得 THAS 沙盒環境資訊

從 THAS 沙盒環境的 **SAND-BOX** 對話框中取得以下資訊：

- **ISS Server URL**: `https://thas.mohw.gov.tw/v/r4/sim/[模擬參數]/fhir`
- **Patient Viewer URL**: `https://thas.mohw.gov.tw/patient-browser/`

### 2. 註冊應用程式

在 THAS 沙盒環境中註冊您的應用程式，取得：
- **Client ID**: 應用程式的唯一識別碼
- **Redirect URI**: 授權完成後的回調網址（必須與註冊時設定的一致）

### 3. 設定 Scope 權限

根據您的需求設定適當的 scope，例如：
```
launch/patient openid fhiruser patient/*.read patient/*.write
```

## 🚀 執行方式

### 方式一：使用 HTML 範例頁面（推薦）

1. **開啟範例頁面**
   ```bash
   # 使用本地伺服器開啟（避免 CORS 問題）
   # 方法 1: 使用 Python
   python -m http.server 8000
   
   # 方法 2: 使用 Node.js http-server
   npx http-server -p 8000
   
   # 方法 3: 使用 VS Code Live Server 擴充功能
   ```

2. **在瀏覽器中開啟**
   ```
   http://localhost:8000/examples/standalone-launch-thas.html
   ```

3. **設定連線參數**
   - 輸入從 SAND-BOX 對話框取得的 **ISS Server URL**
   - 輸入您的 **Client ID**
   - 確認 **Redirect URI**（預設為當前頁面 URL）
   - 確認 **Scope** 權限

4. **開始授權流程**
   - 點擊「🚀 開始 Standalone Launch」按鈕
   - 瀏覽器會導向 THAS 授權頁面
   - 登入並選擇病人
   - 授權完成後會自動返回您的應用程式

5. **使用功能**
   - 取得病人資料
   - 讀取 Observation
   - 建立新的健康記錄（如血壓）

### 方式二：使用 JavaScript 程式碼

```javascript
import { LTC888Client } from "../src/index.js";

// THAS 沙盒環境的 ISS URL
const THAS_ISS_URL = "https://thas.mohw.gov.tw/v/r4/sim/[您的模擬參數]/fhir";

// 初始化 Client
const client = new LTC888Client(THAS_ISS_URL, {
  clientId: "your-client-id",  // 替換為您的 Client ID
  scope: "launch/patient openid fhiruser patient/*.read patient/*.write",
  redirectUri: "http://localhost:8000/examples/standalone-launch-thas.html"
});

// 完成授權流程
await client.initialize();

// 取得病人資料
const patient = await client.getPatientInfo();
console.log("病人資料:", patient);
```

### 方式三：使用 FHIRAuth 直接授權

```javascript
import { FHIRAuth } from "../src/index.js";

const auth = new FHIRAuth(THAS_ISS_URL);

const fhirClient = await auth.standaloneLaunch({
  clientId: "your-client-id",
  scope: "launch/patient openid fhiruser patient/*.read",
  redirectUri: window.location.href.split("?")[0]
});

// 使用 fhirClient 進行 FHIR 操作
const patient = await fhirClient.patient.read();
```

## 🔍 常見問題

### Q1: 授權失敗，顯示 "redirect_uri_mismatch"
**A:** 確保 Redirect URI 與在 THAS 註冊時設定的完全一致（包括協議、域名、路徑、端口）。

### Q2: 無法取得病人資料
**A:** 
- 確認 scope 中包含 `patient/*.read` 權限
- 確認已成功完成授權流程
- 檢查瀏覽器控制台是否有錯誤訊息

### Q3: CORS 錯誤
**A:** 
- 使用本地伺服器開啟 HTML 檔案，不要直接使用 `file://` 協議
- 確認 THAS 沙盒環境已設定允許您的域名

### Q4: 如何選擇不同的病人？
**A:** 
- 登出後重新執行 Standalone Launch
- 在授權流程中選擇不同的病人
- 或使用 Patient Viewer URL 預先選擇病人

## 📚 相關資源

- [SMART on FHIR 官方文件](http://docs.smarthealthit.org/)
- [THAS 沙盒環境](https://thas.mohw.gov.tw/)
- [TW Core IG](https://twcore.mohw.gov.tw/)
- [FHIR 官方文件](https://www.hl7.org/fhir/)

## 🔐 安全注意事項

1. **不要將 Client ID 和 Secret 提交到公開版本控制系統**
2. **使用 HTTPS 協議進行生產環境部署**
3. **定期更新和檢查授權 token 的有效期**
4. **遵循最小權限原則，只請求必要的 scope**

## 📝 範例檔案

- `standalone-launch-thas.html` - 完整的 HTML 範例頁面
- `standalone-launch-thas.js` - JavaScript 程式碼範例
- `launch.html` - 通用的 Launch 範例（支援 EHR 和 Standalone）

## 🆘 需要協助？

如果遇到問題，請：
1. 檢查瀏覽器控制台的錯誤訊息
2. 確認 THAS 沙盒環境的狀態
3. 參考 [README.md](../README.md) 中的詳細說明
4. 查看專案的 Issue 或提交新的 Issue
