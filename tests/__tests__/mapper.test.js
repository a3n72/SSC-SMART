/**
 * Mapper 模組測試
 * 測試 888 數據轉換為 FHIR Observation 的功能
 */

import {
  mapBloodPressure,
  mapBloodGlucose,
  mapBodyWeight,
  mapStepCount,
  mapBodyTemperature,
  mapHeartRate,
  mapObservation
} from '../../src/mapper.js';

describe('Mapper 模組', () => {
  const testPatientId = 'patient-123';
  const testDate = new Date('2024-01-01T10:00:00Z');

  describe('mapBloodPressure', () => {
    test('應該正確轉換血壓數據', () => {
      const result = mapBloodPressure(120, 80, testPatientId, testDate);

      expect(result.resourceType).toBe('Observation');
      expect(result.status).toBe('final');
      expect(result.subject.reference).toBe(`Patient/${testPatientId}`);
      expect(result.component).toHaveLength(2);
      expect(result.component[0].valueQuantity.value).toBe(120);
      expect(result.component[1].valueQuantity.value).toBe(80);
    });

    test('應該使用正確的 LOINC 代碼', () => {
      const result = mapBloodPressure(120, 80, testPatientId, testDate);

      expect(result.code.coding[0].code).toBe('85354-9');
      expect(result.component[0].code.coding[0].code).toBe('8480-6');
      expect(result.component[1].code.coding[0].code).toBe('8462-4');
    });
  });

  describe('mapBloodGlucose', () => {
    test('應該正確轉換血糖數據（空腹）', () => {
      const result = mapBloodGlucose(95, testPatientId, '空腹', testDate);

      expect(result.resourceType).toBe('Observation');
      expect(result.code.coding[0].code).toBe('33747-0');
      expect(result.valueQuantity.value).toBe(95);
      expect(result.valueQuantity.unit).toBe('mg/dL');
    });

    test('應該正確轉換血糖數據（飯後）', () => {
      const result = mapBloodGlucose(140, testPatientId, '飯後', testDate);

      expect(result.code.coding[0].code).toBe('33748-8');
    });

    test('應該預設為隨機血糖', () => {
      const result = mapBloodGlucose(100, testPatientId, '隨機', testDate);

      expect(result.code.coding[0].code).toBe('2339-0');
    });
  });

  describe('mapBodyWeight', () => {
    test('應該正確轉換體重數據', () => {
      const result = mapBodyWeight(65.5, testPatientId, testDate);

      expect(result.resourceType).toBe('Observation');
      expect(result.code.coding[0].code).toBe('29463-7');
      expect(result.valueQuantity.value).toBe(65.5);
      expect(result.valueQuantity.unit).toBe('kg');
    });
  });

  describe('mapStepCount', () => {
    test('應該正確轉換步數數據', () => {
      const result = mapStepCount(5000, testPatientId, testDate);

      expect(result.resourceType).toBe('Observation');
      expect(result.code.coding[0].code).toBe('55423-8');
      expect(result.valueQuantity.value).toBe(5000);
      expect(result.valueQuantity.unit).toBe('steps');
    });
  });

  describe('mapBodyTemperature', () => {
    test('應該正確轉換體溫數據', () => {
      const result = mapBodyTemperature(36.5, testPatientId, testDate);

      expect(result.resourceType).toBe('Observation');
      expect(result.code.coding[0].code).toBe('8310-5');
      expect(result.valueQuantity.value).toBe(36.5);
      expect(result.valueQuantity.unit).toBe('°C');
    });
  });

  describe('mapHeartRate', () => {
    test('應該正確轉換心率數據', () => {
      const result = mapHeartRate(72, testPatientId, testDate);

      expect(result.resourceType).toBe('Observation');
      expect(result.code.coding[0].code).toBe('8867-4');
      expect(result.valueQuantity.value).toBe(72);
      expect(result.valueQuantity.unit).toBe('次/分鐘');
    });
  });

  describe('mapObservation', () => {
    test('應該正確映射血壓類型', () => {
      const result = mapObservation('blood-pressure', { systolic: 120, diastolic: 80 }, testPatientId, testDate);

      expect(result.resourceType).toBe('Observation');
      expect(result.component).toHaveLength(2);
    });

    test('應該正確映射血糖類型', () => {
      const result = mapObservation('blood-glucose', { value: 95, type: '空腹' }, testPatientId, testDate);

      expect(result.code.coding[0].code).toBe('33747-0');
    });

    test('應該對不支援的類型拋出錯誤', () => {
      expect(() => {
        mapObservation('unknown-type', 100, testPatientId, testDate);
      }).toThrow('不支援的觀測類型');
    });
  });
});
