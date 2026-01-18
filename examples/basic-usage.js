/**
 * 基本使用範例
 * 示範如何使用 LTC888Client 進行 SMART on FHIR 介接
 * 
 * 注意：此範例適用於瀏覽器環境
 * 在 Node.js 環境中，需要額外處理 OAuth 流程
 */

import { LTC888Client, mapBloodPressure, mapBloodGlucose } from "../src/index.js";

/**
 * 範例 1: 初始化並取得病人資料
 */
async function example1_getPatientInfo() {
  console.log("=== 範例 1: 取得病人資料 ===");
  
  try {
    const client = new LTC888Client();
    
    // 初始化（會自動判斷 EHR Launch 或 Standalone Launch）
    await client.initialize();
    
    // 取得當前病人資料
    const patient = await client.getPatientInfo();
    console.log("病人資料:", patient);
    
    // 取得病人 ID
    const patientId = await client.getPatientId();
    console.log("病人 ID:", patientId);
    
  } catch (error) {
    console.error("錯誤:", error);
  }
}

/**
 * 範例 2: 讀取 Observation 資源
 */
async function example2_readObservations() {
  console.log("=== 範例 2: 讀取 Observation ===");
  
  try {
    const client = new LTC888Client();
    await client.initialize();
    
    // 讀取當前病人的所有 Observation
    const observations = await client.getObservation();
    console.log("Observation 列表:", observations);
    
    // 讀取特定類型的 Observation（例如：血壓）
    const bloodPressureObservations = await client.getObservation(null, {
      code: "http://loinc.org|85354-9"
    });
    console.log("血壓觀測:", bloodPressureObservations);
    
  } catch (error) {
    console.error("錯誤:", error);
  }
}

/**
 * 範例 3: 建立新的 Observation（血壓）
 */
async function example3_createBloodPressure() {
  console.log("=== 範例 3: 建立血壓 Observation ===");
  
  try {
    const client = new LTC888Client();
    await client.initialize();
    
    const patientId = await client.getPatientId();
    
    // 使用 mapper 將 888 數據轉換為 FHIR 格式
    const bloodPressureObservation = mapBloodPressure(
      120,  // 收縮壓
      80,   // 舒張壓
      patientId,
      new Date()
    );
    
    // 建立 Observation
    const result = await client.createObservation(bloodPressureObservation);
    console.log("建立成功:", result);
    
  } catch (error) {
    console.error("錯誤:", error);
  }
}

/**
 * 範例 4: 建立血糖 Observation
 */
async function example4_createBloodGlucose() {
  console.log("=== 範例 4: 建立血糖 Observation ===");
  
  try {
    const client = new LTC888Client();
    await client.initialize();
    
    const patientId = await client.getPatientId();
    
    // 建立空腹血糖 Observation
    const glucoseObservation = mapBloodGlucose(
      95,        // 血糖值
      patientId,
      "空腹",    // 血糖類型
      new Date()
    );
    
    const result = await client.createObservation(glucoseObservation);
    console.log("建立成功:", result);
    
  } catch (error) {
    console.error("錯誤:", error);
  }
}

/**
 * 範例 5: 讀取 CarePlan 和 Goal
 */
async function example5_readCarePlanAndGoal() {
  console.log("=== 範例 5: 讀取 CarePlan 和 Goal ===");
  
  try {
    const client = new LTC888Client();
    await client.initialize();
    
    // 讀取 CarePlan
    const carePlans = await client.getCarePlan();
    console.log("CarePlan 列表:", carePlans);
    
    // 讀取 Goal
    const goals = await client.getGoal();
    console.log("Goal 列表:", goals);
    
  } catch (error) {
    console.error("錯誤:", error);
  }
}

/**
 * 範例 6: 使用通用資源讀取方法
 */
async function example6_genericResourceRead() {
  console.log("=== 範例 6: 通用資源讀取 ===");
  
  try {
    const client = new LTC888Client();
    await client.initialize();
    
    // 讀取 MedicationStatement
    const medications = await client.readResource("MedicationStatement", null, {
      subject: `Patient/${await client.getPatientId()}`
    });
    console.log("用藥記錄:", medications);
    
  } catch (error) {
    console.error("錯誤:", error);
  }
}

// 如果是在瀏覽器環境中執行，可以取消註解以下程式碼
// 注意：在 Node.js 環境中，OAuth 流程需要額外處理

// window.addEventListener("DOMContentLoaded", async () => {
//   await example1_getPatientInfo();
//   await example2_readObservations();
//   // ... 其他範例
// });

// 匯出範例函數供測試使用
export {
  example1_getPatientInfo,
  example2_readObservations,
  example3_createBloodPressure,
  example4_createBloodGlucose,
  example5_readCarePlanAndGoal,
  example6_genericResourceRead
};
