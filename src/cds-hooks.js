/**
 * CDS Hooks 服務模組
 * 實作 HL7 FHIR CDS Hooks 標準，用於智慧提醒與警示
 * 支援定期或符合條件時事件觸發，輸出平台通知與 Dashboard 管理
 */

/**
 * CDS Hooks 服務類別
 * 用於處理 CDS Hook 請求並返回卡片（Cards）
 */
export class CDSHooksService {
  constructor(options = {}) {
    this.hooks = new Map();
    this.predefinedData = new Map();
    this.options = {
      baseUrl: options.baseUrl || 'http://localhost:3000',
      ...options
    };
  }

  /**
   * 註冊 CDS Hook
   * @param {string} hook - Hook 名稱（如 'patient-view', 'order-select'）
   * @param {Function} handler - 處理函數
   */
  registerHook(hook, handler) {
    this.hooks.set(hook, handler);
  }

  /**
   * 設定預寫資料
   * @param {string} key - 資料鍵值
   * @param {Object} data - 預寫資料
   */
  setPredefinedData(key, data) {
    this.predefinedData.set(key, data);
  }

  /**
   * 取得預寫資料
   * @param {string} key - 資料鍵值
   * @returns {Object} 預寫資料
   */
  getPredefinedData(key) {
    return this.predefinedData.get(key);
  }

  /**
   * 處理 CDS Hook 請求
   * @param {string} hook - Hook 名稱
   * @param {Object} context - Hook 上下文（包含 patientId, userId 等）
   * @param {Object} prefetch - 預取資料
   * @returns {Promise<Object>} CDS Hooks 回應（包含 cards）
   */
  async handleHook(hook, context = {}, prefetch = {}) {
    const handler = this.hooks.get(hook);
    if (!handler) {
      return {
        cards: []
      };
    }

    try {
      const cards = await handler(context, prefetch, this);
      return {
        cards: Array.isArray(cards) ? cards : [cards]
      };
    } catch (error) {
      console.error(`處理 Hook ${hook} 時發生錯誤:`, error);
      return {
        cards: [{
          summary: '處理錯誤',
          detail: error.message,
          indicator: 'critical',
          source: {
            label: 'CDS Hooks Service'
          }
        }]
      };
    }
  }

  /**
   * 建立智慧提醒卡片
   * @param {Object} options - 卡片選項
   * @returns {Object} CDS Hook 卡片
   */
  createAlertCard(options) {
    const {
      summary,
      detail,
      indicator = 'info',
      source = { label: '御管轉診平台' },
      suggestions = [],
      links = [],
      selectionBehavior = 'any'
    } = options;

    const card = {
      summary,
      detail,
      indicator,
      source,
      selectionBehavior
    };

    if (suggestions.length > 0) {
      card.suggestions = suggestions;
    }

    if (links.length > 0) {
      card.links = links;
    }

    return card;
  }

  /**
   * 建立建議（Suggestion）物件
   * @param {string} label - 建議標籤
   * @param {Object} uuid - 唯一識別碼
   * @param {Array} actions - 動作陣列
   * @returns {Object} 建議物件
   */
  createSuggestion(label, uuid, actions = []) {
    return {
      label,
      uuid,
      actions
    };
  }

  /**
   * 建立動作（Action）物件
   * @param {string} type - 動作類型（'create', 'update', 'delete', 'link'）
   * @param {string} description - 動作描述
   * @param {Object} resource - FHIR 資源（可選）
   * @param {string} url - 連結 URL（可選）
   * @returns {Object} 動作物件
   */
  createAction(type, description, resource = null, url = null) {
    const action = {
      type,
      description
    };

    if (resource) {
      action.resource = resource;
    }

    if (url) {
      action.url = url;
    }

    return action;
  }

  /**
   * 建立連結（Link）物件
   * @param {string} label - 連結標籤
   * @param {string} url - 連結 URL
   * @param {string} type - 連結類型（'absolute', 'smart'）
   * @param {string} appContext - 應用程式上下文（可選）
   * @returns {Object} 連結物件
   */
  createLink(label, url, type = 'absolute', appContext = null) {
    const link = {
      label,
      url,
      type
    };

    if (appContext) {
      link.appContext = appContext;
    }

    return link;
  }
}

/**
 * 預設的智慧提醒與警示 Hook 處理器
 * 用於御管轉診平台的智慧提醒與警示
 */
export class SmartAlertHookHandlers {
  /**
   * 建立數值超出上下限值警示
   * @param {Object} context - Hook 上下文
   * @param {Object} prefetch - 預取資料
   * @param {CDSHooksService} service - CDS Hooks 服務實例
   * @returns {Promise<Array>} 卡片陣列
   */
  static async handleValueOutOfRange(context, prefetch, service) {
    const { patientId } = context;
    const observations = prefetch.observations || [];

    const cards = [];
    const alerts = [];

    // 檢查血壓
    const bloodPressure = observations.find(obs => 
      obs.code?.coding?.[0]?.code === '85354-9'
    );
    if (bloodPressure) {
      const systolic = bloodPressure.component?.find(c => 
        c.code?.coding?.[0]?.code === '8480-6'
      )?.valueQuantity?.value;
      const diastolic = bloodPressure.component?.find(c => 
        c.code?.coding?.[0]?.code === '8462-4'
      )?.valueQuantity?.value;

      if (systolic > 140 || diastolic > 90) {
        alerts.push({
          type: '血壓異常',
          value: `${systolic}/${diastolic} mmHg`,
          threshold: '140/90 mmHg',
          severity: systolic > 160 || diastolic > 100 ? 'critical' : 'warning'
        });
      }
    }

    // 檢查血糖
    const bloodGlucose = observations.find(obs => 
      obs.code?.coding?.[0]?.code === '2339-0'
    );
    if (bloodGlucose) {
      const value = bloodGlucose.valueQuantity?.value;
      if (value > 126) {
        alerts.push({
          type: '血糖異常',
          value: `${value} mg/dL`,
          threshold: '126 mg/dL',
          severity: value > 200 ? 'critical' : 'warning'
        });
      }
    }

    // 建立警示卡片
    alerts.forEach(alert => {
      const card = service.createAlertCard({
        summary: `${alert.type}：數值超出正常範圍`,
        detail: `目前數值：${alert.value}，正常範圍上限：${alert.threshold}。建議立即追蹤處理。`,
        indicator: alert.severity,
        source: {
          label: '御管轉診平台 - 智慧提醒與警示'
        },
        suggestions: [
          service.createSuggestion(
            '查看詳細資料',
            `alert-${alert.type}-${Date.now()}`,
            [
              service.createAction(
                'link',
                '前往個案管理頁面',
                null,
                `${service.options.baseUrl}/dashboard/patient/${patientId}`
              )
            ]
          ),
          service.createSuggestion(
            '發送提醒通知',
            `notify-${alert.type}-${Date.now()}`,
            [
              service.createAction(
                'create',
                '建立提醒通知',
                {
                  resourceType: 'Communication',
                  status: 'completed',
                  subject: { reference: `Patient/${patientId}` },
                  payload: [{
                    contentString: `個案數值異常：${alert.type} ${alert.value}`
                  }]
                }
              )
            ]
          )
        ],
        links: [
          service.createLink(
            '查看完整健康記錄',
            `${service.options.baseUrl}/dashboard/observations/${patientId}`,
            'absolute'
          ),
          service.createLink(
            '聯絡個管師',
            `${service.options.baseUrl}/dashboard/contact/${patientId}`,
            'absolute'
          )
        ]
      });

      cards.push(card);
    });

    return cards;
  }

  /**
   * 建立特定期限或日期提醒
   * @param {Object} context - Hook 上下文
   * @param {Object} prefetch - 預取資料
   * @param {CDSHooksService} service - CDS Hooks 服務實例
   * @returns {Promise<Array>} 卡片陣列
   */
  static async handleScheduledReminder(context, prefetch, service) {
    const { patientId, userId } = context;
    const carePlans = prefetch.carePlans || [];
    const appointments = prefetch.appointments || [];

    const cards = [];
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // 檢查安寧共照首訪後七日提醒
    carePlans.forEach(plan => {
      if (plan.category?.[0]?.coding?.[0]?.code === 'hospice-care') {
        const startDate = new Date(plan.period?.start);
        const daysSinceStart = Math.floor((now - startDate) / (24 * 60 * 60 * 1000));
        
        if (daysSinceStart === 7) {
          const card = service.createAlertCard({
            summary: '安寧共照第二次訪視提醒',
            detail: `個案於 ${startDate.toLocaleDateString('zh-TW')} 完成首訪，今日為第七日，建議進行第二次訪視。`,
            indicator: 'info',
            source: {
              label: '御管轉診平台 - 智慧提醒與警示'
            },
            suggestions: [
              service.createSuggestion(
                '安排訪視',
                `schedule-visit-${Date.now()}`,
                [
                  service.createAction(
                    'create',
                    '建立訪視預約',
                    {
                      resourceType: 'Appointment',
                      status: 'proposed',
                      subject: { reference: `Patient/${patientId}` },
                      start: sevenDaysLater.toISOString(),
                      participant: [{
                        actor: { reference: `Practitioner/${userId}` },
                        status: 'accepted'
                      }]
                    }
                  )
                ]
              )
            ],
            links: [
              service.createLink(
                '查看個案資料',
                `${service.options.baseUrl}/dashboard/patient/${patientId}`,
                'absolute'
              )
            ]
          });

          cards.push(card);
        }
      }
    });

    // 檢查門診提醒
    appointments.forEach(appt => {
      const apptDate = new Date(appt.start);
      const daysUntilAppt = Math.floor((apptDate - now) / (24 * 60 * 60 * 1000));
      
      if (daysUntilAppt === 1) {
        const card = service.createAlertCard({
          summary: '明日門診提醒',
          detail: `個案預約於明日 ${apptDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })} 進行門診，請提醒個案準時返診。`,
          indicator: 'info',
          source: {
            label: '御管轉診平台 - 智慧提醒與警示'
          },
          suggestions: [
            service.createSuggestion(
              '發送提醒訊息',
              `send-reminder-${Date.now()}`,
              [
                service.createAction(
                  'create',
                  '建立提醒通知',
                  {
                    resourceType: 'Communication',
                    status: 'completed',
                    subject: { reference: `Patient/${patientId}` },
                    payload: [{
                      contentString: `提醒：明日 ${apptDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })} 有門診預約，請準時返診。`
                    }]
                  }
                )
              ]
            )
          ],
          links: [
            service.createLink(
              '查看預約詳情',
              `${service.options.baseUrl}/dashboard/appointment/${appt.id}`,
              'absolute'
            )
          ]
        });

        cards.push(card);
      }
    });

    return cards;
  }

  /**
   * 建立特定族群提醒
   * @param {Object} context - Hook 上下文
   * @param {Object} prefetch - 預取資料
   * @param {CDSHooksService} service - CDS Hooks 服務實例
   * @returns {Promise<Array>} 卡片陣列
   */
  static async handlePopulationBasedReminder(context, prefetch, service) {
    const { patientId } = context;
    const patient = prefetch.patient;
    const conditions = prefetch.conditions || [];

    const cards = [];

    // 檢查早期 CKD 個案
    const ckdCondition = conditions.find(cond => 
      cond.code?.coding?.[0]?.code === '42399005' || // Chronic kidney disease
      cond.code?.text?.includes('慢性腎臟病')
    );

    if (ckdCondition) {
      const card = service.createAlertCard({
        summary: '早期 CKD 個案轉診提醒',
        detail: '此個案為早期慢性腎臟病（CKD）個案，建議轉診至腎臟科門診進行專業追蹤。',
        indicator: 'warning',
        source: {
          label: '御管轉診平台 - 智慧提醒與警示'
        },
        suggestions: [
          service.createSuggestion(
            '建立轉診單',
            `referral-ckd-${Date.now()}`,
            [
              service.createAction(
                'create',
                '建立轉診單',
                {
                  resourceType: 'ServiceRequest',
                  status: 'draft',
                  intent: 'order',
                  subject: { reference: `Patient/${patientId}` },
                  code: {
                    coding: [{
                      system: 'http://snomed.info/sct',
                      code: '306206005',
                      display: '轉診至專科'
                    }]
                  }
                }
              )
            ]
          )
        ],
        links: [
          service.createLink(
            '查看個案完整資料',
            `${service.options.baseUrl}/dashboard/patient/${patientId}`,
            'absolute'
          ),
          service.createLink(
            '腎臟科門診資訊',
            `${service.options.baseUrl}/dashboard/specialty/nephrology`,
            'absolute'
          )
        ]
      });

      cards.push(card);
    }

    // 檢查抽菸個案
    const smokingObservation = prefetch.observations?.find(obs =>
      obs.code?.coding?.[0]?.code === '72166-2' || // Tobacco smoking status
      obs.code?.text?.includes('抽菸')
    );

    if (smokingObservation?.valueCodeableConcept?.coding?.[0]?.code === '428041000124106') { // Current smoker
      const card = service.createAlertCard({
        summary: '戒菸門診提醒',
        detail: '此個案目前有抽菸習慣，建議提供戒菸門診資訊並追蹤就醫情況。',
        indicator: 'info',
        source: {
          label: '御管轉診平台 - 智慧提醒與警示'
        },
        suggestions: [
          service.createSuggestion(
            '發送戒菸資訊',
            `smoking-info-${Date.now()}`,
            [
              service.createAction(
                'create',
                '建立衛教資料',
                {
                  resourceType: 'Communication',
                  status: 'completed',
                  subject: { reference: `Patient/${patientId}` },
                  payload: [{
                    contentString: '戒菸門診資訊：建議您前往戒菸門診尋求專業協助，可提高戒菸成功率。'
                  }]
                }
              )
            ]
          )
        ],
        links: [
          service.createLink(
            '戒菸門診查詢',
            `${service.options.baseUrl}/dashboard/smoking-cessation`,
            'absolute'
          )
        ]
      });

      cards.push(card);
    }

    return cards;
  }
}

/**
 * 建立預設的 CDS Hooks 服務實例（用於御管轉診平台）
 * @param {Object} options - 選項
 * @returns {CDSHooksService} CDS Hooks 服務實例
 */
export function createSmartAlertService(options = {}) {
  const service = new CDSHooksService(options);

  // 註冊預設的 Hook 處理器
  service.registerHook('patient-view', async (context, prefetch, svc) => {
    const cards = [];
    
    // 數值超出上下限值警示
    const valueAlerts = await SmartAlertHookHandlers.handleValueOutOfRange(context, prefetch, svc);
    cards.push(...valueAlerts);

    // 特定期限或日期提醒
    const scheduledReminders = await SmartAlertHookHandlers.handleScheduledReminder(context, prefetch, svc);
    cards.push(...scheduledReminders);

    // 特定族群提醒
    const populationReminders = await SmartAlertHookHandlers.handlePopulationBasedReminder(context, prefetch, svc);
    cards.push(...populationReminders);

    return cards;
  });

  // 設定預寫資料範例
  service.setPredefinedData('default-alert-templates', {
    'blood-pressure-high': {
      summary: '血壓數值異常',
      detail: '個案血壓連續多日超標，建議立即追蹤處理。',
      indicator: 'critical'
    },
    'blood-glucose-high': {
      summary: '血糖數值異常',
      detail: '個案血糖值超出正常範圍，建議追蹤處理。',
      indicator: 'warning'
    },
    'visit-reminder': {
      summary: '訪視提醒',
      detail: '個案已達預定訪視時間，請安排訪視。',
      indicator: 'info'
    },
    'appointment-reminder': {
      summary: '門診提醒',
      detail: '個案有預約門診，請提醒準時返診。',
      indicator: 'info'
    }
  });

  return service;
}
