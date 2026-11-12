import { resolvePath } from "../../examples/demo-server.js";

describe("demo-server 路徑檢查", () => {
  test("根路徑導向演示頁，一般檔案可讀", () => {
    expect(resolvePath("/")).toMatch(/smart-flow-demo\.html$/);
    expect(resolvePath("/src/smart-auth.js")).toMatch(/smart-auth\.js$/);
  });

  test("擋下隱藏檔與跳出專案目錄的路徑", () => {
    expect(resolvePath("/.git/config")).toBeNull();
    expect(resolvePath("/examples/../../etc/passwd")).toBeNull();
    expect(resolvePath("/%2e%2e/%2e%2e/etc/passwd")).toBeNull();
  });
});
