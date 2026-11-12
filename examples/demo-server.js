// 課堂演示用的靜態檔案伺服器：只用 Node 內建模組，不需要 npm install。
// 用法：npm run demo   （或 node examples/demo-server.js）
import { createServer } from "http";
import { readFile } from "fs/promises";
import { dirname, extname, join, normalize, sep } from "path";
import { fileURLToPath } from "url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const port = Number(process.env.PORT || 8000);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

export function resolvePath(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  // 不提供隱藏檔（.git、.smart-test 等），也不允許跳出專案目錄
  if (decoded.split("/").some((part) => part.startsWith("."))) return null;
  const file = normalize(join(root, decoded === "/" ? "/examples/smart-flow-demo.html" : decoded));
  return file === root || file.startsWith(root + sep) ? file : null;
}

const server = createServer(async (req, res) => {
  let file = null;
  try { file = resolvePath(new URL(req.url, "http://localhost").pathname); } catch { /* 網址格式錯誤 */ }
  if (!file) { res.writeHead(403).end("Forbidden"); return; }
  try {
    const data = await readFile(file);
    res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(data);
  } catch {
    res.writeHead(404).end("Not found");
  }
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // 只綁本機，教室網路上的其他電腦連不進來
  server.listen(port, "127.0.0.1", () => {
    console.log(`演示頁：http://localhost:${port}/examples/smart-flow-demo.html`);
    console.log("按 Ctrl+C 停止");
  });
}
