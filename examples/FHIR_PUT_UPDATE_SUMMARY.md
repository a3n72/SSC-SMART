# FHIR Bundle 更新為 PUT 方法摘要

## 📋 更新原因

由於使用 `POST` 方法時，FHIR Server 會自動分配新的 ID，導致資源之間的引用失效（例如 Condition 中的 `evidence.detail` 引用找不到 Observation）。

## ✅ 已完成的更新

### 所有 Bundle 檔案已更新為使用 PUT 方法

1. **`metabolic-syndrome-observations.json`**
   - 11 個 Observation entry
   - 所有 `request.method` 改為 `PUT`
   - 所有 `request.url` 更新為包含 ID（例如：`Observation/bp-001`）

2. **`metabolic-syndrome-conditions.json`**
   - 1 個 Condition entry
   - 已添加 `id` 欄位：`metabolic-syndrome-diagnosis`
   - `request.method` 改為 `PUT`
   - `request.url` 更新為：`Condition/metabolic-syndrome-diagnosis`

3. **`metabolic-syndrome-management.json`**
   - 7 個 entry（4 個 Observation, 2 個 Condition, 1 個 RiskAssessment）
   - 所有 entry 都添加了 `request` 欄位
   - 所有 `request.method` 改為 `PUT`
   - 所有 `request.url` 更新為包含 ID

4. **`exercise-diet-prescriptions.json`**
   - 3 個 entry（ServiceRequest, NutritionOrder, CarePlan）
   - 所有 `request.method` 改為 `PUT`
   - 所有 `request.url` 更新為包含 ID

5. **`blood-pressure-trends.json`**
   - 5 個 Observation entry
   - 所有 `request.method` 改為 `PUT`
   - 所有 `request.url` 更新為包含 ID

6. **`physiological-records.json`**
   - 12 個 Observation entry
   - 所有 entry 都添加了 `request` 欄位
   - 所有 `request.method` 改為 `PUT`
   - 所有 `request.url` 更新為包含 ID

7. **`metabolic-syndrome-complete.json`**
   - 5 個 entry（1 個 Patient, 3 個 Observation, 1 個 Condition）
   - Patient 使用實際 ID：`701084`
   - 所有 `request.method` 改為 `PUT`
   - 所有 `request.url` 更新為包含 ID

## 📊 更新統計

- **總共更新**: 44 個 request.method（從 POST 改為 PUT）
- **總共更新**: 44 個 request.url（添加資源 ID）
- **添加 request 欄位**: 約 20+ 個 entry

## 🔄 PUT vs POST 的差異

### POST（之前）
```json
{
  "request": {
    "method": "POST",
    "url": "Observation"
  },
  "resource": {
    "resourceType": "Observation",
    "id": "bp-001",  // 會被忽略
    ...
  }
}
```
- ❌ 系統會自動分配新 ID
- ❌ 資源中的 `id` 欄位會被忽略
- ❌ 引用會失效

### PUT（現在）
```json
{
  "request": {
    "method": "PUT",
    "url": "Observation/bp-001"  // 包含 ID
  },
  "resource": {
    "resourceType": "Observation",
    "id": "bp-001",  // 必須包含
    ...
  }
}
```
- ✅ 使用指定的 ID
- ✅ 資源中的 `id` 欄位必須與 URL 中的 ID 一致
- ✅ 引用可以正常工作

## ✅ 驗證清單

匯入前確認：

- [x] 所有 Bundle 的 `type` 為 `"transaction"`
- [x] 所有 entry 都有 `request` 欄位
- [x] 所有 `request.method` 為 `"PUT"`
- [x] 所有 `request.url` 包含資源類型和 ID（例如：`Observation/bp-001`）
- [x] 所有資源都有 `id` 欄位
- [x] 所有資源的 `id` 與 `request.url` 中的 ID 一致
- [x] 所有 Patient 引用都更新為 `Patient/701084`

## 🚀 匯入順序

現在可以按以下順序匯入（使用 PUT，順序不再重要，但建議按此順序）：

1. ✅ Patient（已匯入，ID: `701084`）
2. ⏳ Observation Bundle（`metabolic-syndrome-observations.json`）
3. ⏳ Condition Bundle（`metabolic-syndrome-conditions.json`）
4. ⏳ Management Bundle（`metabolic-syndrome-management.json`）
5. ⏳ Prescriptions Bundle（`exercise-diet-prescriptions.json`）
6. ⏳ Blood Pressure Trends Bundle（`blood-pressure-trends.json`）
7. ⏳ Physiological Records Bundle（`physiological-records.json`）

## 📝 注意事項

1. **PUT 會覆蓋現有資源**：如果資源已存在，PUT 會更新它；如果不存在，會創建它
2. **ID 必須一致**：`request.url` 中的 ID 必須與資源中的 `id` 欄位一致
3. **引用關係**：現在所有引用（如 Condition 中的 `evidence.detail`）應該可以正常工作，因為 Observation ID 不會改變

## 🎯 預期結果

匯入後，所有資源應該：
- ✅ 使用指定的 ID（不會被系統重新分配）
- ✅ 引用關係正確（Condition 可以找到 Observation）
- ✅ 可以正常查詢和顯示
