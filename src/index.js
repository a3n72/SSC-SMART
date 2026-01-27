/**
 * 888 長照標準化 SDK 入口點
 * 匯出所有公開的類別和函數
 */

export { FHIRAuth } from "./auth.js";
export { LTC888Client } from "./client.js";
export {
  mapBloodPressure,
  mapBloodGlucose,
  mapBodyWeight,
  mapStepCount,
  mapBodyTemperature,
  mapHeartRate,
  mapObservation
} from "./mapper.js";
export {
  CDSHooksService,
  SmartAlertHookHandlers,
  createSmartAlertService
} from "./cds-hooks.js";

// 預設匯出 LTC888Client（方便使用）
export { LTC888Client as default } from "./client.js";
