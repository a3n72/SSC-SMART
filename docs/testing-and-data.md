# 測試與資料準備

## 第二階段測試前確認

1. `examples/app-config.js` 已填入真實 `client_id`
2. 若測試方要求 confidential client，已填入 `client_secret`
3. 已確認對方要求的 token auth method
4. Redirect URI 與對方註冊值完全一致
5. 部署站已允許私人 launcher / FHIR server 的 CSP 與 CORS

若不想把測試憑證放入版本控制，請優先使用 `examples/app-config.local.js`。

## 啟動本地測試

```bash
npm install
npm test
python -m http.server 8000
```

開啟：

```text
http://localhost:8000/examples/launch.html
```

## 測試資料

測試用 FHIR JSON 與 Bundle 仍放在：

- `examples/fhir-data/`
- `examples/twcore-case-888.json`
- `examples/fhir-data/stage2-test-bundle.json`

若要交付測試資料給外部單位，建議直接從這些檔案整理 ZIP，而不是再維護另一套文件版副本。

## 驗證重點

- 授權完成後可取得 `patient`
- `index.html`、`metabolic-syndrome.html`、`blood-pressure-trend.html` 可直接處理 redirect callback
- Observation / Condition 讀取正常
- 匯出功能可在授權完成後運作
