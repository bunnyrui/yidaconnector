---
name: yidaconnector
description: >
  宜搭数据查询与登录态管理技能。通过有 AI Coding 能力的智能体（悟空/Claude/Open Code 等）查询宜搭表单、流程、任务数据并管理登录态。
  包含表单/流程/任务/子表单数据查询、登录、登出、环境检测等能力。
  当用户提到"宜搭"、"yida"、"查询数据"、"表单数据"、"流程数据"、"登录宜搭"等关键词时，使用此技能；以下情况不要触发：只是讨论通用前端/后端代码、非宜搭平台产品、或只需要解释概念而不操作宜搭资源。
---

# 宜搭数据查询与登录态管理指南

## 概述

本技能通过有 AI Coding 能力的智能体（悟空/Claude/Open Code 等）查询宜搭低代码平台的表单、流程、任务数据，并管理登录态。

所有操作通过 **`yidaconnector`** 命令行工具统一执行，无需关心脚本路径或运行环境差异。

**登录态说明**：所有命令自动读取 `.cache/cookies.json`，首次运行或 Cookie 失效时自动触发登录流程，也可手动执行登录命令。

---

## 环境依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| Node.js | ≥ 16 | 运行 yidaconnector |

```bash
# 安装 yidaconnector（首次使用前执行）
npm install -g yidaconnector

# 更新 yidaconnector 到最新版本
npm install -g yidaconnector@latest
```

---

## ⚡ 首要步骤：检测运行环境（必须先执行）

**在执行任何宜搭操作前，必须先运行环境检测命令**，确认当前 AI 工具环境和登录态：

```bash
yidaconnector env --json
yidaconnector login --check-only --json
```

`yidaconnector env --json` 用于确认当前 AI 工具、项目根目录、配置文件和登录态拆解项；`yidaconnector login --check-only --json` 只读取本地登录缓存，不触发登录、不打开浏览器、不创建任何资源。

若用户明确要求登录某个宜搭入口 URL，登录命令必须携带该 URL 或对应环境 flag。例如 `https://yida-group.alibaba-inc.com/` 是阿里内网宜搭，应执行 `yidaconnector login https://yida-group.alibaba-inc.com/` 或 `yidaconnector login --alibaba`，不要退化成裸 `yidaconnector login`，否则会落到默认公有云 `www.aliwork.com`。

**输出解读**：

| 字段 | 说明 |
|------|------|
| AI 工具检测 | 显示当前活跃的 AI 工具（悟空/OpenCode/Aone Copilot 等） |
| 当前生效环境 | 显示项目根目录路径 |
| 登录态检测 | 显示是否已登录、域名、组织 ID |

> **若显示"未登录"，先执行 `yidaconnector login`。Codex 中默认返回内置浏览器 handoff：用 Browser Use 打开 `login_url`，让钉钉/宜搭页面承接扫码和组织选择。页面登录完成后必须再次执行 `yidaconnector login --check-only --json` 验证缓存写入。**

---

## 何时使用

当用户提出以下需求时，使用本技能：
- 查询宜搭表单数据、流程实例、任务列表、子表单明细
- 查看/创建/更新表单或流程数据
- 执行流程任务（同意/驳回）
- 管理宜搭登录态（登录/退出/切换组织/切换环境）

---

## 子技能速查

> 每个子技能均有独立的 SKILL.md。执行时先选定一个最匹配的子技能，只读取该子技能文档；references 按文档提示按需读取，避免一次性加载全量文档。

| 技能 | SKILL.md 路径 | 用途 | 典型命令 |
|------|--------------|------|---------|
| `yida-data-management` | `skills/yida-data-management/SKILL.md` | 表单/子表/流程/任务数据查询与变更 | `yidaconnector data query form <appType> <formUuid>` |
| `yida-login` | `skills/yida-login/SKILL.md` | 登录态管理（通常自动触发） | `yidaconnector login` |
| `yida-logout` | `skills/yida-logout/SKILL.md` | 退出登录 / 切换账号 | `yidaconnector logout` |
| `large-file-write` | `skills/large-file-write/SKILL.md` | 大文件可靠写入辅助技能 | 详见 SKILL.md |

---

## 关键规则

### 1. 执行子技能前必须读取其 SKILL.md

每个子技能的详细参数、注意事项、示例均在其 SKILL.md 中。**执行任何子技能前，必须先读取对应的 SKILL.md**，不要凭记忆猜测参数格式。

### 2. 性能与正确性规则（必须遵守）

- **只读必要文档**：先根据用户意图选定 1 个主技能；只有该技能明确要求时，才读取对应 `references/` 文档，禁止一次性读取全部技能文档。
- **优先复用缓存**：已知的 `appType`、`formUuid`、`formInstId`、`fieldId` 优先复用；缺失或不确定时再查询。
- **避免无效重试**：同一命令失败后，先根据错误信息检查登录态、组织、参数和字段 ID；不要无修改地连续重试超过 1 次。
- **分页注意**：宜搭 API 单页最大 100 条，`--all` 会自动翻页拉取全量；数据量大时留意 `pagesFetched` 与 `totalCount`。

### 3. corpId 一致性检查（必须遵守）

查询数据前，**必须对比目标应用的 corpId 与 `.cache/cookies.json` 中的 corpId 是否一致**：

- **一致** → 继续执行
- **不一致** → 询问用户：重新登录到正确组织，还是切换组织？

### 4. 临时文件规范

所有临时文件（cookies、查询结果、字段映射、一次性脚本等）**必须写在项目根目录的 `.cache/` 文件夹中**，不要写到仓库根目录，也不要写在系统其他位置。

推荐路径：

| 工件类型 | 推荐位置 |
|---------|---------|
| 查询结果 / 数据导出 | `.cache/yidaconnector/data-export/` |
| 字段 ID 映射 | `.cache/<项目名>-schema.json` |
| 一次性 Python / JS 执行脚本 | `.cache/yidaconnector/scripts/` |

> 若只是为了调用 `yidaconnector` 命令临时生成的 `*.json`、`*.js`、`*.py`、`*.csv` 文件，一律放入 `.cache/yidaconnector/` 子目录。

---

## 宜搭应用 URL 规则

| 页面类型 | URL 格式 |
|---------|---------|
| 应用首页 | `{base_url}/{appType}/workbench` |
| 表单提交页 | `{base_url}/{appType}/submission/{formUuid}` |
| 表单详情页 | `{base_url}/{appType}/formDetail/{formUuid}?formInstId={formInstId}` |
| 表单详情页（编辑模式） | `{base_url}/{appType}/formDetail/{formUuid}?formInstId={formInstId}&mode=edit` |

> 所有地址拼接 `&corpid={corpId}` 可自动切换到对应组织。

---

## 常见问题

**Q：查询时提示登录失效？**

重新登录后再查询：
```bash
yidaconnector login
yidaconnector data query form <appType> <formUuid>
```

**Q：如何切换到其他组织？**

```bash
yidaconnector org list
yidaconnector org switch --corp-id <corpId>
```

**Q：如何切换到私有化/国际版环境？**

```bash
yidaconnector env list
yidaconnector env switch <name>
# 或登录时直接指定
yidaconnector login --intl
yidaconnector login --alibaba
```

**Q：完整 API 参考在哪里？**

宜搭 API 完整字段与端点参考见 [references/yida-api.md](references/yida-api.md)。
