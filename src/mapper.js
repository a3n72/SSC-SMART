/**
 * 888 長照議題數據轉換模組
 * 將長照原始資料轉換為符合 TW Core IG 規範的 FHIR 資源格式
 */

/**
 * 將 888 方案中的血壓數據轉換為 FHIR Observation 資源
 * @param {number} systolic - 收縮壓
 * @param {number} diastolic - 舒張壓
 * @param {string} patientId - 病人 ID
 * @param {Date|string} effectiveDateTime - 測量時間
 * @returns {Object} FHIR Observation 資源
 */
export function mapBloodPressure(systolic, diastolic, patientId, effectiveDateTime = new Date()) {
  return {
    resourceType: "Observation",
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "vital-signs",
            display: "生命徵象"
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "85354-9",
          display: "Blood pressure panel with all children optional"
        }
      ],
      text: "血壓"
    },
    subject: {
      reference: `Patient/${patientId}`
    },
    effectiveDateTime: effectiveDateTime instanceof Date 
      ? effectiveDateTime.toISOString() 
      : effectiveDateTime,
    component: [
      {
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "8480-6",
              display: "Systolic blood pressure"
            }
          ],
          text: "收縮壓"
        },
        valueQuantity: {
          value: systolic,
          unit: "mmHg",
          system: "http://unitsofmeasure.org",
          code: "mm[Hg]"
        }
      },
      {
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "8462-4",
              display: "Diastolic blood pressure"
            }
          ],
          text: "舒張壓"
        },
        valueQuantity: {
          value: diastolic,
          unit: "mmHg",
          system: "http://unitsofmeasure.org",
          code: "mm[Hg]"
        }
      }
    ]
  };
}

/**
 * 將 888 方案中的血糖數據轉換為 FHIR Observation 資源
 * @param {number} value - 血糖值
 * @param {string} patientId - 病人 ID
 * @param {string} type - 血糖類型（空腹/飯後/隨機），預設為 "隨機"
 * @param {Date|string} effectiveDateTime - 測量時間
 * @returns {Object} FHIR Observation 資源
 */
export function mapBloodGlucose(value, patientId, type = "隨機", effectiveDateTime = new Date()) {
  const glucoseTypeMap = {
    "空腹": { code: "33747-0", display: "Glucose [Mass/volume] in Blood --fasting" },
    "飯後": { code: "33748-8", display: "Glucose [Mass/volume] in Blood --2 hours post meal" },
    "隨機": { code: "2339-0", display: "Glucose [Mass/volume] in Blood" }
  };

  const glucoseType = glucoseTypeMap[type] || glucoseTypeMap["隨機"];

  return {
    resourceType: "Observation",
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "laboratory",
            display: "檢驗"
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: glucoseType.code,
          display: glucoseType.display
        }
      ],
      text: `血糖（${type}）`
    },
    subject: {
      reference: `Patient/${patientId}`
    },
    effectiveDateTime: effectiveDateTime instanceof Date 
      ? effectiveDateTime.toISOString() 
      : effectiveDateTime,
    valueQuantity: {
      value: value,
      unit: "mg/dL",
      system: "http://unitsofmeasure.org",
      code: "mg/dL"
    }
  };
}

/**
 * 將 888 方案中的體重數據轉換為 FHIR Observation 資源
 * @param {number} value - 體重值（公斤）
 * @param {string} patientId - 病人 ID
 * @param {Date|string} effectiveDateTime - 測量時間
 * @returns {Object} FHIR Observation 資源
 */
export function mapBodyWeight(value, patientId, effectiveDateTime = new Date()) {
  return {
    resourceType: "Observation",
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "vital-signs",
            display: "生命徵象"
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "29463-7",
          display: "Body weight"
        }
      ],
      text: "體重"
    },
    subject: {
      reference: `Patient/${patientId}`
    },
    effectiveDateTime: effectiveDateTime instanceof Date 
      ? effectiveDateTime.toISOString() 
      : effectiveDateTime,
    valueQuantity: {
      value: value,
      unit: "kg",
      system: "http://unitsofmeasure.org",
      code: "kg"
    }
  };
}

/**
 * 將 888 方案中的步數數據轉換為 FHIR Observation 資源
 * @param {number} steps - 步數
 * @param {string} patientId - 病人 ID
 * @param {Date|string} effectiveDateTime - 測量時間
 * @returns {Object} FHIR Observation 資源
 */
export function mapStepCount(steps, patientId, effectiveDateTime = new Date()) {
  return {
    resourceType: "Observation",
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "activity",
            display: "活動"
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "55423-8",
          display: "Number of steps"
        }
      ],
      text: "步數"
    },
    subject: {
      reference: `Patient/${patientId}`
    },
    effectiveDateTime: effectiveDateTime instanceof Date 
      ? effectiveDateTime.toISOString() 
      : effectiveDateTime,
    valueQuantity: {
      value: steps,
      unit: "steps",
      system: "http://unitsofmeasure.org",
      code: "{steps}"
    }
  };
}

/**
 * 將 888 方案中的體溫數據轉換為 FHIR Observation 資源
 * @param {number} value - 體溫值（攝氏）
 * @param {string} patientId - 病人 ID
 * @param {Date|string} effectiveDateTime - 測量時間
 * @returns {Object} FHIR Observation 資源
 */
export function mapBodyTemperature(value, patientId, effectiveDateTime = new Date()) {
  return {
    resourceType: "Observation",
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "vital-signs",
            display: "生命徵象"
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "8310-5",
          display: "Body temperature"
        }
      ],
      text: "體溫"
    },
    subject: {
      reference: `Patient/${patientId}`
    },
    effectiveDateTime: effectiveDateTime instanceof Date 
      ? effectiveDateTime.toISOString() 
      : effectiveDateTime,
    valueQuantity: {
      value: value,
      unit: "°C",
      system: "http://unitsofmeasure.org",
      code: "Cel"
    }
  };
}

/**
 * 將 888 方案中的心率數據轉換為 FHIR Observation 資源
 * @param {number} value - 心率值（次/分鐘）
 * @param {string} patientId - 病人 ID
 * @param {Date|string} effectiveDateTime - 測量時間
 * @returns {Object} FHIR Observation 資源
 */
export function mapHeartRate(value, patientId, effectiveDateTime = new Date()) {
  return {
    resourceType: "Observation",
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "vital-signs",
            display: "生命徵象"
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "8867-4",
          display: "Heart rate"
        }
      ],
      text: "心率"
    },
    subject: {
      reference: `Patient/${patientId}`
    },
    effectiveDateTime: effectiveDateTime instanceof Date 
      ? effectiveDateTime.toISOString() 
      : effectiveDateTime,
    valueQuantity: {
      value: value,
      unit: "次/分鐘",
      system: "http://unitsofmeasure.org",
      code: "/min"
    }
  };
}

/**
 * 通用映射函數：根據類型自動選擇對應的映射函數
 * @param {string} type - 觀測類型（blood-pressure, blood-glucose, weight, steps, temperature, heart-rate）
 * @param {*} value - 觀測值（可能是單一數值或物件）
 * @param {string} patientId - 病人 ID
 * @param {Date|string} effectiveDateTime - 測量時間
 * @returns {Object} FHIR Observation 資源
 */
export function mapObservation(type, value, patientId, effectiveDateTime = new Date()) {
  const typeMap = {
    "blood-pressure": (v) => mapBloodPressure(v.systolic, v.diastolic, patientId, effectiveDateTime),
    "blood-glucose": (v) => mapBloodGlucose(v.value || v, patientId, v.type || "隨機", effectiveDateTime),
    "weight": (v) => mapBodyWeight(v, patientId, effectiveDateTime),
    "steps": (v) => mapStepCount(v, patientId, effectiveDateTime),
    "temperature": (v) => mapBodyTemperature(v, patientId, effectiveDateTime),
    "heart-rate": (v) => mapHeartRate(v, patientId, effectiveDateTime)
  };

  const mapper = typeMap[type];
  if (!mapper) {
    throw new Error(`不支援的觀測類型: ${type}`);
  }

  return mapper(value);
}
