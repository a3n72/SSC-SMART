# 代謝症候群疾病管理頁面使用指南

## 概述

本指南說明代謝症候群疾病管理系統的所有頁面功能及對應的 FHIR 資料結構。

## 頁面列表

### 1. 代謝症候群疾病管理紀錄表 (`metabolic-syndrome-management.html`)

**功能說明：**
- 基本資料與生活習慣記錄
- 伴隨疾病選擇
- 慢性病風險評估
- 五大指標及 BMI 輸入
- 運動處方和飲食處方管理

**主要標籤：**
- **基本資料**：評估類型、評估日期、身高、體重、運動、抽菸、嚼檳榔、伴隨疾病、慢性病風險評估
- **五大指標**：腰圍、飯前血糖、HbA1c、血壓、血脂、BMI
- **處方管理**：運動處方、飲食處方

**對應 FHIR 資源：**
- `Observation`：身高、體重、運動習慣、抽菸習慣、腰圍、血糖、HbA1c、血壓、血脂、BMI
- `Condition`：伴隨疾病（糖尿病、高血壓等）
- `RiskAssessment`：慢性病風險評估
- `ServiceRequest`：運動處方
- `NutritionOrder`：飲食處方
- `CarePlan`：整體照護計畫

**FHIR 資料檔案：**
- `fhir-data/metabolic-syndrome-management.json`
- `fhir-data/exercise-diet-prescriptions.json`

### 2. 血壓趨勢圖 (`blood-pressure-trend.html`)

**功能說明：**
- 顯示血壓趨勢折線圖
- 血壓紀錄分布圖
- 支援日/月/年視圖切換
- 支援升序/降序排序

**對應 FHIR 資源：**
- `Observation`：多筆血壓觀測資料（收縮壓、舒張壓）

**FHIR 資料檔案：**
- `fhir-data/blood-pressure-trends.json`

### 3. 生理紀錄聊天介面 (`physiological-records.html`)

**功能說明：**
- 以聊天介面顯示生理紀錄
- 按日期分組顯示
- 包含：血壓、脈搏、血氧、體溫

**對應 FHIR 資源：**
- `Observation`：血壓、脈搏、血氧、體溫

**FHIR 資料檔案：**
- `fhir-data/physiological-records.json`

## FHIR 資源詳細說明

### Observation 資源

#### 生命徵象類

| 項目 | LOINC Code | 單位 | 說明 |
|------|-----------|------|------|
| 身高 | 8302-2 | cm | Body height |
| 體重 | 29463-7 | kg | Body weight |
| BMI | 39156-5 | kg/m² | Body mass index |
| 腰圍 | 8280-0 | cm | Waist Circumference |
| 血壓 | 85354-9 | mmHg | Blood pressure panel |
| 收縮壓 | 8480-6 | mmHg | Systolic blood pressure |
| 舒張壓 | 8462-4 | mmHg | Diastolic blood pressure |
| 脈搏 | 8867-4 | /min | Heart rate |
| 血氧 | 2708-6 | % | Oxygen saturation |
| 體溫 | 8310-5 | °C | Body temperature |

#### 檢驗類

| 項目 | LOINC Code | 單位 | 說明 |
|------|-----------|------|------|
| 飯前血糖 | 33747-0 | mg/dL | Fasting blood glucose |
| HbA1c | 4548-4 | % | Hemoglobin A1c |
| 總膽固醇 | 2093-3 | mg/dL | Total cholesterol |
| 三酸甘油脂 | 2571-8 | mg/dL | Triglycerides |
| HDL膽固醇 | 2085-9 | mg/dL | HDL cholesterol |
| LDL膽固醇 | 2089-1 | mg/dL | LDL cholesterol |

#### 社會史類

| 項目 | LOINC Code | 說明 |
|------|-----------|------|
| 運動習慣 | 68515-6 | Exercise |
| 抽菸習慣 | 72166-2 | Tobacco smoking status |

### Condition 資源

| 疾病 | SNOMED CT Code | 說明 |
|------|---------------|------|
| 糖尿病 | 73211009 | Diabetes mellitus |
| 高血壓 | 38341003 | Hypertensive disorder |
| 代謝症候群 | 44054006 | Metabolic syndrome |

### ServiceRequest 資源（運動處方）

```json
{
  "resourceType": "ServiceRequest",
  "status": "active",
  "intent": "order",
  "code": {
    "coding": [{
      "system": "http://snomed.info/sct",
      "code": "229065009",
      "display": "Exercise therapy"
    }]
  },
  "extension": [{
    "url": "http://twcore.mohw.gov.tw/fhir/StructureDefinition/tw-exercise-prescription",
    "extension": [
      {"url": "type", "valueCode": "moderate"},
      {"url": "duration", "valueInteger": 30},
      {"url": "frequency", "valueInteger": 3}
    ]
  }]
}
```

### NutritionOrder 資源（飲食處方）

```json
{
  "resourceType": "NutritionOrder",
  "status": "active",
  "oralDiet": {
    "type": {
      "coding": [{
        "system": "http://snomed.info/sct",
        "code": "226529007",
        "display": "Therapeutic diet"
      }]
    },
    "calorie": {
      "value": 1800,
      "unit": "kcal"
    },
    "extension": [{
      "url": "http://twcore.mohw.gov.tw/fhir/StructureDefinition/tw-diet-adjustments",
      "extension": [
        {"url": "reduceFried", "valueBoolean": true},
        {"url": "reduceSweets", "valueBoolean": true},
        {"url": "increaseProtein", "valueBoolean": true},
        {"url": "increaseVegetables", "valueBoolean": true}
      ]
    }]
  }
}
```

### RiskAssessment 資源（風險評估）

```json
{
  "resourceType": "RiskAssessment",
  "status": "final",
  "code": {
    "coding": [{
      "system": "http://snomed.info/sct",
      "code": "408512008",
      "display": "Risk of coronary heart disease"
    }]
  },
  "prediction": [{
    "outcome": {
      "coding": [{
        "system": "http://snomed.info/sct",
        "code": "408512008",
        "display": "Coronary heart disease"
      }]
    },
    "qualitativeRisk": {
      "coding": [{
        "system": "http://terminology.hl7.org/CodeSystem/risk-probability",
        "code": "moderate",
        "display": "Moderate"
      }],
      "text": "中"
    }
  }]
}
```

### CarePlan 資源（照護計畫）

```json
{
  "resourceType": "CarePlan",
  "status": "active",
  "intent": "plan",
  "category": [{
    "coding": [{
      "system": "http://snomed.info/sct",
      "code": "698360004",
      "display": "Metabolic syndrome management"
    }]
  }],
  "activity": [
    {
      "detail": {
        "kind": "ServiceRequest",
        "code": {
          "coding": [{
            "system": "http://snomed.info/sct",
            "code": "229065009",
            "display": "Exercise therapy"
          }]
        },
        "status": "in-progress"
      }
    },
    {
      "detail": {
        "kind": "NutritionOrder",
        "code": {
          "coding": [{
            "system": "http://snomed.info/sct",
            "code": "226529007",
            "display": "Therapeutic diet"
          }]
        },
        "status": "in-progress"
      }
    }
  ]
}
```

## 使用方式

### 1. 啟動本地伺服器

```bash
python -m http.server 8000
```

### 2. 開啟頁面

- **疾病管理紀錄表**：`http://localhost:8000/examples/metabolic-syndrome-management.html`
- **血壓趨勢圖**：`http://localhost:8000/examples/blood-pressure-trend.html`
- **生理紀錄**：`http://localhost:8000/examples/physiological-records.html`

### 3. 上傳 FHIR 資料

#### 使用 curl

```bash
# 上傳疾病管理資料
curl -X POST \
  https://your-fhir-server/fhir \
  -H "Content-Type: application/fhir+json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d @examples/fhir-data/metabolic-syndrome-management.json

# 上傳運動和飲食處方
curl -X POST \
  https://your-fhir-server/fhir \
  -H "Content-Type: application/fhir+json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d @examples/fhir-data/exercise-diet-prescriptions.json

# 上傳血壓趨勢資料
curl -X POST \
  https://your-fhir-server/fhir \
  -H "Content-Type: application/fhir+json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d @examples/fhir-data/blood-pressure-trends.json

# 上傳生理紀錄
curl -X POST \
  https://your-fhir-server/fhir \
  -H "Content-Type: application/fhir+json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d @examples/fhir-data/physiological-records.json
```

#### 使用 SDK

```javascript
import { LTC888Client } from '../src/index.js';

const client = new LTC888Client();
await client.initialize();

// 讀取並上傳 Bundle
const bundle = await fetch('./fhir-data/metabolic-syndrome-management.json')
  .then(res => res.json());

for (const entry of bundle.entry) {
  const resource = entry.resource;
  if (resource.resourceType === 'Observation') {
    await client.createObservation(resource);
  } else {
    await client.createResource(resource);
  }
}
```

## 資料結構對應表

| 表單欄位 | FHIR 資源類型 | FHIR 欄位 | 編碼系統 |
|---------|--------------|-----------|---------|
| 身高 | Observation | valueQuantity | LOINC: 8302-2 |
| 體重 | Observation | valueQuantity | LOINC: 29463-7 |
| BMI | Observation | valueQuantity | LOINC: 39156-5 |
| 運動習慣 | Observation | valueCodeableConcept | LOINC: 68515-6 |
| 抽菸習慣 | Observation | valueCodeableConcept | LOINC: 72166-2 |
| 糖尿病 | Condition | code | SNOMED: 73211009 |
| 高血壓 | Condition | code | SNOMED: 38341003 |
| 腰圍 | Observation | valueQuantity | LOINC: 8280-0 |
| 飯前血糖 | Observation | valueQuantity | LOINC: 33747-0 |
| HbA1c | Observation | valueQuantity | LOINC: 4548-4 |
| 收縮壓 | Observation | component[0].valueQuantity | LOINC: 8480-6 |
| 舒張壓 | Observation | component[1].valueQuantity | LOINC: 8462-4 |
| 三酸甘油脂 | Observation | valueQuantity | LOINC: 2571-8 |
| HDL膽固醇 | Observation | valueQuantity | LOINC: 2085-9 |
| LDL膽固醇 | Observation | valueQuantity | LOINC: 2089-1 |
| 總膽固醇 | Observation | valueQuantity | LOINC: 2093-3 |
| 運動處方 | ServiceRequest | code | SNOMED: 229065009 |
| 飲食處方 | NutritionOrder | oralDiet.type | SNOMED: 226529007 |
| 風險評估 | RiskAssessment | prediction | SNOMED: 408512008 |

## 注意事項

1. **授權要求**：所有頁面都需要先完成 SMART on FHIR 授權
2. **資料完整性**：確保 Patient 資源已存在於 FHIR Server
3. **參考範圍**：某些檢驗項目的參考範圍有性別差異
4. **時間格式**：所有日期時間使用 ISO 8601 格式
5. **編碼系統**：使用標準的 LOINC 和 SNOMED CT 編碼

## 相關資源

- [代謝健康紅綠燈系統指南](METABOLIC_SYNDROME_GUIDE.md)
- [完整工作流程指南](COMPLETE_WORKFLOW.md)
- [FHIR 官方文件](https://www.hl7.org/fhir/)
- [LOINC 編碼系統](https://loinc.org/)
- [SNOMED CT](https://www.snomed.org/)
