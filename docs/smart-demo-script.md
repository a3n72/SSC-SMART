# 課堂演示腳本：SMART on FHIR 授權流程

用途：SMART on FHIR 課程的現場演示。
演示頁：`examples/smart-flow-demo.html`，把授權流程拆成六步，另有步驟 7 示範沒有授權時的狀況，每按一次按鈕顯示 App 實際送出與收到的內容。
授權環境：SMART Health IT 公開 Launcher（https://launch.smarthealthit.org ），免註冊，全部是模擬病人資料。

線上版：https://a3n72.github.io/SSC-SMART/examples/smart-flow-demo.html 。從 THAS 沙盒連入 `examples/launch.html` 時，畫面會先讓你選「範例演示」或「原本的流程」。

## 上課前（5 分鐘）

1. 在專案目錄執行：

   ```bash
   npm run demo
   ```

   不需要先 `npm install`。看到「演示頁：http://localhost:8000/examples/smart-flow-demo.html」即可。
2. 用瀏覽器開啟上面的網址，按一次「重新開始」。
3. 先自己走完一次流程，確認教室網路連得到 `launch.smarthealthit.org`。
4. 瀏覽器縮放調到 125%–150%，後排才看得清楚。

## 演示一：Standalone Launch（約 12 分鐘）

情境：使用者直接打開 App，App 自己去找授權伺服器。

| 步驟 | 操作 | 講解重點 |
|---|---|---|
| 0 | 看設定區 | App 事先只知道三件事：FHIR Server 網址（iss）、自己的 client_id、要的 scope |
| 1 | 按「執行」 | App 從 `.well-known/smart-configuration` 問到授權端點與 token 端點；capabilities 列出伺服器支援的啟動方式 |
| 2 | 按「執行」 | code_verifier 留在 App；code_challenge 是它的雜湊。公開 client 沒有 secret，靠 PKCE 證明「換 token 的人就是發起授權的人」 |
| 3 | 按「組出授權網址」，逐列看參數，再按「前往授權伺服器」 | 這是一次瀏覽器導向，不是 API 呼叫；aud 指定要存取的 FHIR Server |
| － | 在 Launcher 頁面選一位醫師、輸入任意密碼登入，選一位病人，按 Approve | 這三個畫面都是授權伺服器的，App 看不到帳號密碼；選病人就是 launch/patient 這個 scope 的效果 |
| 4 | 自動回到演示頁 | 網址列帶著 code 與 state；state 與步驟 2 相同才繼續 |
| 5 | 按「執行」 | POST 到 token 端點，送 code 與 code_verifier；回應有 access_token、patient（context）、scope、id_token |
| 6 | 依序按「讀取病人」「查生命徵象」「查診斷」 | 就是第 4 堂的 FHIR API，多一個 `Authorization: Bearer` 標頭；病人 ID 來自 token 回應，不是使用者輸入 |
| 7 | 依序按「不帶 token 讀病人」「帶自編的 token」「用自編的 code 換 token」 | 沙盒不帶 token 回 200，正式環境會回 401；自編的 token 回 401；自編的 code 換不到 token。沒有授權時，App 唯一的路是回到步驟 2、3 |

## 演示二：EHR Launch（約 6 分鐘）

情境：醫師已經在 EHR 裡開著某位病人的病歷，從 EHR 點開 App。

1. 開啟 https://launch.smarthealthit.org 。
2. Launch Type 選「Provider EHR Launch」，Patient 與 Provider 各選一位。
3. 取消勾選「Simulate launch within the EHR UI」（讓 App 以整頁顯示）。
4. App's Launch URL 填 `http://localhost:8000/examples/smart-flow-demo.html`，按「Launch」。
5. 演示頁右上角變成「EHR Launch」，iss 與 launch 已自動帶入，scope 變成 `launch openid fhirUser patient/*.read`。
6. 照樣按步驟 1 到 6。

講解重點：

- 步驟 3 的授權網址多了 `launch` 參數，這是 EHR 給的代碼，代表「現在是哪位醫師在看哪位病人」。
- 因為 EHR 已經知道使用者與病人，這次不會出現登入與選病人畫面。
- 步驟 5 的回應多了 `encounter`。

## 已知行為與備案

- 公開 Launcher 與 THAS 沙盒的 FHIR Server 不帶 token 也會回 200（開放的教學環境）。步驟 7 的第一顆按鈕會照實顯示 200 並說明正式環境會回 401；要看到被拒絕，按第二、三顆。
- code 只能用一次。步驟 5 成功後頁面會把網址上的 code 拿掉；若步驟 5 失敗，按「重新開始」重走即可。
- 若教室網路連不到 Launcher，改用投影片的流程圖講解。
- 連接埠被占用時：`set PORT=8080 && npm run demo`（PowerShell 用 `$env:PORT=8080; npm run demo`），Launch URL 的連接埠也要跟著改。

## 與專案其他頁面的關係

- 演示頁重用 `src/smart-auth.js` 的 PKCE、discovery、授權網址與 token 請求函式，沒有另寫一套。
- 演示頁使用公開 client（沒有 client_secret），不讀取 `examples/app-config.js` 的設定，也不影響 THAS 沙盒的測試流程。
