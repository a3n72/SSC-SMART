# FHIR 資料匯入快速參考

## 🚀 快速開始

### 使用 Postman (推薦)

1. **匯入 Collection**
   - 開啟 Postman
   - 點擊 `Import` → 選擇 `FHIR_Import.postman_collection.json`
   - 設定環境變數：
     - `fhir_base_url`: `https://thas.mohw.gov.tw/v/r4/fhir`
     - `access_token`: (從授權流程取得)

2. **執行匯入順序**
   - 1. Import Patient
   - 2. Import Observations (Basic)
   - 3. Import Conditions
   - 4. Import Management Data
   - 5. Import Prescriptions
   - 6. Import Blood Pressure Trends
   - 7. Import Physiological Records

3. **驗證匯入結果**
   - Verify - Get Patient
   - Verify - Get Observations
   - Verify - Get Conditions
   - Verify - Get ServiceRequests
   - Verify - Get NutritionOrders

### 使用 curl (命令列)

```bash
# 設定變數
FHIR_URL="https://thas.mohw.gov.tw/v/r4/fhir"
TOKEN="YOUR_ACCESS_TOKEN"

# 匯入順序
curl -X POST "$FHIR_URL/Patient" \
  -H "Content-Type: application/fhir+json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @fhir-data/metabolic-syndrome-patient.json

curl -X POST "$FHIR_URL" \
  -H "Content-Type: application/fhir+json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @fhir-data/metabolic-syndrome-observations.json

curl -X POST "$FHIR_URL" \
  -H "Content-Type: application/fhir+json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @fhir-data/metabolic-syndrome-conditions.json

curl -X POST "$FHIR_URL" \
  -H "Content-Type: application/fhir+json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @fhir-data/metabolic-syndrome-management.json

curl -X POST "$FHIR_URL" \
  -H "Content-Type: application/fhir+json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @fhir-data/exercise-diet-prescriptions.json

curl -X POST "$FHIR_URL" \
  -H "Content-Type: application/fhir+json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @fhir-data/blood-pressure-trends.json

curl -X POST "$FHIR_URL" \
  -H "Content-Type: application/fhir+json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @fhir-data/physiological-records.json
```

## 📋 資源檔案對應

| 檔案 | 資源類型 | 用途 |
|------|---------|------|
| `metabolic-syndrome-patient.json` | Patient | 主頁面 - 病人資料 |
| `metabolic-syndrome-observations.json` | Observation Bundle | 主頁面 - 檢驗數據 |
| `metabolic-syndrome-conditions.json` | Condition Bundle | 主頁面 - 診斷 |
| `metabolic-syndrome-management.json` | Bundle | 疾病管理頁面 |
| `exercise-diet-prescriptions.json` | Bundle | 疾病管理頁面 - 處方 |
| `blood-pressure-trends.json` | Observation Bundle | 血壓趨勢頁面 |
| `physiological-records.json` | Observation Bundle | 生理紀錄頁面 |

## ⚠️ 重要：POST 請求時 ID 的處理

**重要**: 使用 `POST` 方法時，FHIR Server 會自動分配新的 ID，而不是使用資源中的 `id`。

### 解決方案

1. **已更新的檔案**:
   - `metabolic-syndrome-patient.json`: 已移除 `id` 欄位
   - `metabolic-syndrome-complete.json`: 使用 conditional create（identifier 匹配）

2. **查詢 Patient**:
   - 使用 identifier 查詢：`Patient?identifier=http://www.mohw.gov.tw/patient-id|U121745652`
   - 不要使用固定的 ID（因為系統會分配新 ID）

3. **Launch URL**:
   - 匯入後，從 Patient 資源的回應中獲取實際的 ID
   - 或使用 identifier 查詢來找到 Patient

## ✅ 檢查清單

匯入後確認：

- [ ] Patient 已成功創建（使用 identifier 查詢確認）
- [ ] 所有 Observation 的 `subject` 指向正確的 Patient
- [ ] 所有 Condition 的 `subject` 指向正確的 Patient
- [ ] 可以查詢到所有資源
- [ ] 應用程式可以正常顯示資料

## 🔗 Launch URL 格式

匯入後，從 Patient 資源的回應中獲取實際 ID，或使用 identifier：

```
# 使用 identifier 查詢 Patient
GET https://thas.mohw.gov.tw/v/r4/fhir/Patient?identifier=http://www.mohw.gov.tw/patient-id|U121745652

# 然後使用實際的 Patient ID
https://thas.mohw.gov.tw/v/r4/fhir/launch?iss=https://thas.mohw.gov.tw/v/r4/fhir&patient=<實際的PatientID>
```

## 📚 詳細文件

完整說明請參考：`FHIR_DATA_IMPORT_GUIDE.md`
