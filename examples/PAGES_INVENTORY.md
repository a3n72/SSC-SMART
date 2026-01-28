# 頁面清單與導航狀態

## 📋 所有頁面清單

### 主要功能頁面（應在主頁面導航中）

| 頁面檔案 | 頁面名稱 | 功能說明 | 導航狀態 | 備註 |
|---------|---------|---------|---------|------|
| `metabolic-syndrome.html` | 御曲同工全人整合照護SMART平台 | 主頁面，包含：<br>- 病人資料<br>- 生理數據<br>- 臨床評估<br>- 匯出報告 | ✅ 主頁面 | 這是主要入口頁面 |
| `metabolic-syndrome-management.html` | 疾病管理 | 疾病管理紀錄表，包含：<br>- 基本資料<br>- 五大指標<br>- 處方管理（運動/飲食處方） | ✅ 已加入導航 | 按鈕：📋 疾病管理 |
| `blood-pressure-trend.html` | 血壓趨勢 | 血壓趨勢圖表<br>- 折線圖<br>- 分布圖<br>- 日/月/年視圖 | ✅ 已加入導航 | 按鈕：📈 血壓趨勢 |
| `physiological-records.html` | 生理紀錄 | 生理紀錄聊天介面<br>- 血壓、脈搏、血氧、體溫<br>- 按日期分組 | ✅ 已加入導航 | 按鈕：💬 生理紀錄 |

### 工具/功能頁面（可選加入導航）

| 頁面檔案 | 頁面名稱 | 功能說明 | 導航狀態 | 建議 |
|---------|---------|---------|---------|------|
| `cds-hooks-dashboard.html` | 智慧提醒與警示 Dashboard | CDS Hooks 儀表板<br>- 智慧提醒<br>- 警示系統 | ❌ 未加入 | 建議加入導航 |

### 授權/啟動頁面（入口頁面，不需要在導航中）

| 頁面檔案 | 頁面名稱 | 功能說明 | 導航狀態 | 備註 |
|---------|---------|---------|---------|------|
| `launch.html` | SMART on FHIR 授權啟動 | 授權啟動頁面 | N/A | 入口頁面 |
| `standalone-launch-thas.html` | Provider Standalone Launch | Standalone Launch 範例 | N/A | 範例頁面 |
| `index.html` | 888 長照 SDK - 主程式 | 原始範例頁面 | N/A | 範例頁面 |

## 🗺️ 當前導航結構

### 主頁面 (`metabolic-syndrome.html`) 導航欄

```
[👤 病人資料] [🔍 生理數據] [📊 臨床評估] [📄 匯出報告] 
[📋 疾病管理] [📈 血壓趨勢] [💬 生理紀錄] [🚪 登出]
```

### 頁面關係圖

```
launch.html (授權入口)
    ↓
metabolic-syndrome.html (主頁面)
    ├─→ metabolic-syndrome-management.html (疾病管理)
    │       └─ 處方管理（運動/飲食處方）
    ├─→ blood-pressure-trend.html (血壓趨勢)
    └─→ physiological-records.html (生理紀錄)
```

## ✅ 檢查清單

- [x] 主頁面 (`metabolic-syndrome.html`) - 已存在
- [x] 疾病管理頁面 (`metabolic-syndrome-management.html`) - ✅ 已加入導航
- [x] 血壓趨勢頁面 (`blood-pressure-trend.html`) - ✅ 已加入導航
- [x] 生理紀錄頁面 (`physiological-records.html`) - ✅ 已加入導航
- [ ] CDS Hooks 儀表板 (`cds-hooks-dashboard.html`) - ❌ 未加入導航（建議加入）

## 💡 建議

1. **建議加入 CDS Hooks 儀表板**：如果智慧提醒與警示功能是系統的一部分，建議將 `cds-hooks-dashboard.html` 也加入主頁面導航。

2. **頁面標題一致性**：所有頁面標題已統一為「御曲同工全人整合照護SMART平台」格式。

3. **返回功能**：所有子頁面都應該有返回主頁面的功能（目前都已實作）。
