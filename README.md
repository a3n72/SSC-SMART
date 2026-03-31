# SSC-SMART

長照情境用的 SMART on FHIR SDK 與前端範例，已補齊私人 launcher 相容性，支援：

- EHR Launch
- Standalone Launch
- 私人 launcher 直接打 Redirect URI
- `client_id` / `client_secret` / token auth method 設定
- FHIR Observation / CarePlan / Goal 讀寫

## 快速開始

```bash
npm install
npm test
python -m http.server 8000
```

開啟：

```text
http://localhost:8000/examples/launch.html
```

## 重要檔案

- `examples/app-config.js`: 部署預設 SMART 設定
- `examples/launch.html`: 手動啟動與除錯入口
- `examples/index.html`: 主程式頁
- `examples/metabolic-syndrome.html`: 主要測試頁
- `src/smart-auth.js`: 瀏覽器共用授權模組

## 文件

- `docs/README.md`
- `docs/smart-launch.md`
- `docs/project-structure.md`
- `docs/testing-and-data.md`
- `docs/cds-hooks.md`

## 開發腳本

```bash
npm test
npm run example
npm run cds-hooks-server
```

## 注意

- 若外部測試單位改用私人 launcher，請同步更新部署站的 CSP / CORS
- 若需要 Backend Service 測試，仍需另外補 JWKS 與 server-to-server 實作
