# 代謝健康紅綠燈系統使用指南

## 概述

「代謝健康紅綠燈 (Metabolic Syndrome Intelligent Warning System)」是一個基於 SMART on FHIR 標準的健康評估系統，用於評估和管理代謝症候群相關的健康指標。

## 功能特色

- ✅ **完整的病人資料管理**：基本資料、社會史、生活習慣
- ✅ **檢驗報告展示**：血壓、血糖、血脂、肝功能、腎功能
- ✅ **臨床評估**：代謝症候群診斷、健康評分、危險因子分析
- ✅ **資料匯出**：支援 JSON 和 CSV 格式匯出
- ✅ **符合 FHIR 標準**：所有資料結構符合 HL7 FHIR R4 規範

## 快速開始

### 1. 啟動本地伺服器

```bash
# 使用 Python
python -m http.server 8000

# 或使用 Node.js http-server
npx http-server -p 8000
```

### 2. 開啟授權頁面

在瀏覽器中開啟：
```
http://localhost:8000/examples/launch.html
```

### 3. 完成授權流程

1. 在 `launch.html` 中設定授權參數
2. 完成身分驗證和病人選擇
3. 系統會自動導向 `metabolic-syndrome.html`

### 4. 使用系統功能

- **病人資料**：查看基本資料和社會史
- **檢驗報告**：查看各項檢驗結果
- **臨床評估**：查看代謝症候群評估和健康評分
- **匯出報告**：下載 JSON 或 CSV 格式的完整報告

## 檔案結構

```
examples/
├── metabolic-syndrome.html          # 主程式頁面
├── fhir-data/
│   ├── metabolic-syndrome-patient.json      # Patient 資源
│   ├── metabolic-syndrome-observations.json # Observation 資源
│   ├── metabolic-syndrome-conditions.json    # Condition 資源
│   └── metabolic-syndrome-complete.json     # 完整 Bundle
└── METABOLIC_SYNDROME_GUIDE.md     # 本文件
```

## FHIR 資源說明

### Patient 資源

包含病人的基本資料、聯絡資訊、社會史和生活習慣：

- 基本資料：姓名、性別、出生日期、身分證字號
- 聯絡資訊：地址、電話
- 就醫資訊：就診機構、主治醫師
- 社會史：飲酒習慣、運動習慣、檳榔習慣

### Observation 資源

包含各項檢驗結果：

- **血壓** (LOINC: 85354-9)
  - 收縮壓 (LOINC: 8480-6)
  - 舒張壓 (LOINC: 8462-4)
- **血糖** (LOINC: 33747-0) - 空腹血糖
- **血脂**
  - 總膽固醇 (LOINC: 2093-3)
  - 三酸甘油脂 (LOINC: 2571-8)
  - HDL膽固醇 (LOINC: 2085-9)
  - LDL膽固醇 (LOINC: 2089-1)
- **肝功能**
  - ALT/GPT (LOINC: 1975-2)
  - AST/GOT (LOINC: 1968-7)
- **腎功能**
  - 肌酸酐 (LOINC: 2160-0)
  - 尿酸 (LOINC: 33914-3)
- **腰圍** (LOINC: 8280-0)

### Condition 資源

包含代謝症候群診斷：

- 診斷代碼：SNOMED CT 44054006 (Metabolic syndrome)
- 診斷標準：符合 3/5 項危險因子
- 證據：相關的 Observation 資源

## 代謝症候群診斷標準

系統根據以下五項標準進行評估：

1. **腰圍過大**：≥ 90 cm（男性）
2. **血壓偏高**：收縮壓 ≥ 130 mmHg 或舒張壓 ≥ 85 mmHg
3. **空腹血糖偏高**：≥ 100 mg/dL
4. **三酸甘油脂過高**：≥ 150 mg/dL
5. **HDL膽固醇過低**：< 40 mg/dL（男性）或 < 50 mg/dL（女性）

**診斷標準**：符合上述 3 項或以上即診斷為代謝症候群。

## 健康評分計算

系統會計算以下健康評分：

- **整體健康**：綜合各項指標的整體評分
- **代謝健康**：基於代謝症候群評估結果
- **心血管健康**：基於血壓、血脂等指標
- **肝腎功能**：基於肝功能和腎功能檢驗結果

## 資料匯出

### JSON 格式

匯出完整的 FHIR Bundle，包含：
- Patient 資源
- 所有 Observation 資源
- Condition 資源

### CSV 格式

匯出檢驗報告表格，包含：
- 檢查項目
- 檢測結果
- 正常範圍
- 檢驗日期
- 判定結果

## 上傳到 FHIR Server

### 使用範例資料

如果您想使用範例資料進行測試，可以使用 `fhir-data/metabolic-syndrome-complete.json`：

```bash
# 使用 curl 上傳
curl -X POST \
  https://your-fhir-server/fhir \
  -H "Content-Type: application/fhir+json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d @examples/fhir-data/metabolic-syndrome-complete.json
```

### 使用 SDK 上傳

```javascript
import { LTC888Client } from '../src/index.js';

const client = new LTC888Client();
await client.initialize();

// 讀取範例資料
const bundle = await fetch('./fhir-data/metabolic-syndrome-complete.json')
  .then(res => res.json());

// 上傳 Patient
await client.createResource(bundle.entry[0].resource);

// 上傳 Observations
for (const entry of bundle.entry.slice(1, -1)) {
  if (entry.resource.resourceType === 'Observation') {
    await client.createObservation(entry.resource);
  }
}

// 上傳 Condition
const conditionEntry = bundle.entry.find(e => e.resource.resourceType === 'Condition');
if (conditionEntry) {
  await client.createResource(conditionEntry.resource);
}
```

## 整合到現有專案

### 更新 launch.html

在 `launch.html` 的 redirectUri 設定中，可以選擇導向到：

- `./index.html` - 原有的主程式
- `./metabolic-syndrome.html` - 代謝健康紅綠燈系統

### 更新 index.html

可以在 `index.html` 中添加連結到代謝健康紅綠燈系統：

```html
<a href="./metabolic-syndrome.html">前往代謝健康紅綠燈系統</a>
```

## 注意事項

1. **授權流程**：必須先完成 SMART on FHIR 授權才能使用系統
2. **資料來源**：系統會從 FHIR Server 讀取資料，確保有適當的權限
3. **參考範圍**：某些檢驗項目的參考範圍有性別差異（如 HDL 膽固醇、尿酸）
4. **診斷標準**：代謝症候群的診斷標準可能因地區而異，請確認符合當地標準

## 相關資源

- [SMART on FHIR 官方文件](http://docs.smarthealthit.org/)
- [FHIR 官方文件](https://www.hl7.org/fhir/)
- [TW Core IG](https://twcore.mohw.gov.tw/)
- [LOINC 編碼系統](https://loinc.org/)
- [SNOMED CT](https://www.snomed.org/)

## 技術支援

如有問題或建議，請參考：
- [完整工作流程指南](COMPLETE_WORKFLOW.md)
- [故障排除指南](TROUBLESHOOTING.md)
