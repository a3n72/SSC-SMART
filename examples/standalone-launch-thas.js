/**
 * Provider Standalone Launch 範例
 * 使用 THAS 沙盒環境進行 Standalone Launch
 * 
 * 此範例示範如何連接到 THAS 沙盒環境的 Provider Standalone Launch 模式
 * 
 * 使用方式：
 * 1. 在瀏覽器中開啟 examples/standalone-launch-thas.html
 * 2. 或使用 Node.js 執行此檔案（需要額外處理 OAuth 流程）
 */

import { FHIRAuth, LTC888Client } from "../src/index.js";

// THAS 沙盒環境的 ISS URL（從 SAND-BOX 對話框取得）
const THAS_ISS_URL = "https://thas.mohw.gov.tw/v/r4/sim/WzlslilslilslkFVVE8iLDASMCwwLCIiLCIILCIİLCIİLCIİLCIİLCIILDAsMSwill0/fhir";

// Patient Viewer URL（用於選擇病人）
const PATIENT_VIEWER_URL = "https://thas.mohw.gov.tw/patient-browser/";

/**
 * 範例：使用 Provider Standalone Launch 連接到 THAS 沙盒環境
 */
async function exampleStandaloneLaunch() {
  console.log("=== Provider Standalone Launch 範例 ===");
  console.log(`ISS URL: ${THAS_ISS_URL}`);
  console.log(`Patient Viewer: ${PATIENT_VIEWER_URL}`);
  console.log("");

  try {
    // 方法 1: 使用 FHIRAuth 直接進行 Standalone Launch
    console.log("方法 1: 使用 FHIRAuth 進行 Standalone Launch");
    const auth = new FHIRAuth(THAS_ISS_URL);
    
    // 注意：在瀏覽器環境中，redirectUri 會自動從 window.location 取得
    // 在 Node.js 環境中，需要明確指定 redirectUri
    const redirectUri = typeof window !== "undefined" 
      ? window.location.href.split("?")[0] 
      : "http://localhost:3000/callback"; // Node.js 環境需要設定實際的 redirect URI

    const client = await auth.standaloneLaunch({
      clientId: "ltc-888-sdk", // 請替換為您在 THAS 註冊的實際 Client ID
      scope: "launch/patient openid fhiruser patient/*.read patient/*.write",
      redirectUri: redirectUri
    });

    console.log("✓ Standalone Launch 成功！");
    console.log("");

    // 取得病人資料
    const patient = await client.patient.read();
    console.log("病人資料:", JSON.stringify(patient, null, 2));

  } catch (error) {
    console.error("✗ Standalone Launch 失敗:", error.message);
    console.error("詳細錯誤:", error);
  }
}

/**
 * 範例：使用 LTC888Client 進行 Standalone Launch（推薦方式）
 */
async function exampleLTC888ClientStandalone() {
  console.log("=== 使用 LTC888Client 進行 Standalone Launch ===");
  console.log("");

  try {
    // 使用 LTC888Client，指定 THAS 沙盒環境的 ISS URL
    const client = new LTC888Client(THAS_ISS_URL, {
      clientId: "ltc-888-sdk", // 請替換為您在 THAS 註冊的實際 Client ID
      scope: "launch/patient openid fhiruser patient/*.read patient/*.write"
    });

    // 初始化並完成授權流程
    await client.initialize();

    console.log("✓ 初始化成功！");
    console.log("");

    // 取得病人資料
    const patient = await client.getPatientInfo();
    console.log("病人資料:", JSON.stringify(patient, null, 2));
    console.log("");

    // 取得病人 ID
    const patientId = await client.getPatientId();
    console.log(`病人 ID: ${patientId}`);
    console.log("");

    // 讀取 Observation
    const observations = await client.getObservation();
    console.log(`找到 ${observations.entry?.length || 0} 筆 Observation`);
    console.log("");

    return client;

  } catch (error) {
    console.error("✗ 初始化失敗:", error.message);
    console.error("詳細錯誤:", error);
    throw error;
  }
}

/**
 * 完整範例：Standalone Launch + 建立血壓 Observation
 */
async function exampleCompleteWorkflow() {
  console.log("=== 完整工作流程範例 ===");
  console.log("");

  try {
    // 1. 初始化 Client
    const client = new LTC888Client(THAS_ISS_URL, {
      clientId: "ltc-888-sdk",
      scope: "launch/patient openid fhiruser patient/*.read patient/*.write"
    });

    await client.initialize();
    console.log("✓ 步驟 1: 初始化完成");
    console.log("");

    // 2. 取得病人 ID
    const patientId = await client.getPatientId();
    console.log(`✓ 步驟 2: 取得病人 ID: ${patientId}`);
    console.log("");

    // 3. 建立血壓 Observation
    const { mapBloodPressure } = await import("../src/index.js");
    const bloodPressure = mapBloodPressure(120, 80, patientId, new Date());
    
    const result = await client.createObservation(bloodPressure);
    console.log("✓ 步驟 3: 建立血壓 Observation 成功");
    console.log("Observation ID:", result.id);
    console.log("");

    return result;

  } catch (error) {
    console.error("✗ 工作流程失敗:", error.message);
    console.error("詳細錯誤:", error);
    throw error;
  }
}

// 如果是在瀏覽器環境中執行，可以取消註解以下程式碼
// 注意：在 Node.js 環境中，OAuth 流程需要額外處理（如使用 express 建立 callback endpoint）

// 瀏覽器環境使用方式：
if (typeof window !== "undefined") {
  // 將函數匯出到全域，供 HTML 頁面使用
  window.exampleStandaloneLaunch = exampleStandaloneLaunch;
  window.exampleLTC888ClientStandalone = exampleLTC888ClientStandalone;
  window.exampleCompleteWorkflow = exampleCompleteWorkflow;
}

// 匯出函數供其他模組使用
export {
  exampleStandaloneLaunch,
  exampleLTC888ClientStandalone,
  exampleCompleteWorkflow,
  THAS_ISS_URL,
  PATIENT_VIEWER_URL
};
