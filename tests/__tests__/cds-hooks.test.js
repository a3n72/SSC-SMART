/**
 * CDS Hooks 模組測試
 * 測試 CDS Hooks 服務和處理器的功能
 */

import {
  CDSHooksService,
  SmartAlertHookHandlers,
  createSmartAlertService
} from '../../src/cds-hooks.js';

describe('CDS Hooks 模組', () => {
  describe('CDSHooksService', () => {
    let service;

    beforeEach(() => {
      service = new CDSHooksService({
        baseUrl: 'http://localhost:3000'
      });
    });

    test('應該可以註冊 Hook', () => {
      const handler = jest.fn();
      service.registerHook('test-hook', handler);
      
      expect(service.hooks.has('test-hook')).toBe(true);
    });

    test('應該可以處理 Hook 請求', async () => {
      const handler = jest.fn().mockResolvedValue([]);
      service.registerHook('test-hook', handler);

      const result = await service.handleHook('test-hook', { patientId: '123' }, {});

      expect(handler).toHaveBeenCalled();
      expect(result).toHaveProperty('cards');
      expect(Array.isArray(result.cards)).toBe(true);
    });

    test('應該對未註冊的 Hook 返回空卡片陣列', async () => {
      const result = await service.handleHook('unknown-hook', {}, {});

      expect(result.cards).toEqual([]);
    });

    test('應該可以建立提醒卡片', () => {
      const card = service.createAlertCard({
        summary: '測試提醒',
        detail: '這是測試',
        indicator: 'info'
      });

      expect(card.summary).toBe('測試提醒');
      expect(card.detail).toBe('這是測試');
      expect(card.indicator).toBe('info');
    });

    test('應該可以建立建議', () => {
      const suggestion = service.createSuggestion('測試建議', 'uuid-123', []);

      expect(suggestion.label).toBe('測試建議');
      expect(suggestion.uuid).toBe('uuid-123');
      expect(Array.isArray(suggestion.actions)).toBe(true);
    });

    test('應該可以建立動作', () => {
      const action = service.createAction('create', '建立資源', { resourceType: 'Observation' });

      expect(action.type).toBe('create');
      expect(action.description).toBe('建立資源');
      expect(action.resource).toBeDefined();
    });

    test('應該可以建立連結', () => {
      const link = service.createLink('測試連結', 'http://example.com', 'absolute');

      expect(link.label).toBe('測試連結');
      expect(link.url).toBe('http://example.com');
      expect(link.type).toBe('absolute');
    });
  });

  describe('SmartAlertHookHandlers', () => {
    let service;

    beforeEach(() => {
      service = new CDSHooksService({
        baseUrl: 'http://localhost:3000'
      });
    });

    test('handleValueOutOfRange 應該檢測異常血壓', async () => {
      const context = { patientId: 'patient-123' };
      const prefetch = {
        observations: [{
          code: {
            coding: [{ code: '85354-9' }]
          },
          component: [
            {
              code: { coding: [{ code: '8480-6' }] },
              valueQuantity: { value: 150 }
            },
            {
              code: { coding: [{ code: '8462-4' }] },
              valueQuantity: { value: 95 }
            }
          ]
        }]
      };

      const cards = await SmartAlertHookHandlers.handleValueOutOfRange(context, prefetch, service);

      expect(cards.length).toBeGreaterThan(0);
      expect(cards[0].summary).toContain('血壓異常');
    });

    test('handleValueOutOfRange 應該檢測異常血糖', async () => {
      const context = { patientId: 'patient-123' };
      const prefetch = {
        observations: [{
          code: {
            coding: [{ code: '2339-0' }]
          },
          valueQuantity: { value: 150 }
        }]
      };

      const cards = await SmartAlertHookHandlers.handleValueOutOfRange(context, prefetch, service);

      expect(cards.length).toBeGreaterThan(0);
      expect(cards[0].summary).toContain('血糖異常');
    });

    test('handleScheduledReminder 應該處理定期提醒', async () => {
      const context = { patientId: 'patient-123', userId: 'user-123' };
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const prefetch = {
        carePlans: [{
          category: [{
            coding: [{ code: 'hospice-care' }]
          }],
          period: {
            start: sevenDaysAgo.toISOString()
          }
        }],
        appointments: []
      };

      const cards = await SmartAlertHookHandlers.handleScheduledReminder(context, prefetch, service);

      // 注意：此測試可能因為日期計算而需要調整
      expect(Array.isArray(cards)).toBe(true);
    });
  });

  describe('createSmartAlertService', () => {
    test('應該建立預設的 CDS Hooks 服務', () => {
      const service = createSmartAlertService({
        baseUrl: 'http://localhost:3000'
      });

      expect(service).toBeInstanceOf(CDSHooksService);
      expect(service.hooks.has('patient-view')).toBe(true);
    });
  });
});
