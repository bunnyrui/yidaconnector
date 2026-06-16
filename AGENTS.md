# OpenYida — AI Agent 开发指引

OpenYida 是宜搭低代码平台的 CLI 桥接层：`bin/yida.js`（CommonJS）把命令分发到 `lib/` 下各模块。本文件只记录容易踩坑的约定，不重复文件名即可推断的内容。更完整的介绍见 `README.md` / `CLAUDE.md`。

## 仓库布局与包边界（关键）

- **根项目 = 纯 JS CLI**：CommonJS（`require` / `module.exports`），Node ≥18，**无构建步骤、无 TypeScript、无打包**。`lib/` 直接被 `require`，改完即可运行；不要引入需要编译的依赖。
- **`mcp-app/` 是独立子包**：ESM + TypeScript，有自己的 `package.json`、`package-lock.json`、`vite` + `tsc` 构建。CI 里它单独构建（`npm --prefix mcp-app run build`）。绝不要把 `mcp-app` 的代码风格或依赖带进 `lib/`，反之亦然。
- **`lib/mcp/` ≠ `mcp-app/`**：`lib/mcp/server.js` 是 CLI 自带的 MCP JSON-RPC 服务（`openyida mcp` 调用）；`mcp-app/` 是 TypeScript 写的可交互 MCP App（Claude/ChatGPT UI host 用）。
- **`lib/` 每个子目录是一个命令域**（如 `auth/`、`app/`、`process/`、`connector/`、`report/`），文件名通常即命令名。具体目录用 `ls lib/` 查看，不在此罗列。
- `tests/`（Jest）与 `scripts/`（校验/构建脚本）在根下；`project/` 是用户工作区模板。

## 新增 / 修改 CLI 命令（最易出错）

新增一条命令必须**同时**改这几处，缺一会导致 help、`commands` JSON、实际执行三者不一致：

1. `lib/core/command-manifest.js` —— 命令元数据（用法、描述 key、output 类型、aliases）。这是 `openyida --help` 与 `openyida commands`（输出 JSON，供 AI agent 消费的命令清单）的**唯一数据源**。
2. `bin/yida.js` —— 在 `switch` 里加 `case '<cmd>'`，`require` 实现文件做分发。
3. `lib/<域>/<cmd>.js` —— 实现，导出 `module.exports = async function(args) {}`。
4. `README.md` —— 命令一览表。
5. `lib/core/locales/` 全部 12 个语言包 —— 至少补 help 文案 key（`help.cmd_<name>` 等）。

错误处理：抛 `lib/core/cli-error.js` 的 `CliError`，或 `console.error(...)` + `process.exit(1)`，错误信息走 stderr。

## 开发命令

- **改动后必跑的全量校验（发布门禁）**：`npm run check:ci`（11 步：结构 → skills → 命令清单 → 命令文档 → build:skills → 语法 → lint → test → 包大小预算 → `npm pack` 干跑）。推送 tag / 发版前**必须**本地通过，避免 CI 中断发布。
- **单测**：`npx jest tests/utils.test.js`，或按片段过滤 `npm test -- utils`。CI 跑测试用 `--runInBand`。
- **语法快检**：`node --check lib/xxx.js`（对应 `npm run check:syntax`）。
- **lint**：`npm run lint` / `npm run lint:fix`。规则见 `.eslintrc.json`：2 空格缩进、单引号、强制分号、`===`、unix 换行、`prefer-const`；`lib/core/babel-transform/`、`project/pages/dist/`、`*.compile.js` 被忽略。
- **技能包**：改 `yida-skills/` 后跑 `npm run check:skills` 与 `npm run build:skills`。
- Node 版本：本地 ≥18；CI 矩阵跑 18/20/22/24，验证 job 用 Node 20。

## 终端输出与文案约定

- **统一**用 `lib/core/chalk.js` 的公共样式；不要在各命令里单独 `require('chalk')` 自定义颜色。
- 新增任何用户可见文案，需在 `lib/core/locales/` 全部 **12 个**语言包（zh、en、zh-HK、ja、ko、fr、de、es、pt、ar、hi、vi）补齐对应 key。
- 不要在代码里硬编码 Cookie / Token / corpId 等凭证；登录态走 `lib/auth/` 的缓存。
- 私有化部署的 API 域名走 `lib/core/env-manager.js`（多环境切换），不要在命令文件里硬编码域名。

## 环境检测与登录（按 AI 工具区分）

`lib/core/env.js` 检测 Codex / Claude Code / Cursor / Copilot / OpenCode / Qoder / 悟空 等；不同环境 Cookie 抓取方式不同（CDP 协议 / 文件读取 / 扫码）。登录实现见 `lib/auth/login.js`、`lib/auth/codex-login.js`、`lib/auth/qr-login.js`。

**Codex 登录 flag 语义易混：**
- `openyida login`：默认缓存优先；无缓存走本地 Chrome/Edge/Chromium CDP；CDP 不可用则返回 AI 对话框二维码 handoff。默认**不**依赖 Playwright。
- `openyida login --browser`：CDP 不可用时才用 Playwright 兜底。
- `openyida login --qr`：强制终端二维码（测试二维码链路专用）。
- `openyida login --agent-qr`：强制 AI 对话框二维码 handoff。
- 多组织账号：**显式**传 `--corp-id <corpId>`，不要由 AI 代选组织。

**悟空（Wukong）：**
- 工作区根目录**必须**读 `AGENT_WORK_ROOT` 环境变量（路径含动态 uuid `~/.real/users/{uuid}/workspace/`），绝不能硬编码 `~/.real/workspace/`。`lib/core/utils.js` 的 `detectActiveTool()` 即据此判断。
- 执行任何 `npm`/`node`/`npx` 前**必须**先把悟空自带 node 加进 PATH，否则会调到系统 node 报权限错：
  - macOS/Linux：`export PATH="$HOME/.real/.bin/node/bin:$PATH"`
  - Windows (PowerShell)：`$env:PATH = "$env:USERPROFILE\.real\.bin\node\bin;$env:PATH"`
- `openyida copy` 在**空目录**中会直接把 `project/` 内容铺入当前目录（不创建 `project/` 子层级）。
- 悟空通过手动上传技能包安装；`postinstall` **不**会自动装 `yida-skills/`。

## yida-skills 双输出架构

- **源码态**在 `yida-skills/`（与历史安装路径、Codex/OpenYida 插件兼容）；**对外发布的悟空 zip** 由 `npm run build:skills` 生成到 `dist/skills/openyida/`（同时输出 `openyida-skills.zip`）。
- `yida-skills/SKILL.md` 是索引表（列出所有子技能 + 共享参考文档）。为兼容悟空上传规范，**根 frontmatter 只能包含 `name` 和 `description`**。
- 子技能自包含在 `yida-skills/skills/<name>/SKILL.md`，专属参考文档放同目录 `references/`（复数形式）；跨 skill 共享文档在 `yida-skills/references/`（`yida-api.md`、`model-api.md`、`query-condition-guide.md`）。生成的悟空包会把子技能文档转写到 `references/subskills/`。
- 新增子技能：建目录 → 在 `yida-skills/SKILL.md` 索引表加一行 → 跑 `check:skills` + `build:skills`。AGENTS.md 无需再手动加行。
- 除非明确在更新技能本身，**不要**改 `yida-skills/` 下文档。

## 自定义页面

- 源码在 `project/pages/src/`（React + 宜搭 SDK）；发布前经 `lib/core/babel-transform/` 用 Babel 转译到 `project/pages/dist/`（对应 `compile` / `publish` 命令）。
- `mcp-app` 的视图构建是另一套（vite + `vite-plugin-singlefile`），不要与上面混淆。

## 调试入口

- 环境/登录问题：先 `openyida env` 确认检测，再看 `lib/auth/`。
- 命令不生效 / help 不显示：检查 `lib/core/command-manifest.js` 是否登记，以及 `bin/yida.js` 的 `case`。
- 完整 API 参考：`yida-skills/references/yida-api.md`。
