# Patient ID 更新說明

## 📋 更新摘要

由於使用 `POST` 方法時，FHIR Server 會自動分配新的 Patient ID（`701084`），而不是使用原本的 `metabolic-syndrome-001`，因此已更新所有資源中的 Patient 引用。

## ✅ 已更新的檔案

所有以下檔案中的 `Patient/metabolic-syndrome-001` 引用都已更新為 `Patient/701084`：

1. ✅ `metabolic-syndrome-observations.json` - 11 個引用
2. ✅ `metabolic-syndrome-conditions.json` - 1 個引用
3. ✅ `metabolic-syndrome-management.json` - 7 個引用
4. ✅ `exercise-diet-prescriptions.json` - 4 個引用
5. ✅ `blood-pressure-trends.json` - 5 個引用
6. ✅ `physiological-records.json` - 12 個引用
7. ✅ `metabolic-syndrome-complete.json` - 5 個引用 + 1 個 fullUrl

## 📊 更新統計

- **總共更新**: 46 個引用
- **Patient ID**: `metabolic-syndrome-001` → `701084`
- **Identifier**: `U121745652` (保持不變，用於查詢)

## 🔍 驗證方法

### 查詢 Patient

```bash
# 使用 identifier 查詢（推薦）
GET https://thas.mohw.gov.tw/v/r4/fhir/Patient?identifier=http://www.mohw.gov.tw/patient-id|U121745652

# 或使用實際 ID
GET https://thas.mohw.gov.tw/v/r4/fhir/Patient/701084
```

### 驗證引用

```bash
# 查詢所有 Observation
GET https://thas.mohw.gov.tw/v/r4/fhir/Observation?subject=Patient/701084

# 查詢所有 Condition
GET https://thas.mohw.gov.tw/v/r4/fhir/Condition?subject=Patient/701084

# 查詢所有 ServiceRequest
GET https://thas.mohw.gov.tw/v/r4/fhir/ServiceRequest?subject=Patient/701084
```

## 🚀 下一步

現在可以匯入所有更新後的 Bundle 資源：

1. ✅ Patient 已成功創建（ID: `701084`）
2. ⏳ 匯入 Observation Bundle
3. ⏳ 匯入 Condition Bundle
4. ⏳ 匯入 Management Bundle
5. ⏳ 匯入 Prescriptions Bundle
6. ⏳ 匯入 Blood Pressure Trends Bundle
7. ⏳ 匯入 Physiological Records Bundle

## 📝 注意事項

1. **Launch URL**: 使用實際的 Patient ID
   ```
   https://thas.mohw.gov.tw/v/r4/fhir/launch?iss=https://thas.mohw.gov.tw/v/r4/fhir&patient=701084
   ```

2. **應用程式查詢**: 應用程式應該使用 identifier 來查詢 Patient，而不是固定的 ID

3. **未來匯入**: 如果重新匯入，Patient ID 可能會再次變更，需要重新更新所有引用

## 🔄 自動化建議

如果需要經常匯入，建議：

1. 先 POST Patient，獲取實際 ID
2. 使用腳本自動更新所有資源中的引用
3. 再 POST 其他 Bundle

或使用 Transaction Bundle 的 `fullUrl` 機制，讓系統自動處理引用關係。
