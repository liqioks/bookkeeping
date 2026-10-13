# 打工人小账本 · 项目长期备忘

## 工程位置（易错）

- 本机实际工程目录：**`D:\论月\dagonngrProject`**
- 文档（README / 交接文档）里写的 `E:\dagongrProject` 是**旧路径**，脚本已改为自动推导，不用改。
- 工具链：JDK 21 → `D:\app\jdk21`；Android SDK → `D:\app\android-sdk`。

## 不可破坏的约定

1. **双端分流**：`var db = CLOUD_DB || new LocalDB()`。网页版走云端 SDK，App 走 IndexedDB。
   改页面**绝不要**硬编码 `db = CLOUD_DB`，也不要让 App 依赖 `inject.js`。
   新增读写一律通过 `db` 变量。

2. **成员隔离**：所有业务数据（流水 / 设置 / 月度）都带 `u` 字段，查询一律经 `uFilter()` 过滤。
   任何「按成员切换」的逻辑，必须同时重置：
   `state.u` / `state.flow` / `state.extraFlow` / `state.agg` / `state.settings` / `state.range`。
   已在 `switchToUser(u)` 里统一处理 —— **新增入口请复用它，不要自己写一套**。

3. **源页面与 www 必须同步**：`打工人小账本.html`（含 inject.js 的源副本）↔ `www/index.html`（去 inject.js + viewport-fit）。
   改完用 `python prepare-page.py` 同步；若改动是在 App 端做的，用 `python prepare-page.py --reverse` 回写设计端副本。

4. **同一功能多入口必须共用一份实现**：例「切换用户」有侧栏 `#navSwitchUser` 和
   驾驶舱数据卡 `#d-switch-user` 两个入口，都只调 `switchUserOut()`。
   各写一套清理逻辑迟早漂移，会出现「某个入口切得干净、另一个切不干净」这类只在单入口复现的 bug。

5. **`switchUserOut()` = 退出登录，不是清空数据**：只清内存身份 + 缓存，不删库。
   要真做「清空全部数据」须另起函数 + 二次确认。

6. **页面整段在 IIFE 里**（`www/index.html` 第 1134 行起），外部拿不到内部变量。
   末尾挂了只读调试句柄 `window.__ledgerDebug`（`state` getter / `switchToUser` / `switchUserOut` /
   `openGate` / `closeGate`）。它只作诊断用，不要当业务 API。

7. **改完必须 `cap sync android`**：只跑 `gradlew` 会复用旧 assets，APK 里的页面是旧的。
   `build-apk.py` / `build-release.py` 已把这一步固化。

## 关键坑（详见 交接文档.md §9）

- **改完页面必须跑语法校验**：`new Function(内联脚本)`。页面渲染正常 ≠ 脚本能跑；
  内联脚本一旦有语法错误，整页按钮全部失效（渲染出来但没有事件绑定）。
- **往 HTML 插标签别用裸 `</body>` 当锚点**：页面 JS 里 `writeDownloadWindow()`
  的拼接字符串含 `'</body></html>'`，会被误伤，造成跨行字符串断裂。
  `prepare-page.py` 已内置该形态的自检。
- **导入去重必须用归一化指纹**：日期一律 `dedupDate()` 截到「天」
  （库内带时分 vs 导入纯日期会漏判），备注一律 `dedupText()` 清空白噪声，
  单号一律 `dedupNo()` 折叠大小写。两条导入路径
  （`importFlowRows` 备份、`importBillRows` 账单）**规则必须一致**：
  「外部单号命中 或 字段指纹命中 → 跳过」。改一处务必改另一处。
- **`dedupText` 不折叠全角/大小写**：中文备注全角半角语义可能不同，**误合并比漏合并更糟**。
  只有外部单号折叠大小写。别为「提升去重率」去动它。
- `LocalDB.query` 的 `nextCursor` 必须是**真实游标**，否则超过 pageSize 的数据会静默丢失。
- `LocalDB.deleteRecord` 必须按 `databaseId` 定桶再删（四桶共用一张 records 表）。
- `cap sync` 需 `NODE_OPTIONS=''` + `CODEBUDDY_SAFE_DELETE_ENABLED=0`，否则清理步骤超时。
- 工程路径含中文需 `android.overridePathCheck=true`。
- `local.properties` / `keystore.properties` 都是 gitignore，新机器必须重建。

## 真实浏览器验证（推荐做法）

- `agent-browser` 已装（Chromium 在 `C:\Users\Administrator\.agent-browser\browsers\`），
  但其守护进程在本机会挂起，**不推荐直接用**。
- 可靠做法：自写 Node 脚本走 CDP（内置 `http` + `net` + 手写最小 WebSocket，无需 ws 包），
  驱动 `chrome.exe --headless=new --remote-debugging-port=XXXX`，
  监听 `Runtime.exceptionThrown` 与 `console.error`，并可 `Runtime.evaluate` 模拟点击验证交互。

## 签名（升级的唯一凭证）

- 密钥库 `keystore/dagongr-release.jks`，口令见 `keystore/签名信息.md`。
- 证书 SHA-256：`5ec9700a6268e55cb77b8ecba0be5174d5b530780b327e571fa06c1ef5c23288`
- **务必保持签名一致**，否则已安装用户无法覆盖升级（须卸载重装，会丢通知使用权等权限）。
- 当前版本：1.0.9（versionCode 10）。
