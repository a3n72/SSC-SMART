# 專案架構文件

## 📐 專案結構

```
ltc-888-sdk/
├── src/                          # 核心 SDK 原始碼
│   ├── index.js                  # SDK 入口點，匯出所有公開 API
│   ├── auth.js                   # SMART on FHIR 授權模組
│   ├── client.js                 # LTC888Client 核心客戶端
│   ├── mapper.js                 # 888 數據轉換模組（888 → TW Core IG）
│   └── cds-hooks.js              # CDS Hooks 服務模組
│
├── examples/                     # 範例程式碼和示範頁面
│   ├── basic-usage.js            # 基本使用範例（Node.js）
│   ├── standalone-launch-thas.js # Standalone Launch 範例
│   ├── cds-hooks-server.js       # CDS Hooks 服務端範例
│   │
│   ├── launch.html               # EHR/Standalone Launch 啟動頁面
│   ├── index.html                # 主程式頁面（查看、分析、匯出）
│   ├── standalone-launch-thas.html # Provider Standalone Launch 範例頁面
│   ├── cds-hooks-dashboard.html  # CDS Hooks Dashboard 介面
│   │
│   ├── twcore-case-888.json      # TW Core IG 個案完整資料範例
│   │
│   ├── COMPLETE_WORKFLOW.md      # 完整工作流程指南
│   ├── SMART_ON_FHIR_FLOW.md     # SMART on FHIR 授權流程說明
│   ├── STANDALONE_LAUNCH_GUIDE.md # Provider Standalone Launch 指南
│   ├── CDS_HOOKS_GUIDE.md        # CDS Hooks 使用指南
│   └── TROUBLESHOOTING.md        # 疑難排解指南
│
├── tests/                        # 測試檔案
│   ├── __tests__/                # Jest 測試檔案
│   │   ├── auth.test.js          # 授權模組測試
│   │   ├── client.test.js        # 客戶端測試
│   │   ├── mapper.test.js        # 數據轉換測試
│   │   └── cds-hooks.test.js     # CDS Hooks 測試
│   └── fixtures/                 # 測試用資料
│
├── docs/                         # 額外文檔（可選）
│   └── api/                      # API 文檔
│
├── .github/                      # GitHub 配置
│   └── workflows/                # CI/CD 工作流程
│       └── ci.yml                # 持續整合配置
│
├── package.json                  # 專案配置和依賴
├── jest.config.js                # Jest 測試配置
├── .gitignore                    # Git 忽略檔案
├── .editorconfig                 # 編輯器配置
├── .eslintrc.js                  # ESLint 配置（可選）
│
├── README.md                     # 專案說明文件
├── QUICK_START.md                # 快速啟動指南
├── ARCHITECTURE.md               # 本文件（架構說明）
└── LICENSE                       # 授權文件
```

## 🏗️ 核心模組架構

### 1. 授權模組 (`src/auth.js`)

**職責：** 處理 SMART on FHIR 授權流程

**主要類別：**
- `FHIRAuth` - 授權管理類別

**支援的啟動模式：**
- ✅ EHR Launch（從 EHR 系統啟動）
- ✅ Standalone Launch（獨立啟動）
- ✅ Provider Standalone Launch（連接到 THAS 沙盒）

**核心方法：**
- `ehrLaunch(iss, launch, options)` - EHR Launch 流程
- `standaloneLaunch(options)` - Standalone Launch 流程
- `autoLaunch(options)` - 自動判斷啟動類型
- `ready()` - 恢復已存在的授權狀態
- `logout()` - 登出並清除授權

### 2. 客戶端模組 (`src/client.js`)

**職責：** 封裝 FHIR API 操作，提供高階 API

**主要類別：**
- `LTC888Client` - 長照 888 SDK 客戶端

**核心功能：**
- 病人資料讀取
- Observation 資源 CRUD
- CarePlan 和 Goal 讀取
- 通用資源操作（read/create/update）

**核心方法：**
- `initialize(options)` - 初始化並完成授權
- `getPatientInfo()` - 取得病人資料
- `getPatientId()` - 取得病人 ID
- `getObservation(id, searchParams)` - 讀取 Observation
- `createObservation(observation)` - 建立 Observation
- `updateObservation(observation)` - 更新 Observation
- `getCarePlan(id, searchParams)` - 讀取 CarePlan
- `getGoal(id, searchParams)` - 讀取 Goal
- `readResource(resourceType, resourceId, searchParams)` - 通用讀取
- `createResource(resource)` - 通用建立
- `updateResource(resource)` - 通用更新
- `logout()` - 登出

### 3. 數據轉換模組 (`src/mapper.js`)

**職責：** 將 888 長照議題數據轉換為符合 TW Core IG 規範的 FHIR 資源

**支援的數據類型：**
- ✅ 血壓（Blood Pressure）
- ✅ 血糖（Blood Glucose）- 支援空腹/飯後/隨機
- ✅ 體重（Body Weight）
- ✅ 步數（Step Count）
- ✅ 體溫（Body Temperature）
- ✅ 心率（Heart Rate）

**核心函數：**
- `mapBloodPressure(systolic, diastolic, patientId, effectiveDateTime)`
- `mapBloodGlucose(value, patientId, type, effectiveDateTime)`
- `mapBodyWeight(value, patientId, effectiveDateTime)`
- `mapStepCount(steps, patientId, effectiveDateTime)`
- `mapBodyTemperature(value, patientId, effectiveDateTime)`
- `mapHeartRate(value, patientId, effectiveDateTime)`
- `mapObservation(type, value, patientId, effectiveDateTime)` - 通用映射

### 4. CDS Hooks 模組 (`src/cds-hooks.js`)

**職責：** 實作 HL7 FHIR CDS Hooks 標準，提供智慧提醒與警示

**主要類別：**
- `CDSHooksService` - CDS Hooks 服務核心
- `SmartAlertHookHandlers` - 預設的智慧提醒處理器

**支援的 Hook：**
- ✅ `patient-view` - 病人檢視提醒
- ✅ `order-select` - 醫囑選擇提醒（可擴展）

**核心功能：**
- 數值超出上下限值警示
- 特定期限或日期提醒
- 特定族群提醒（如早期 CKD、抽菸個案）

**核心方法：**
- `registerHook(hook, handler)` - 註冊 Hook 處理器
- `handleHook(hook, context, prefetch)` - 處理 Hook 請求
- `createAlertCard(options)` - 建立提醒卡片
- `createSuggestion(label, uuid, actions)` - 建立建議
- `createAction(type, description, resource, url)` - 建立動作
- `createLink(label, url, type, appContext)` - 建立連結

## 🔄 資料流程

### SMART on FHIR 授權流程

```
1. 啟動應用程式
   ↓
2. 判斷啟動類型（EHR Launch / Standalone Launch）
   ↓
3. 建立授權請求（包含 PKCE）
   ↓
4. 導向授權伺服器
   ↓
5. 使用者登入並選擇病人
   ↓
6. 授權伺服器回傳授權碼
   ↓
7. 使用授權碼交換 Access Token
   ↓
8. 使用 Access Token 呼叫 FHIR API
```

### 數據轉換流程

```
888 長照原始資料
   ↓
Mapper 函數（mapBloodPressure, mapBloodGlucose 等）
   ↓
符合 TW Core IG 規範的 FHIR Observation
   ↓
透過 LTC888Client 上傳到 FHIR 伺服器
```

### CDS Hooks 流程

```
FHIR 系統觸發 Hook（如 patient-view）
   ↓
CDS Hooks 服務接收請求
   ↓
執行對應的 Hook 處理器
   ↓
分析病人資料和上下文
   ↓
生成提醒卡片（Cards）
   ↓
返回給 FHIR 系統顯示
```

## 🔌 外部依賴

### 核心依賴
- **fhirclient** (^2.6.3) - SMART on FHIR 客戶端庫

### 開發依賴
- **jest** (^29.7.0) - 測試框架
- **express** (^4.18.2) - CDS Hooks 服務端範例
- **cors** (^2.8.5) - CORS 中間件

## 🌐 瀏覽器支援

- ✅ Chrome/Edge (最新版本)
- ✅ Firefox (最新版本)
- ✅ Safari (最新版本)
- ✅ 支援 ES6 Modules 的現代瀏覽器

## 📦 打包和發布

### 開發模式
```bash
npm run dev        # 監聽模式，自動重新載入
```

### 測試
```bash
npm test           # 執行所有測試
npm test -- --watch # 監聽模式
npm test -- --coverage # 生成覆蓋率報告
```

### 範例執行
```bash
npm run example              # 執行基本範例
npm run cds-hooks-server     # 啟動 CDS Hooks 服務
```

## 🔐 安全考量

1. **PKCE 支援**：所有授權流程都支援 PKCE（Proof Key for Code Exchange）
2. **Token 管理**：Access Token 儲存在 sessionStorage，頁面關閉後自動清除
3. **State 驗證**：授權流程中使用 state 參數防止 CSRF 攻擊
4. **HTTPS 要求**：生產環境必須使用 HTTPS

## 🚀 擴展性

### 新增數據映射類型

1. 在 `src/mapper.js` 中新增映射函數
2. 在 `src/index.js` 中匯出新函數
3. 更新文檔和範例

### 新增 CDS Hook

1. 在 `src/cds-hooks.js` 中實作處理器
2. 在 `CDSHooksService` 中註冊 Hook
3. 更新服務發現端點（`/cds-services`）

### 新增 FHIR 資源操作

1. 在 `src/client.js` 的 `LTC888Client` 類別中新增方法
2. 使用 `readResource`、`createResource`、`updateResource` 作為基礎
3. 更新文檔和範例

## 📚 相關標準

- [SMART on FHIR](http://docs.smarthealthit.org/) - 應用程式啟動和授權標準
- [FHIR R4](https://www.hl7.org/fhir/) - 健康資訊交換標準
- [TW Core IG](https://twcore.mohw.gov.tw/) - 臺灣核心資料群實作指引
- [CDS Hooks](https://cds-hooks.org/) - 臨床決策支援 Hooks 標準
- [OAuth 2.0](https://oauth.net/2/) - 授權框架
- [OpenID Connect](https://openid.net/connect/) - 身份驗證層

## 🔗 相關資源

- [THAS 沙盒環境](https://thas.mohw.gov.tw/)
- [SMART on FHIR 官方文件](http://docs.smarthealthit.org/)
- [FHIR 官方文件](https://www.hl7.org/fhir/)
- [TW Core IG](https://twcore.mohw.gov.tw/)
