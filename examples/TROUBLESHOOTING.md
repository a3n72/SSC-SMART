# 疑難排解指南

## 常見問題與解決方案

### 1. 授權頁面沒有轉跳到衛福部畫面

**症狀：** 點擊「開始授權」後，沒有自動跳轉到 THAS 登入頁面

**可能原因：**
- Client ID 設定錯誤（使用了 "my-client-id" 而不是真實的 Client ID）
- Redirect URI 與 THAS 註冊時設定不一致
- 瀏覽器阻擋了自動跳轉
- 網路連線問題

**解決方案：**
1. **檢查 Client ID**
   - 確認使用的是在 THAS 沙盒環境中註冊的真實 Client ID
   - 不能使用預設的 "my-client-id"

2. **檢查 Redirect URI**
   - 在 THAS 註冊應用程式時設定的 Redirect URI 必須與 `launch.html` 中設定的完全一致
   - 包括協議（http/https）、域名、路徑、端口號
   - 例如：`http://localhost:8080/examples/index.html`

3. **檢查瀏覽器控制台**
   - 按 F12 開啟開發者工具
   - 查看 Console 標籤是否有錯誤訊息
   - 查看 Network 標籤確認是否有網路請求

4. **手動檢查授權 URL**
   - 在控制台查看「授權參數」的輸出
   - 確認 ISS URL、Client ID、Scope、Redirect URI 都正確

### 2. 頁面顯示但沒有病人資料

**症狀：** `index.html` 頁面有顯示，但沒有載入任何病人資料

**可能原因：**
- 授權流程未完成（沒有選擇病人或沒有點擊 Approve）
- 授權 token 已過期
- FHIR Client 初始化失敗
- 網路連線問題

**解決方案：**
1. **確認授權流程完整**
   - 從 `launch.html` 開始
   - 完成登入（Practitioner Login）
   - 選擇病人（Select Patient）
   - 同意授權（點擊 Approve）

2. **檢查 URL 參數**
   - 授權完成後，`index.html` 的 URL 應該包含 `code` 和 `state` 參數
   - 例如：`http://localhost:8080/examples/index.html?code=xxx&state=xxx`

3. **檢查瀏覽器控制台**
   - 查看是否有錯誤訊息
   - 查看「FHIR Client 初始化成功」的訊息
   - 查看「病人資料載入成功」的訊息

4. **重新授權**
   - 點擊「登出」按鈕
   - 重新從 `launch.html` 開始完整流程

### 3. "Failed to resolve module specifier 'fhirclient'" 錯誤

**症狀：** 瀏覽器控制台顯示模組解析錯誤

**原因：** 嘗試使用 ES6 模組語法載入 fhirclient，但瀏覽器無法解析

**解決方案：**
1. **清除瀏覽器快取**
   - 按 `Ctrl+Shift+Delete` 清除快取
   - 或按 `Ctrl+F5` 強制重新載入

2. **確認使用 CDN 載入**
   - `launch.html` 和 `index.html` 都應該使用：
   ```html
   <script src="https://cdn.jsdelivr.net/npm/fhirclient@2.6.3/build/fhir-client.min.js"></script>
   ```
   - 不應該使用 `import` 語法

### 4. "showSection is not defined" 錯誤

**症狀：** 點擊按鈕時出現函數未定義錯誤

**解決方案：**
1. **清除瀏覽器快取**（同上）
2. **確認函數已定義**
   - 檢查 `index.html` 中是否有 `window.showSection` 的定義
   - 確認 script 標籤已正確載入

### 5. 授權流程卡在某個步驟

**症狀：** 授權流程在某個步驟停止，沒有繼續

**解決方案：**
1. **檢查網路連線**
   - 確認能正常連接到 `thas.mohw.gov.tw`

2. **檢查瀏覽器設定**
   - 確認沒有阻擋彈出視窗
   - 確認沒有安裝會干擾的擴充功能

3. **使用不同瀏覽器測試**
   - 嘗試使用 Chrome、Firefox、Edge 等不同瀏覽器

4. **檢查 THAS 沙盒環境狀態**
   - 確認 THAS 沙盒環境正常運作
   - 檢查是否有維護公告

## 除錯步驟

### 步驟 1: 檢查基本設定

1. 確認 ISS Server URL 正確（從 THAS SAND-BOX 對話框取得）
2. 確認 Client ID 正確（在 THAS 註冊的真實 ID）
3. 確認 Redirect URI 與註冊時設定一致
4. 確認 Scope 權限設定正確

### 步驟 2: 檢查授權流程

1. 開啟 `launch.html`
2. 點擊「開始授權」
3. 確認瀏覽器自動跳轉到 THAS 登入頁面
4. 完成登入、選擇病人、同意授權
5. 確認自動返回 `index.html`

### 步驟 3: 檢查資料載入

1. 開啟瀏覽器開發者工具（F12）
2. 查看 Console 標籤的訊息
3. 確認看到「FHIR Client 初始化成功」
4. 確認看到「病人資料載入成功」
5. 如果失敗，查看錯誤訊息並參考上述解決方案

### 步驟 4: 檢查網路請求

1. 在開發者工具中開啟 Network 標籤
2. 重新載入頁面
3. 查看是否有失敗的請求（紅色）
4. 檢查請求的 URL 和回應內容

## 取得幫助

如果以上方法都無法解決問題：

1. **收集錯誤資訊**
   - 截圖瀏覽器控制台的錯誤訊息
   - 記錄完整的錯誤堆疊
   - 記錄 URL 參數

2. **檢查 THAS 文件**
   - 查看 THAS 沙盒環境的官方文件
   - 確認是否有更新或變更

3. **聯繫支援**
   - 聯繫 THAS 技術支援
   - 提供詳細的錯誤資訊和操作步驟
