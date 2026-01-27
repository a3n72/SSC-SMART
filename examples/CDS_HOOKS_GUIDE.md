# CDS Hooks 智慧提醒與警示使用指南

## 概述

本專案實作了符合 **HL7 FHIR CDS Hooks** 標準的智慧提醒與警示系統，專為御管轉診平台設計。系統支援定期或符合條件時事件觸發，並可輸出平台通知與 Dashboard 管理。

## 功能特色

- ✅ 符合 HL7 FHIR CDS Hooks 1.0 標準
- ✅ 支援多種觸發情境（數值異常、定期提醒、族群提醒）
- ✅ 提供預寫資料範本
- ✅ 卡片式通知介面，包含按鈕和連結
- ✅ 支援 Dashboard 管理介面
- ✅ 可擴展的 Hook 處理器架構

## 專案結構

```
smart/
├── src/
│   └── cds-hooks.js          # CDS Hooks 核心服務模組
├── examples/
│   ├── cds-hooks-dashboard.html  # 前端 Dashboard 介面
│   ├── cds-hooks-server.js       # 服務端範例
│   └── CDS_HOOKS_GUIDE.md        # 本文件
└── package.json
```

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 啟動 CDS Hooks 服務端

```bash
npm run cds-hooks-server
```

服務將在 `http://localhost:3000` 啟動。

### 3. 開啟前端 Dashboard

使用本地伺服器開啟 `examples/cds-hooks-dashboard.html`：

```bash
# 使用 Python
python -m http.server 8000

# 或使用 Node.js http-server
npx http-server -p 8000
```

然後在瀏覽器中開啟：
```
http://localhost:8000/examples/cds-hooks-dashboard.html
```

## CDS Hooks 服務端點

### 服務發現

**GET** `/cds-services`

列出所有可用的 CDS Hooks 服務。

回應範例：
```json
{
  "services": [
    {
      "hook": "patient-view",
      "title": "病人檢視提醒",
      "description": "當檢視病人資料時，提供智慧提醒與警示",
      "id": "smart-alert-patient-view",
      "prefetch": {
        "patient": "Patient/{{context.patientId}}",
        "observations": "Observation?subject=Patient/{{context.patientId}}&_sort=-date&_count=10"
      }
    }
  ]
}
```

### Patient View Hook

**POST** `/cds-services/patient-view`

當檢視病人資料時觸發，提供智慧提醒與警示。

請求範例：
```json
{
  "hook": "patient-view",
  "hookInstance": "unique-instance-id",
  "context": {
    "patientId": "12345",
    "userId": "user-001"
  },
  "prefetch": {
    "patient": { ... },
    "observations": { ... },
    "conditions": { ... },
    "carePlans": { ... }
  }
}
```

回應範例：
```json
{
  "cards": [
    {
      "summary": "血壓數值異常：數值超出正常範圍",
      "detail": "目前數值：165/95 mmHg，正常範圍上限：140/90 mmHg。個案血壓連續多日超標，建議立即追蹤處理。",
      "indicator": "critical",
      "source": {
        "label": "御管轉診平台 - 智慧提醒與警示"
      },
      "suggestions": [
        {
          "label": "查看詳細資料",
          "uuid": "alert-bp-001",
          "actions": [
            {
              "type": "link",
              "description": "前往個案管理頁面",
              "url": "http://localhost:3000/dashboard/patient/12345"
            }
          ]
        }
      ],
      "links": [
        {
          "label": "查看完整健康記錄",
          "url": "http://localhost:3000/dashboard/observations/12345",
          "type": "absolute"
        }
      ]
    }
  ]
}
```

## 使用方式

### 基本使用

```javascript
import { createSmartAlertService } from 'ltc-888-sdk';

// 建立 CDS Hooks 服務實例
const service = createSmartAlertService({
  baseUrl: 'http://localhost:3000'
});

// 處理 Hook 請求
const response = await service.handleHook('patient-view', {
  patientId: '12345',
  userId: 'user-001'
}, {
  patient: { ... },
  observations: [ ... ]
});

console.log('提醒卡片:', response.cards);
```

### 自訂 Hook 處理器

```javascript
import { CDSHooksService } from 'ltc-888-sdk';

const service = new CDSHooksService({
  baseUrl: 'http://localhost:3000'
});

// 註冊自訂 Hook
service.registerHook('custom-hook', async (context, prefetch, svc) => {
  const cards = [];
  
  // 建立提醒卡片
  const card = svc.createAlertCard({
    summary: '自訂提醒',
    detail: '這是自訂的提醒內容',
    indicator: 'info',
    source: { label: '我的服務' },
    suggestions: [
      svc.createSuggestion(
        '執行動作',
        'action-001',
        [
          svc.createAction('create', '建立資源', {
            resourceType: 'Communication',
            status: 'completed'
          })
        ]
      )
    ],
    links: [
      svc.createLink('查看詳情', 'http://example.com', 'absolute')
    ]
  });
  
  cards.push(card);
  return cards;
});
```

### 使用預寫資料

```javascript
// 設定預寫資料
service.setPredefinedData('alert-template', {
  summary: '預設提醒標題',
  detail: '預設提醒內容',
  indicator: 'info'
});

// 取得預寫資料
const template = service.getPredefinedData('alert-template');
```

## 提醒類型

### 1. 數值超出上下限值警示

當血壓、血糖等數值連續多日超標，或 eGFR 下降過快時，主動向個管師發出警示。

**觸發條件：**
- 血壓 > 140/90 mmHg
- 血糖 > 126 mg/dL
- eGFR 下降過快

### 2. 特定期限或日期提醒

基於時間或事件節點觸發的通知。

**範例：**
- 安寧共照首訪後七日進行第二次訪視提醒
- 超過五次訪視提醒
- 收案期限屆滿提醒
- 撤管提醒
- 門診日因颱風或醫師停診時，提醒個案預約返診

### 3. 特定族群提醒

針對特定患者群體或狀態觸發的個性化提醒。

**範例：**
- 針對有門診的個案提醒下次返診日期與檢驗項目
- 針對抽菸個案提醒戒菸門診資訊並回饋就醫情況
- 自動通知早期 CKD 個案轉診至腎臟科門診追蹤
- 提醒 Pre-ESRD 收案病人當日未返診者掛號

## Dashboard 功能

前端 Dashboard 提供以下功能：

- 📊 **統計儀表板**：顯示總提醒數、緊急警示、警告提醒、一般提醒
- 🔍 **篩選功能**：依警示等級和關鍵字搜尋
- 🎯 **建議動作**：點擊建議可直接執行對應動作
- 🔗 **快速連結**：提供相關頁面的快速連結
- ✅ **標記已處理**：可標記提醒為已處理
- 🔄 **自動重新載入**：每 5 分鐘自動重新載入提醒

## 卡片指示器（Indicator）

- **critical**：緊急警示（紅色）- 需要立即處理
- **warning**：警告提醒（黃色）- 需要注意
- **info**：一般提醒（藍色）- 資訊性通知

## 動作類型（Action Types）

- **create**：建立 FHIR 資源
- **update**：更新 FHIR 資源
- **delete**：刪除 FHIR 資源
- **link**：導向連結

## 整合範例

### 與 FHIR 伺服器整合

```javascript
import { LTC888Client, createSmartAlertService } from 'ltc-888-sdk';

// 初始化 FHIR 客戶端
const fhirClient = new LTC888Client();
await fhirClient.initialize();

// 建立 CDS Hooks 服務
const cdsService = createSmartAlertService();

// 取得病人資料
const patientId = await fhirClient.getPatientId();
const observations = await fhirClient.getObservation();

// 處理 Hook
const response = await cdsService.handleHook('patient-view', {
  patientId,
  userId: 'current-user'
}, {
  patient: await fhirClient.getPatientInfo(),
  observations: observations.entry?.map(e => e.resource) || []
});

// 顯示提醒卡片
response.cards.forEach(card => {
  console.log(`[${card.indicator}] ${card.summary}`);
  console.log(card.detail);
});
```

## 擴展開發

### 新增自訂提醒邏輯

1. 在 `SmartAlertHookHandlers` 類別中新增靜態方法
2. 在 `createSmartAlertService` 中註冊新的處理器
3. 使用 `createAlertCard`、`createSuggestion`、`createAction`、`createLink` 建立卡片

### 新增 Hook 類型

1. 在服務發現端點中新增服務定義
2. 建立對應的 POST 端點
3. 實作處理邏輯

## 注意事項

1. **安全性**：在生產環境中，請確保：
   - 實作適當的身份驗證和授權
   - 驗證輸入資料
   - 使用 HTTPS
   - 實作速率限制

2. **效能**：大量提醒時考慮：
   - 實作分頁
   - 快取預取資料
   - 非同步處理

3. **標準遵循**：確保實作符合：
   - HL7 FHIR CDS Hooks 1.0 規範
   - FHIR R4 標準
   - TW Core IG 規範（如適用）

## 相關資源

- [HL7 FHIR CDS Hooks 規範](https://cds-hooks.org/)
- [FHIR 官方文件](https://www.hl7.org/fhir/)
- [TW Core IG](https://twcore.mohw.gov.tw/)

## 授權

MIT License
