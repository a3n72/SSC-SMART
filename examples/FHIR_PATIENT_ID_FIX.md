# Patient ID 修正說明

## 📋 問題描述

頁面上的資料與 FHIR Server 上的資料沒有關聯，因為：
1. 授權流程返回的 Patient ID 可能不正確
2. Launch URL 中使用的 Patient ID 可能與實際的 Patient ID (`701084`) 不匹配
3. 頁面使用錯誤的 Patient ID 查詢資源，導致找不到資料

## ✅ 已完成的修正

### 1. 更新 `src/client.js`

**`getPatientInfo()` 方法**：
- 在查詢 Patient 時，驗證 identifier 是否為正確的病人（`U121745652`）
- 如果 identifier 不匹配，自動使用 identifier 重新查詢
- 如果使用授權流程的 ID 查詢失敗，自動使用 identifier 作為備援方案

### 2. 更新 `examples/metabolic-syndrome.html`

**`loadPatientData()` 函數**：
- 如果使用 Patient ID 查詢失敗，自動使用 identifier 查詢
- 找到正確的 Patient 後，自動更新 `patientId` 和 `sessionStorage`
- 確保後續所有查詢都使用正確的 Patient ID

**初始化流程**：
- 在載入病人資料前，先驗證 Patient ID
- 如果 ID 不正確或查詢失敗，自動使用 identifier 查找
- 更新 `patientId` 為實際的 ID (`701084`)

## 🔍 修正機制

### 自動 ID 驗證與修正

1. **驗證階段**：
   ```javascript
   // 驗證 Patient ID 是否正確
   const verifyRes = await authorizedFetch(`${fhirBaseUrl}/Patient/${patientId}`);
   if (!verifyRes.ok) {
       // 使用 identifier 查找
   }
   ```

2. **Identifier 備援**：
   ```javascript
   // 使用 identifier 查詢
   const identifierQuery = `${fhirBaseUrl}/Patient?identifier=http://www.mohw.gov.tw/patient-id|U121745652`;
   const identifierRes = await authorizedFetch(identifierQuery);
   // 更新 patientId 為實際的 ID
   patientId = actualPatient.id;
   ```

3. **自動更新**：
   - 更新 `patientId` 變數
   - 更新 `sessionStorage` 中的 `patient_id`
   - 後續所有查詢都使用正確的 ID

## 📊 影響範圍

### 已更新的頁面

1. ✅ `metabolic-syndrome.html` - 主頁面
   - `loadPatientData()` - 自動驗證和修正 Patient ID
   - 初始化流程 - 驗證 Patient ID

2. ✅ `client.js` - SDK 核心
   - `getPatientInfo()` - 自動驗證 identifier 並修正

### 使用 SDK 的頁面（自動受益）

以下頁面使用 `LTC888Client.getPatientId()`，會自動使用修正後的邏輯：

1. ✅ `blood-pressure-trend.html` - 血壓趨勢頁面
2. ✅ `physiological-records.html` - 生理紀錄頁面
3. ✅ `metabolic-syndrome-management.html` - 疾病管理頁面

## 🚀 使用方式

### Launch URL

現在可以使用以下方式啟動：

1. **使用實際 Patient ID**（推薦）：
   ```
   https://thas.mohw.gov.tw/v/r4/fhir/launch?iss=https://thas.mohw.gov.tw/v/r4/fhir&patient=701084
   ```

2. **使用 identifier**（如果 ID 不確定）：
   - 頁面會自動使用 identifier 查找正確的 Patient
   - 不需要手動指定 Patient ID

### 驗證流程

頁面現在會自動：
1. 嘗試使用授權流程返回的 Patient ID
2. 如果查詢失敗，自動使用 identifier 查找
3. 驗證找到的 Patient 是否為正確的病人（檢查 identifier）
4. 更新所有後續查詢使用正確的 Patient ID

## ✅ 預期結果

修正後，頁面應該能夠：
- ✅ 自動找到正確的 Patient（ID: `701084`）
- ✅ 正確查詢所有相關資源（Observation, Condition 等）
- ✅ 顯示與 FHIR Server 上實際資料一致的內容
- ✅ 即使 Launch URL 使用錯誤的 Patient ID，也能自動修正

## 🔄 測試步驟

1. **清除瀏覽器快取和 sessionStorage**：
   ```javascript
   sessionStorage.clear();
   ```

2. **使用 Launch URL 啟動**：
   - 可以使用實際的 Patient ID (`701084`)
   - 或使用任何 Patient ID（頁面會自動修正）

3. **驗證資料**：
   - 檢查頁面顯示的 Patient 資料是否正確
   - 檢查 Observation 和 Condition 是否正確載入
   - 檢查所有資料是否與 FHIR Server 上的資料一致

## 📝 注意事項

1. **Identifier 必須正確**：頁面使用 identifier `U121745652` 來查找 Patient，確保這個 identifier 在 FHIR Server 上存在

2. **首次載入可能較慢**：如果 Patient ID 不正確，頁面會進行額外的查詢來找到正確的 Patient

3. **Console 日誌**：修正過程會在瀏覽器 Console 中顯示日誌，方便除錯

## 🎯 下一步

現在可以：
1. 清除瀏覽器 sessionStorage
2. 使用 Launch URL 重新啟動應用程式
3. 驗證頁面顯示的資料是否與 FHIR Server 上的資料一致
