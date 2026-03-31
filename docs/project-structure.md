# 專案結構

## 主要目錄

```text
src/        SDK 與 SMART/OAuth 共用邏輯
examples/   可直接執行的範例頁、示範腳本與測試資料
tests/      Jest 測試
docs/       正式文件
```

## 核心模組

- `src/auth.js`: `fhirclient` 封裝，提供 EHR / Standalone Launch
- `src/client.js`: FHIR API 高階操作
- `src/mapper.js`: 888 議題資料轉 FHIR Observation
- `src/cds-hooks.js`: CDS Hooks 服務與提醒卡片
- `src/smart-auth.js`: 瀏覽器授權共用工具，負責 PKCE、context storage、token 交換與 launcher 相容性

## 維護原則

- `examples/` 只放會執行的東西，不再放主文件
- `docs/` 只保留現在仍應遵循的說明
- 歷史修補紀錄、舊測試筆記集中放到 `docs/archive/`
- 新增頁面若需要 SMART token 交換，優先重用 `src/smart-auth.js`
