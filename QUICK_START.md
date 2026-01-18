# 快速啟動指南

## 🚀 Provider Standalone Launch 快速啟動

### 步驟 1: 準備環境

確保已安裝 Node.js >= 18.0.0：
```bash
node --version
```

### 步驟 2: 安裝依賴

```bash
npm install
```

### 步驟 3: 取得 THAS 沙盒環境資訊

1. 前往 THAS 沙盒環境
2. 開啟 **SAND-BOX** 對話框
3. 選擇 **Provider Standalone Launch**
4. 複製 **ISS server URL** 和 **Patient Viewer URL**

### 步驟 4: 啟動範例頁面

#### 方法 A: 使用 Python（推薦）

```bash
# Python 3
python -m http.server 8000

# 或 Python 2
python -m SimpleHTTPServer 8000
```

#### 方法 B: 使用 Node.js http-server

```bash
npx http-server -p 8000
```

#### 方法 C: 使用 VS Code Live Server

1. 安裝 VS Code 的 "Live Server" 擴充功能
2. 右鍵點擊 `examples/standalone-launch-thas.html`
3. 選擇 "Open with Live Server"

### 步驟 5: 開啟瀏覽器

在瀏覽器中開啟：
```
http://localhost:8000/examples/standalone-launch-thas.html
```

### 步驟 6: 設定並啟動

1. 在頁面中輸入從 SAND-BOX 取得的 **ISS Server URL**
2. 輸入您的 **Client ID**（需先在 THAS 註冊）
3. 確認 **Redirect URI**（預設為當前頁面 URL）
4. 點擊「🚀 開始 Standalone Launch」
5. 在授權頁面登入並選擇病人
6. 授權完成後即可使用各項功能

## 📝 其他啟動方式

### 執行基本範例

```bash
npm run example
```

### 開發模式（自動重新載入）

```bash
npm run dev
```

### 執行測試

```bash
npm test
```

## 🔗 相關文件

- [完整使用指南](README.md)
- [Provider Standalone Launch 詳細說明](examples/STANDALONE_LAUNCH_GUIDE.md)
- [範例程式碼](examples/)

## ⚠️ 注意事項

1. **Client ID**: 必須先在 THAS 沙盒環境註冊應用程式
2. **Redirect URI**: 必須與註冊時設定的完全一致
3. **CORS**: 使用本地伺服器開啟，不要直接開啟 HTML 檔案
4. **Scope**: 根據需求設定適當的權限範圍

## 🆘 遇到問題？

- 檢查瀏覽器控制台的錯誤訊息
- 確認 THAS 沙盒環境狀態
- 參考 [STANDALONE_LAUNCH_GUIDE.md](examples/STANDALONE_LAUNCH_GUIDE.md) 的常見問題章節
