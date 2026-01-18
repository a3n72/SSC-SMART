/**
 * SMART on FHIR 授權模組
 * 支援 EHR Launch 與 Standalone Launch 兩種啟動流程
 */

import FHIR from "fhirclient";

/**
 * SMART on FHIR 授權類別
 */
export class FHIRAuth {
  /**
   * 初始化授權模組
   * @param {string} serverUrl - FHIR Server 網址（預設為 THAS 沙盒環境）
   */
  constructor(serverUrl = "https://emr-smart.appx.com.tw/v/r4/fhir") {
    this.serverUrl = serverUrl;
    this.client = null;
  }

  /**
   * EHR Launch 流程
   * 從 EHR 系統啟動，接收 iss 與 launch 參數
   * @param {string} iss - Issuer URL（從 URL 參數取得）
   * @param {string} launch - Launch token（從 URL 參數取得）
   * @param {Object} options - 額外選項（如 redirectUri）
   * @returns {Promise<Object>} 已授權的 FHIR Client
   */
  async ehrLaunch(iss, launch, options = {}) {
    try {
      // 取得 redirectUri（支援瀏覽器和 Node.js 環境）
      let redirectUri = options.redirectUri;
      if (!redirectUri && typeof window !== "undefined") {
        redirectUri = window.location.href.split("?")[0];
      }
      if (!redirectUri) {
        throw new Error("必須提供 redirectUri（在 Node.js 環境中需要明確指定）");
      }
      
      // 使用 fhirclient 進行 EHR Launch 授權
      this.client = await FHIR.oauth2.authorize({
        iss: iss,
        launch: launch,
        redirectUri: redirectUri,
        clientId: options.clientId || "ltc-888-sdk",
        scope: options.scope || "launch/patient openid fhiruser patient/*.read",
      });

      return this.client;
    } catch (error) {
      console.error("EHR Launch 授權失敗:", error);
      throw new Error(`EHR Launch 失敗: ${error.message}`);
    }
  }

  /**
   * Standalone Launch 流程
   * 獨立啟動，直接導向授權頁面
   * @param {Object} options - 授權選項
   * @returns {Promise<Object>} 已授權的 FHIR Client
   */
  async standaloneLaunch(options = {}) {
    try {
      // 取得 redirectUri（支援瀏覽器和 Node.js 環境）
      let redirectUri = options.redirectUri;
      if (!redirectUri && typeof window !== "undefined") {
        redirectUri = window.location.href.split("?")[0];
      }
      if (!redirectUri) {
        throw new Error("必須提供 redirectUri（在 Node.js 環境中需要明確指定）");
      }
      
      // 使用 fhirclient 進行 Standalone Launch 授權
      this.client = await FHIR.oauth2.authorize({
        iss: this.serverUrl,
        redirectUri: redirectUri,
        clientId: options.clientId || "ltc-888-sdk",
        scope: options.scope || "launch/patient openid fhiruser patient/*.read",
      });

      return this.client;
    } catch (error) {
      console.error("Standalone Launch 授權失敗:", error);
      throw new Error(`Standalone Launch 失敗: ${error.message}`);
    }
  }

  /**
   * 從 URL 參數自動判斷啟動類型並執行授權
   * @param {Object} options - 授權選項
   * @returns {Promise<Object>} 已授權的 FHIR Client
   */
  async autoLaunch(options = {}) {
    // 檢查 URL 參數中是否有 iss 和 launch（EHR Launch）
    // 注意：此方法僅適用於瀏覽器環境
    if (typeof window === "undefined") {
      throw new Error("autoLaunch() 僅適用於瀏覽器環境，請使用 ehrLaunch() 或 standaloneLaunch()");
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const iss = urlParams.get("iss");
    const launch = urlParams.get("launch");

    if (iss && launch) {
      // EHR Launch
      return await this.ehrLaunch(iss, launch, options);
    } else {
      // Standalone Launch
      return await this.standaloneLaunch(options);
    }
  }

  /**
   * 檢查是否已授權（從 sessionStorage 恢復）
   * @returns {Promise<Object|null>} 已授權的 FHIR Client 或 null
   */
  async ready() {
    try {
      this.client = await FHIR.oauth2.ready();
      return this.client;
    } catch (error) {
      console.warn("無法恢復授權狀態:", error);
      return null;
    }
  }

  /**
   * 取得當前授權的 Client
   * @returns {Object|null} FHIR Client 或 null
   */
  getClient() {
    return this.client;
  }

  /**
   * 登出並清除授權狀態
   */
  async logout() {
    try {
      if (this.client) {
        await this.client.logout();
      }
      this.client = null;
    } catch (error) {
      console.error("登出失敗:", error);
    }
  }
}
