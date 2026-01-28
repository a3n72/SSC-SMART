# FHIR 資料匯入與檢查指南

## 📋 概述

本指南提供將測試資料匯入 FHIR Server (`https://thas.mohw.gov.tw/v/r4/fhir`) 的完整流程，並檢查所有 FHIR 資源是否符合各頁面需求。

## 🔍 FHIR 資源檢查清單

### 1. 主頁面 (`metabolic-syndrome.html`) 所需資源

#### ✅ Patient 資源
- **檔案**: `fhir-data/metabolic-syndrome-patient.json`
- **需求項目**:
  - [x] 基本資料：姓名、性別、出生日期
  - [x] 身分證字號 (identifier)
  - [x] 地址資訊
  - [x] 聯絡電話
  - [x] 就診機構 (managingOrganization)
  - [x] 主治醫師 (generalPractitioner)
  - [x] 社會史 (extension: tw-patient-social-history)
    - [x] 飲酒習慣
    - [x] 運動習慣
    - [x] 檳榔習慣

#### ✅ Observation 資源
- **檔案**: `fhir-data/metabolic-syndrome-observations.json`
- **需求項目**:
  - [x] 血壓 (LOINC: 85354-9) - 收縮壓/舒張壓
  - [x] 空腹血糖 (LOINC: 33747-0)
  - [x] 總膽固醇 (LOINC: 2093-3)
  - [x] 三酸甘油脂 (LOINC: 2571-8)
  - [x] HDL 膽固醇 (LOINC: 2085-9)
  - [x] LDL 膽固醇 (LOINC: 2089-1)
  - [x] ALT/GPT (LOINC: 1975-2)
  - [x] AST/GOT (LOINC: 1968-7)
  - [x] 肌酸酐 (LOINC: 2160-0)
  - [x] 尿酸 (LOINC: 33914-3)
  - [x] 腰圍 (LOINC: 8280-0)

#### ✅ Condition 資源
- **檔案**: `fhir-data/metabolic-syndrome-conditions.json`
- **需求項目**:
  - [x] 代謝症候群診斷 (SNOMED: 44054006)
  - [x] 臨床狀態 (active)
  - [x] 驗證狀態 (confirmed)
  - [x] 診斷日期
  - [x] 證據資料 (evidence) - 連結到相關 Observation
  - [x] 代謝症候群指標擴充 (extension: tw-condition-metabolic-syndrome-criteria)

### 2. 疾病管理頁面 (`metabolic-syndrome-management.html`) 所需資源

#### ✅ Observation 資源
- **檔案**: `fhir-data/metabolic-syndrome-management.json`
- **需求項目**:
  - [x] 身高 (LOINC: 8302-2)
  - [x] 體重 (LOINC: 29463-7)
  - [x] 運動習慣 (LOINC: 68515-6)
  - [x] 抽菸習慣 (LOINC: 72166-2)

#### ✅ Condition 資源
- **檔案**: `fhir-data/metabolic-syndrome-management.json`
- **需求項目**:
  - [x] 糖尿病 (SNOMED: 73211009)
  - [x] 高血壓 (SNOMED: 38341003)

#### ✅ RiskAssessment 資源
- **檔案**: `fhir-data/metabolic-syndrome-management.json`
- **需求項目**:
  - [x] 冠心病風險評估 (SNOMED: 408512008)
  - [x] 風險等級 (qualitativeRisk)

#### ✅ ServiceRequest 資源 (運動處方)
- **檔案**: `fhir-data/exercise-diet-prescriptions.json`
- **需求項目**:
  - [x] 運動處方 (SNOMED: 229065009)
  - [x] 運動類型 (extension: tw-exercise-prescription)
  - [x] 運動時間 (duration)
  - [x] 運動頻率 (frequency)
  - [x] 處方說明 (note)

#### ✅ NutritionOrder 資源 (飲食處方)
- **檔案**: `fhir-data/exercise-diet-prescriptions.json`
- **需求項目**:
  - [x] 飲食處方 (SNOMED: 226529007)
  - [x] 熱量限制 (nutrient)
  - [x] 飲食調整 (extension: tw-diet-adjustments)
  - [x] 處方說明 (note)

#### ✅ CarePlan 資源
- **檔案**: `fhir-data/exercise-diet-prescriptions.json`
- **需求項目**:
  - [x] 照護計畫 (SNOMED: 698360004)
  - [x] 活動項目 (activity) - 連結運動和飲食處方

### 3. 血壓趨勢頁面 (`blood-pressure-trend.html`) 所需資源

#### ✅ Observation 資源 (多筆)
- **檔案**: `fhir-data/blood-pressure-trends.json`
- **需求項目**:
  - [x] 多筆血壓觀測資料 (至少 5 筆以上)
  - [x] 不同日期的血壓記錄
  - [x] 收縮壓 (LOINC: 8480-6)
  - [x] 舒張壓 (LOINC: 8462-4)
  - [x] 有效日期時間 (effectiveDateTime)

**檢查結果**: ✅ 包含 5 筆血壓記錄 (2023-08-17 至 2023-08-26)

### 4. 生理紀錄頁面 (`physiological-records.html`) 所需資源

#### ✅ Observation 資源 (多筆)
- **檔案**: `fhir-data/physiological-records.json`
- **需求項目**:
  - [x] 血壓 (LOINC: 85354-9)
  - [x] 脈搏 (LOINC: 8867-4)
  - [x] 血氧 (LOINC: 2708-6)
  - [x] 體溫 (LOINC: 8310-5)
  - [x] 多筆不同日期的記錄
  - [x] 按日期分組顯示

**檢查結果**: ✅ 包含 3 天的生理記錄 (2024-04-17, 2024-04-18, 2024-04-19)

## 📦 資源檔案對應表

| 頁面 | 所需資源 | 對應檔案 | 狀態 |
|------|---------|---------|------|
| 主頁面 | Patient | `metabolic-syndrome-patient.json` | ✅ |
| 主頁面 | Observation (檢驗數據) | `metabolic-syndrome-observations.json` | ✅ |
| 主頁面 | Condition (診斷) | `metabolic-syndrome-conditions.json` | ✅ |
| 疾病管理 | Observation (基本資料) | `metabolic-syndrome-management.json` | ✅ |
| 疾病管理 | Condition (伴隨疾病) | `metabolic-syndrome-management.json` | ✅ |
| 疾病管理 | RiskAssessment | `metabolic-syndrome-management.json` | ✅ |
| 疾病管理 | ServiceRequest | `exercise-diet-prescriptions.json` | ✅ |
| 疾病管理 | NutritionOrder | `exercise-diet-prescriptions.json` | ✅ |
| 疾病管理 | CarePlan | `exercise-diet-prescriptions.json` | ✅ |
| 血壓趨勢 | Observation (多筆血壓) | `blood-pressure-trends.json` | ✅ |
| 生理紀錄 | Observation (多筆生理) | `physiological-records.json` | ✅ |

## 🚀 匯入流程

### 方法一：使用 Postman 匯入

#### 步驟 1: 設定 Postman 環境

1. 開啟 Postman
2. 建立新的 Collection：`FHIR Data Import`
3. 設定環境變數：
   - `fhir_base_url`: `https://thas.mohw.gov.tw/v/r4/fhir`
   - `access_token`: (從授權流程取得)

#### 步驟 2: 匯入 Patient 資源

**請求設定**:
- **Method**: `POST`
- **URL**: `{{fhir_base_url}}/Patient`
- **Headers**:
  - `Content-Type`: `application/fhir+json`
  - `Authorization`: `Bearer {{access_token}}`
- **Body** (選擇 raw JSON):
  - 從 `fhir-data/metabolic-syndrome-patient.json` 複製內容

**預期回應**: `201 Created` 或 `200 OK`

#### 步驟 3: 匯入 Observation 資源 (Bundle)

**請求設定**:
- **Method**: `POST`
- **URL**: `{{fhir_base_url}}`
- **Headers**:
  - `Content-Type`: `application/fhir+json`
  - `Authorization`: `Bearer {{access_token}}`
- **Body** (選擇 raw JSON):
  - 從 `fhir-data/metabolic-syndrome-observations.json` 複製內容

**注意**: 這是 Bundle 資源，需要 POST 到根端點

#### 步驟 4: 匯入 Condition 資源 (Bundle)

**請求設定**:
- **Method**: `POST`
- **URL**: `{{fhir_base_url}}`
- **Headers**:
  - `Content-Type`: `application/fhir+json`
  - `Authorization`: `Bearer {{access_token}}`
- **Body** (選擇 raw JSON):
  - 從 `fhir-data/metabolic-syndrome-conditions.json` 複製內容

#### 步驟 5: 匯入疾病管理資料 (Bundle)

**請求設定**:
- **Method**: `POST`
- **URL**: `{{fhir_base_url}}`
- **Headers**:
  - `Content-Type`: `application/fhir+json`
  - `Authorization`: `Bearer {{access_token}}`
- **Body** (選擇 raw JSON):
  - 從 `fhir-data/metabolic-syndrome-management.json` 複製內容

#### 步驟 6: 匯入處方資料 (Bundle)

**請求設定**:
- **Method**: `POST`
- **URL**: `{{fhir_base_url}}`
- **Headers**:
  - `Content-Type`: `application/fhir+json`
  - `Authorization`: `Bearer {{access_token}}`
- **Body** (選擇 raw JSON):
  - 從 `fhir-data/exercise-diet-prescriptions.json` 複製內容

#### 步驟 7: 匯入血壓趨勢資料 (Bundle)

**請求設定**:
- **Method**: `POST`
- **URL**: `{{fhir_base_url}}`
- **Headers**:
  - `Content-Type`: `application/fhir+json`
  - `Authorization`: `Bearer {{access_token}}`
- **Body** (選擇 raw JSON):
  - 從 `fhir-data/blood-pressure-trends.json` 複製內容

#### 步驟 8: 匯入生理紀錄資料 (Bundle)

**請求設定**:
- **Method**: `POST`
- **URL**: `{{fhir_base_url}}`
- **Headers**:
  - `Content-Type`: `application/fhir+json`
  - `Authorization`: `Bearer {{access_token}}`
- **Body** (選擇 raw JSON):
  - 從 `fhir-data/physiological-records.json` 複製內容

### 方法二：使用 curl 命令匯入

#### 匯入 Patient

```bash
curl -X POST \
  "https://thas.mohw.gov.tw/v/r4/fhir/Patient" \
  -H "Content-Type: application/fhir+json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d @examples/fhir-data/metabolic-syndrome-patient.json
```

#### 匯入 Bundle 資源

```bash
# Observation Bundle
curl -X POST \
  "https://thas.mohw.gov.tw/v/r4/fhir" \
  -H "Content-Type: application/fhir+json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d @examples/fhir-data/metabolic-syndrome-observations.json

# Condition Bundle
curl -X POST \
  "https://thas.mohw.gov.tw/v/r4/fhir" \
  -H "Content-Type: application/fhir+json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d @examples/fhir-data/metabolic-syndrome-conditions.json

# Management Bundle
curl -X POST \
  "https://thas.mohw.gov.tw/v/r4/fhir" \
  -H "Content-Type: application/fhir+json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d @examples/fhir-data/metabolic-syndrome-management.json

# Prescriptions Bundle
curl -X POST \
  "https://thas.mohw.gov.tw/v/r4/fhir" \
  -H "Content-Type: application/fhir+json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d @examples/fhir-data/exercise-diet-prescriptions.json

# Blood Pressure Trends Bundle
curl -X POST \
  "https://thas.mohw.gov.tw/v/r4/fhir" \
  -H "Content-Type: application/fhir+json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d @examples/fhir-data/blood-pressure-trends.json

# Physiological Records Bundle
curl -X POST \
  "https://thas.mohw.gov.tw/v/r4/fhir" \
  -H "Content-Type: application/fhir+json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d @examples/fhir-data/physiological-records.json
```

### 方法三：使用完整 Bundle 匯入

如果 FHIR Server 支援 Transaction Bundle，可以使用 `metabolic-syndrome-complete.json`：

```bash
curl -X POST \
  "https://thas.mohw.gov.tw/v/r4/fhir" \
  -H "Content-Type: application/fhir+json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d @examples/fhir-data/metabolic-syndrome-complete.json
```

**注意**: 完整 Bundle 只包含 Patient、Observation 和 Condition，不包含其他頁面所需的資源。

## ✅ 匯入後驗證

### 1. 驗證 Patient 資源

```bash
curl -X GET \
  "https://thas.mohw.gov.tw/v/r4/fhir/Patient/metabolic-syndrome-001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. 驗證 Observation 資源

```bash
curl -X GET \
  "https://thas.mohw.gov.tw/v/r4/fhir/Observation?subject=Patient/metabolic-syndrome-001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. 驗證 Condition 資源

```bash
curl -X GET \
  "https://thas.mohw.gov.tw/v/r4/fhir/Condition?subject=Patient/metabolic-syndrome-001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. 驗證 ServiceRequest 資源

```bash
curl -X GET \
  "https://thas.mohw.gov.tw/v/r4/fhir/ServiceRequest?subject=Patient/metabolic-syndrome-001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. 驗證 NutritionOrder 資源

```bash
curl -X GET \
  "https://thas.mohw.gov.tw/v/r4/fhir/NutritionOrder?patient=Patient/metabolic-syndrome-001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🧪 測試應用程式

### 1. 取得 Launch URL

從 FHIR Server 或授權伺服器取得 Launch URL，格式通常為：
```
https://thas.mohw.gov.tw/v/r4/fhir/launch?iss=https://thas.mohw.gov.tw/v/r4/fhir&patient=metabolic-syndrome-001
```

### 2. 開啟應用程式

1. 開啟瀏覽器
2. 導航至 Launch URL
3. 完成授權流程
4. 應用程式會自動載入病人資料

### 3. 測試各頁面功能

#### 主頁面 (`metabolic-syndrome.html`)
- [ ] 病人資料區塊顯示正確
- [ ] 生理數據區塊顯示所有檢驗項目
- [ ] 臨床評估顯示代謝症候群診斷
- [ ] 匯出報告功能正常

#### 疾病管理頁面 (`metabolic-syndrome-management.html`)
- [ ] 基本資料標籤顯示身高、體重、運動、抽菸
- [ ] 伴隨疾病顯示糖尿病、高血壓
- [ ] 慢性病風險評估顯示
- [ ] 五大指標標籤顯示所有指標
- [ ] 處方管理標籤顯示運動和飲食處方

#### 血壓趨勢頁面 (`blood-pressure-trend.html`)
- [ ] 血壓趨勢圖顯示正確
- [ ] 血壓分布圖顯示正確
- [ ] 日/月/年視圖切換正常
- [ ] 排序功能正常

#### 生理紀錄頁面 (`physiological-records.html`)
- [ ] 聊天介面顯示所有生理記錄
- [ ] 按日期分組顯示正確
- [ ] 血壓、脈搏、血氧、體溫都顯示

## ⚠️ 重要注意事項

### POST 請求時 ID 的處理

**重要**: 使用 `POST` 方法創建資源時，FHIR Server 會自動分配新的 ID，而不是使用資源中提供的 `id` 欄位。

#### 解決方案

1. **使用 Conditional Create（推薦）**:
   - 在 `request.url` 中使用 identifier 查詢參數
   - 例如：`"url": "Patient?identifier=http://www.mohw.gov.tw/patient-id|U121745652"`
   - 如果資源已存在（根據 identifier 匹配），會更新；如果不存在，會創建

2. **移除資源中的 `id` 欄位**:
   - POST 請求時，不應在資源中包含 `id` 欄位
   - 讓系統自動分配 ID

3. **處理引用問題**:
   - 其他資源中的 `subject.reference` 使用 `Patient/metabolic-syndrome-001` 時
   - 如果 Patient ID 變更，這些引用會失效
   - **建議**: 使用 identifier 進行匹配，或先 POST Patient 獲取新 ID，然後更新所有引用

#### 已更新的檔案

- `metabolic-syndrome-patient.json`: 已移除 `id` 欄位
- `metabolic-syndrome-complete.json`: 已更新為使用 conditional create

### 其他注意事項

1. **授權 Token**: 此 FHIR Server 不需要 Token（根據您的設定）
2. **Bundle 類型**: 使用 `type: "transaction"` 的 Bundle 進行批量匯入
3. **Request 欄位**: Transaction Bundle 的每個 entry 都必須包含 `request` 欄位
4. **參考完整性**: 確保 Observation 和 Condition 中的 `reference` 欄位指向正確的資源
5. **日期格式**: 所有日期時間都使用 ISO 8601 格式
6. **LOINC 代碼**: 確保所有 Observation 使用正確的 LOINC 代碼
7. **SNOMED 代碼**: 確保所有 Condition 使用正確的 SNOMED 代碼

## 🔗 相關資源

- [FHIR R4 規範](https://www.hl7.org/fhir/)
- [SMART on FHIR 文件](http://docs.smarthealthit.org/)
- [LOINC 代碼查詢](https://loinc.org/)
- [SNOMED CT 代碼查詢](https://www.snomed.org/)

## 📝 匯入順序建議

為了確保資源之間的參考關係正確，建議按以下順序匯入：

1. **Patient** - 必須最先匯入
2. **Observation** (基本檢驗數據)
3. **Condition** (診斷)
4. **Observation** (管理資料：身高、體重等)
5. **Condition** (伴隨疾病)
6. **RiskAssessment** (風險評估)
7. **ServiceRequest** (運動處方)
8. **NutritionOrder** (飲食處方)
9. **CarePlan** (照護計畫)
10. **Observation** (血壓趨勢)
11. **Observation** (生理紀錄)

## 🎯 快速檢查清單

匯入完成後，請確認：

- [ ] Patient 資源已成功匯入
- [ ] 所有 Observation 資源已匯入 (至少 20+ 筆)
- [ ] 所有 Condition 資源已匯入
- [ ] ServiceRequest 和 NutritionOrder 已匯入
- [ ] CarePlan 已匯入
- [ ] 所有資源的 `subject` 欄位都指向正確的 Patient ID
- [ ] 可以透過 API 查詢到所有資源
- [ ] 應用程式可以正常載入和顯示資料
