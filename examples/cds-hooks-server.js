/**
 * CDS Hooks 服務端範例
 * 實作 HL7 FHIR CDS Hooks 標準的服務端端點
 * 用於御管轉診平台的智慧提醒與警示
 * 
 * 使用方式：
 * node examples/cds-hooks-server.js
 * 
 * 服務端點：
 * - GET  /cds-services - 列出所有可用的 CDS Hooks
 * - POST /cds-services/patient-view - 處理 patient-view hook
 * - POST /cds-services/order-select - 處理 order-select hook（可選）
 */

import express from 'express';
import cors from 'cors';
import { createSmartAlertService, SmartAlertHookHandlers } from '../src/cds-hooks.js';
import { createServer } from 'http';

const app = express();
const DEFAULT_PORT = 3000;
const PORT = process.env.PORT || DEFAULT_PORT;

// 中間件
app.use(cors());
app.use(express.json());

// 建立 CDS Hooks 服務實例
const cdsService = createSmartAlertService({
  baseUrl: `http://localhost:${PORT}`
});

// CDS Hooks 服務發現端點
// GET /cds-services
app.get('/cds-services', (req, res) => {
  res.json({
    services: [
      {
        hook: 'patient-view',
        title: '病人檢視提醒',
        description: '當檢視病人資料時，提供智慧提醒與警示',
        id: 'smart-alert-patient-view',
        prefetch: {
          patient: 'Patient/{{context.patientId}}',
          observations: 'Observation?subject=Patient/{{context.patientId}}&_sort=-date&_count=10',
          conditions: 'Condition?subject=Patient/{{context.patientId}}',
          carePlans: 'CarePlan?subject=Patient/{{context.patientId}}'
        }
      },
      {
        hook: 'order-select',
        title: '醫囑選擇提醒',
        description: '當選擇醫囑時，提供相關提醒與建議',
        id: 'smart-alert-order-select',
        prefetch: {
          patient: 'Patient/{{context.patientId}}',
          medications: 'MedicationStatement?subject=Patient/{{context.patientId}}'
        }
      }
    ]
  });
});

// Patient View Hook 端點
// POST /cds-services/patient-view
app.post('/cds-services/patient-view', async (req, res) => {
  try {
    const { hook, hookInstance, context, prefetch } = req.body;

    console.log('收到 patient-view hook 請求:', {
      hookInstance,
      patientId: context?.patientId,
      userId: context?.userId
    });

    // 處理 Hook 並取得卡片
    const response = await cdsService.handleHook('patient-view', context || {}, prefetch || {});

    console.log(`返回 ${response.cards.length} 個提醒卡片`);

    res.json(response);
  } catch (error) {
    console.error('處理 patient-view hook 時發生錯誤:', error);
    res.status(500).json({
      error: '處理請求時發生錯誤',
      message: error.message
    });
  }
});

// Order Select Hook 端點（可選）
// POST /cds-services/order-select
app.post('/cds-services/order-select', async (req, res) => {
  try {
    const { hook, hookInstance, context, prefetch } = req.body;

    console.log('收到 order-select hook 請求:', {
      hookInstance,
      patientId: context?.patientId,
      selections: context?.selections
    });

    // 這裡可以實作醫囑選擇相關的提醒邏輯
    const response = {
      cards: []
    };

    res.json(response);
  } catch (error) {
    console.error('處理 order-select hook 時發生錯誤:', error);
    res.status(500).json({
      error: '處理請求時發生錯誤',
      message: error.message
    });
  }
});

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'CDS Hooks Service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 嘗試啟動伺服器，如果端口被占用則嘗試其他端口
function startServer(port) {
  const server = createServer(app);
  
  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      resolve({ server, port });
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // 端口被占用，嘗試下一個端口
        if (port < DEFAULT_PORT + 10) {
          console.log(`端口 ${port} 已被占用，嘗試使用端口 ${port + 1}...`);
          startServer(port + 1).then(resolve).catch(reject);
        } else {
          reject(new Error(`無法找到可用端口。已嘗試端口 ${DEFAULT_PORT} 到 ${port}。請手動指定端口：PORT=3001 node examples/cds-hooks-server.js`));
        }
      } else {
        reject(err);
      }
    });
  });
}

// 啟動伺服器
startServer(PORT).then(({ server, port: actualPort }) => {
  // 更新 baseUrl 以反映實際使用的端口
  cdsService.options.baseUrl = `http://localhost:${actualPort}`;
  
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   CDS Hooks 服務端已啟動                                 ║
║   御管轉診平台 - 智慧提醒與警示                           ║
╠═══════════════════════════════════════════════════════════╣
║   服務端點：                                              ║
║   - 服務發現: GET  http://localhost:${actualPort}/cds-services    ║
║   - Patient View: POST http://localhost:${actualPort}/cds-services/patient-view ║
║   - Order Select: POST http://localhost:${actualPort}/cds-services/order-select ║
║   - 健康檢查: GET  http://localhost:${actualPort}/health        ║
╠═══════════════════════════════════════════════════════════╣
║   前端 Dashboard:                                        ║
║   http://localhost:8000/examples/cds-hooks-dashboard.html║
╚═══════════════════════════════════════════════════════════╝
  `);
}).catch((error) => {
  console.error('❌ 啟動伺服器失敗:', error.message);
  console.error('\n💡 解決方案：');
  console.error('   1. 關閉占用端口 3000 的其他程式');
  console.error('   2. 或使用其他端口：PORT=3001 node examples/cds-hooks-server.js');
  console.error('   3. 或使用 Windows 命令查看占用端口的程式：');
  console.error('      netstat -ano | findstr :3000');
  process.exit(1);
});

// 優雅關閉
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM，正在關閉伺服器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到 SIGINT，正在關閉伺服器...');
  process.exit(0);
});
