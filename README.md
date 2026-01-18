# 888 長照標準化 SDK

協助長照 App 與臺灣衛福部資訊處提供的「醫療資訊大平台（THAS）」沙盒環境進行 SMART on FHIR 介接的 Node.js SDK。

## 專案簡介

本 SDK 專為「臺灣 50」優良 SMART on FHIR 應用程式徵案活動開發，提供完整的 SMART on FHIR 授權流程與數據轉換功能，協助長照機構快速整合 THAS 平台。

## 功能特色

- ✅ 支援 **EHR Launch** 與 **Standalone Launch** 兩種啟動流程
- ✅ 基於 **OAuth 2.0** 與 **OpenID Connect (OIDC)** 的安全授權機制
- ✅ 支援 **PKCE (Proof Key for Code Exchange)** 安全機制
- ✅ 完整的授權流程：授權請求 → 登入/同意 → 取得 code → 交換 token → 呼叫 FHIR API
- ✅ 符合 **TW Core IG**（臺灣核心資料群）規範
- ✅ 提供 888 長照議題數據轉換（血壓、血糖、體重、步數等）
- ✅ 完整的 FHIR 資源讀寫操作（Patient, Observation, CarePlan, Goal 等）
- ✅ TypeScript 友好的 API 設計

> 📖 **技術細節**：詳細的 SMART on FHIR 授權流程說明請參考 [SMART on FHIR 完整授權流程](examples/SMART_ON_FHIR_FLOW.md)

## 安裝

```bash
npm install
```

## 完整工作流程

**啟動/登入 → 授權 → 載入 → 查看資料 → 分析 → 匯出**

### 🚀 快速體驗完整流程

1. **啟動本地伺服器**
   ```bash
   python -m http.server 8000
   # 或
   npx http-server -p 8000
   ```

2. **開啟啟動頁面**
   ```
   http://localhost:8000/examples/launch.html
   ```

3. **按照流程操作**
   - 步驟 1: 在 launch.html 設定四把鑰匙（ISS、Client ID、Scope、Redirect URI）
   - 步驟 2: 完成身分驗證和病人選擇
   - 步驟 3: 自動載入 index.html 主程式
   - 步驟 4: 查看病人資料和健康記錄
   - 步驟 5: 進行數據分析（血壓趨勢圖）
   - 步驟 6: 匯出資料（JSON、CSV）

> 📖 **詳細說明**：請參考 [完整工作流程指南](examples/COMPLETE_WORKFLOW.md)

## 快速開始

### 基本使用

```javascript
import { LTC888Client, mapBloodPressure } from "ltc-888-sdk";

// 初始化客戶端
const client = new LTC888Client();

// 完成授權流程（自動判斷 EHR Launch 或 Standalone Launch）
await client.initialize();

// 取得當前病人資料
const patient = await client.getPatientInfo();
console.log("病人資料:", patient);

// 取得病人 ID
const patientId = await client.getPatientId();

// 將 888 數據轉換為 FHIR Observation
const bloodPressure = mapBloodPressure(120, 80, patientId, new Date());

// 建立 Observation 資源
const result = await client.createObservation(bloodPressure);
console.log("建立成功:", result);
```

### 授權流程

#### EHR Launch（從 EHR 系統啟動）

```javascript
import { FHIRAuth } from "ltc-888-sdk";

const auth = new FHIRAuth();
const client = await auth.ehrLaunch(iss, launch, {
  clientId: "your-client-id",
  scope: "launch/patient openid fhiruser patient/*.read"
});
```

#### Standalone Launch（獨立啟動）

**基本使用：**
```javascript
const auth = new FHIRAuth();
const client = await auth.standaloneLaunch({
  clientId: "your-client-id",
  scope: "launch/patient openid fhiruser patient/*.read"
});
```

**連接到 THAS 沙盒環境（Provider Standalone Launch）：**
```javascript
import { LTC888Client } from "ltc-888-sdk";

// 使用 THAS 沙盒環境的 ISS URL
const THAS_ISS_URL = "https://thas.mohw.gov.tw/v/r4/sim/[模擬參數]/fhir";

const client = new LTC888Client(THAS_ISS_URL, {
  clientId: "your-client-id",
  scope: "launch/patient openid fhiruser patient/*.read patient/*.write",
  redirectUri: "http://localhost:8000/callback"
});

await client.initialize();
```

> 💡 **詳細說明**：請參考 [Provider Standalone Launch 使用指南](examples/STANDALONE_LAUNCH_GUIDE.md) 和 [standalone-launch-thas.html](examples/standalone-launch-thas.html) 範例頁面

### 數據轉換（888 議題 → TW Core IG）

```javascript
import {
  mapBloodPressure,
  mapBloodGlucose,
  mapBodyWeight,
  mapStepCount,
  mapBodyTemperature,
  mapHeartRate
} from "ltc-888-sdk";

const patientId = "patient-123";

// 血壓
const bp = mapBloodPressure(120, 80, patientId, new Date());

// 血糖（空腹）
const glucose = mapBloodGlucose(95, patientId, "空腹", new Date());

// 體重
const weight = mapBodyWeight(65.5, patientId, new Date());

// 步數
const steps = mapStepCount(5000, patientId, new Date());

// 體溫
const temp = mapBodyTemperature(36.5, patientId, new Date());

// 心率
const hr = mapHeartRate(72, patientId, new Date());
```

### 讀取資源

```javascript
// 讀取所有 Observation
const observations = await client.getObservation();

// 讀取特定類型的 Observation
const bloodPressure = await client.getObservation(null, {
  code: "http://loinc.org|85354-9"
});

// 讀取 CarePlan
const carePlans = await client.getCarePlan();

// 讀取 Goal
const goals = await client.getGoal();

// 通用資源讀取
const medications = await client.readResource("MedicationStatement", null, {
  subject: `Patient/${patientId}`
});
```

## 專案結構

```
ltc-888-sdk/
├── src/
│   ├── auth.js       # SMART on FHIR 授權模組
│   ├── client.js     # LTC888Client 核心客戶端
│   ├── mapper.js     # 888 數據轉換模組
│   └── index.js      # SDK 入口點
├── examples/         # 示範程式碼
│   └── basic-usage.js
├── tests/            # 測試檔案
├── package.json
└── README.md
```

## API 文件

### LTC888Client

#### 方法

- `initialize(options)` - 初始化並完成授權流程
- `getPatientInfo()` - 取得當前病人資料
- `getPatientId()` - 取得當前病人 ID
- `getObservation(id, searchParams)` - 讀取 Observation 資源
- `createObservation(observation)` - 建立 Observation 資源
- `updateObservation(observation)` - 更新 Observation 資源
- `getCarePlan(id, searchParams)` - 讀取 CarePlan 資源
- `getGoal(id, searchParams)` - 讀取 Goal 資源
- `readResource(resourceType, resourceId, searchParams)` - 通用資源讀取
- `createResource(resource)` - 通用資源建立
- `updateResource(resource)` - 通用資源更新
- `logout()` - 登出並清除授權狀態

### Mapper 函數

- `mapBloodPressure(systolic, diastolic, patientId, effectiveDateTime)`
- `mapBloodGlucose(value, patientId, type, effectiveDateTime)`
- `mapBodyWeight(value, patientId, effectiveDateTime)`
- `mapStepCount(steps, patientId, effectiveDateTime)`
- `mapBodyTemperature(value, patientId, effectiveDateTime)`
- `mapHeartRate(value, patientId, effectiveDateTime)`
- `mapObservation(type, value, patientId, effectiveDateTime)` - 通用映射函數

## 測試環境

預設測試環境：`https://emr-smart.appx.com.tw/v/r4/fhir`

## 系統需求

- Node.js >= 18.0.0
- 支援 ES6+ 的瀏覽器環境

## 開發

```bash
# 安裝依賴
npm install

# 執行範例
npm run example

# 執行測試
npm test
```

## 授權

MIT License

## 相關資源

- [SMART on FHIR 官方文件](http://docs.smarthealthit.org/)
- [FHIR 官方文件](https://www.hl7.org/fhir/)
- [TW Core IG](https://twcore.mohw.gov.tw/)
- [THAS 沙盒環境](https://emr-smart.appx.com.tw/)

## 貢獻

歡迎提交 Issue 或 Pull Request！
