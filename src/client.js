/**
 * LTC888Client - 長照 888 SDK 核心客戶端
 * 封裝 FHIR Client 的數據讀取與寫入操作
 */

import { FHIRAuth } from "./auth.js";

/**
 * 長照 888 SDK 客戶端類別
 */
export class LTC888Client {
  /**
   * 初始化 LTC888Client
   * @param {string} serverUrl - FHIR Server 網址
   * @param {Object} authOptions - 授權選項
   */
  constructor(serverUrl = "https://emr-smart.appx.com.tw/v/r4/fhir", authOptions = {}) {
    this.serverUrl = serverUrl;
    this.auth = new FHIRAuth(serverUrl);
    this.client = null;
    this.authOptions = authOptions;
  }

  /**
   * 初始化並完成授權流程
   * @param {Object} options - 授權選項（可覆蓋建構子中的選項）
   * @returns {Promise<LTC888Client>} 自身實例（支援鏈式呼叫）
   */
  async initialize(options = {}) {
    const mergedOptions = { ...this.authOptions, ...options };
    
    // 先嘗試恢復已存在的授權狀態
    this.client = await this.auth.ready();
    
    // 如果沒有已存在的授權，則執行新的授權流程
    if (!this.client) {
      this.client = await this.auth.autoLaunch(mergedOptions);
    }

    return this;
  }

  /**
   * 取得當前授權的 FHIR Client
   * @returns {Object} FHIR Client
   * @throws {Error} 如果尚未初始化
   */
  getClient() {
    if (!this.client) {
      throw new Error("Client 尚未初始化，請先呼叫 initialize()");
    }
    return this.client;
  }

  /**
   * 取得當前病人資料（長照案主）
   * @returns {Promise<Object>} Patient 資源
   */
  async getPatientInfo() {
    try {
      const client = this.getClient();
      const patient = await client.patient.read();
      return patient;
    } catch (error) {
      console.error("讀取病人資料失敗:", error);
      throw new Error(`讀取病人資料失敗: ${error.message}`);
    }
  }

  /**
   * 取得當前病人的 ID
   * @returns {Promise<string>} 病人 ID
   */
  async getPatientId() {
    try {
      const patient = await this.getPatientInfo();
      return patient.id;
    } catch (error) {
      console.error("取得病人 ID 失敗:", error);
      throw error;
    }
  }

  /**
   * 讀取 Observation 資源
   * @param {string} observationId - Observation ID（可選）
   * @param {Object} searchParams - 搜尋參數（可選）
   * @returns {Promise<Object|Array>} Observation 資源或資源陣列
   */
  async getObservation(observationId = null, searchParams = {}) {
    try {
      const client = this.getClient();
      
      if (observationId) {
        // 讀取特定 Observation
        return await client.request(`Observation/${observationId}`);
      } else {
        // 搜尋 Observation（預設搜尋當前病人）
        const patientId = await this.getPatientId();
        const params = {
          subject: `Patient/${patientId}`,
          ...searchParams
        };
        return await client.request("Observation", { searchParams: params });
      }
    } catch (error) {
      console.error("讀取 Observation 失敗:", error);
      throw new Error(`讀取 Observation 失敗: ${error.message}`);
    }
  }

  /**
   * 建立新的 Observation 資源
   * @param {Object} observation - FHIR Observation 資源物件
   * @returns {Promise<Object>} 建立成功的 Observation 資源（包含 ID）
   */
  async createObservation(observation) {
    try {
      const client = this.getClient();
      const result = await client.create(observation);
      return result;
    } catch (error) {
      console.error("建立 Observation 失敗:", error);
      throw new Error(`建立 Observation 失敗: ${error.message}`);
    }
  }

  /**
   * 更新現有的 Observation 資源
   * @param {Object} observation - FHIR Observation 資源物件（必須包含 id）
   * @returns {Promise<Object>} 更新成功的 Observation 資源
   */
  async updateObservation(observation) {
    try {
      if (!observation.id) {
        throw new Error("更新 Observation 需要提供 id");
      }
      const client = this.getClient();
      const result = await client.update(observation);
      return result;
    } catch (error) {
      console.error("更新 Observation 失敗:", error);
      throw new Error(`更新 Observation 失敗: ${error.message}`);
    }
  }

  /**
   * 讀取 CarePlan 資源
   * @param {string} carePlanId - CarePlan ID（可選）
   * @param {Object} searchParams - 搜尋參數（可選）
   * @returns {Promise<Object|Array>} CarePlan 資源或資源陣列
   */
  async getCarePlan(carePlanId = null, searchParams = {}) {
    try {
      const client = this.getClient();
      
      if (carePlanId) {
        return await client.request(`CarePlan/${carePlanId}`);
      } else {
        const patientId = await this.getPatientId();
        const params = {
          subject: `Patient/${patientId}`,
          ...searchParams
        };
        return await client.request("CarePlan", { searchParams: params });
      }
    } catch (error) {
      console.error("讀取 CarePlan 失敗:", error);
      throw new Error(`讀取 CarePlan 失敗: ${error.message}`);
    }
  }

  /**
   * 讀取 Goal 資源
   * @param {string} goalId - Goal ID（可選）
   * @param {Object} searchParams - 搜尋參數（可選）
   * @returns {Promise<Object|Array>} Goal 資源或資源陣列
   */
  async getGoal(goalId = null, searchParams = {}) {
    try {
      const client = this.getClient();
      
      if (goalId) {
        return await client.request(`Goal/${goalId}`);
      } else {
        const patientId = await this.getPatientId();
        const params = {
          subject: `Patient/${patientId}`,
          ...searchParams
        };
        return await client.request("Goal", { searchParams: params });
      }
    } catch (error) {
      console.error("讀取 Goal 失敗:", error);
      throw new Error(`讀取 Goal 失敗: ${error.message}`);
    }
  }

  /**
   * 通用資源讀取方法
   * @param {string} resourceType - 資源類型（如 "Patient", "Observation"）
   * @param {string} resourceId - 資源 ID（可選）
   * @param {Object} searchParams - 搜尋參數（可選）
   * @returns {Promise<Object|Array>} 資源或資源陣列
   */
  async readResource(resourceType, resourceId = null, searchParams = {}) {
    try {
      const client = this.getClient();
      
      if (resourceId) {
        return await client.request(`${resourceType}/${resourceId}`);
      } else {
        return await client.request(resourceType, { searchParams });
      }
    } catch (error) {
      console.error(`讀取 ${resourceType} 失敗:`, error);
      throw new Error(`讀取 ${resourceType} 失敗: ${error.message}`);
    }
  }

  /**
   * 通用資源建立方法
   * @param {Object} resource - FHIR 資源物件
   * @returns {Promise<Object>} 建立成功的資源
   */
  async createResource(resource) {
    try {
      const client = this.getClient();
      return await client.create(resource);
    } catch (error) {
      console.error(`建立 ${resource.resourceType} 失敗:`, error);
      throw new Error(`建立 ${resource.resourceType} 失敗: ${error.message}`);
    }
  }

  /**
   * 通用資源更新方法
   * @param {Object} resource - FHIR 資源物件（必須包含 id）
   * @returns {Promise<Object>} 更新成功的資源
   */
  async updateResource(resource) {
    try {
      if (!resource.id) {
        throw new Error("更新資源需要提供 id");
      }
      const client = this.getClient();
      return await client.update(resource);
    } catch (error) {
      console.error(`更新 ${resource.resourceType} 失敗:`, error);
      throw new Error(`更新 ${resource.resourceType} 失敗: ${error.message}`);
    }
  }

  /**
   * 登出並清除授權狀態
   */
  async logout() {
    await this.auth.logout();
    this.client = null;
  }
}
