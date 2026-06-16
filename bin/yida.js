#!/usr/bin/env node
/**
 * openyida - 宜搭命令行工具
 *
 * 安装：npm install -g openyida
 * 用法：openyida <命令> [参数]（别名：yida）
 *
 * 命令清单维护在 lib/core/command-manifest.js，供 help 和 agent JSON 共用。
 */

'use strict';

const { version: currentVersion } = require('../package.json');
const { t } = require('../lib/core/i18n');
const { warn } = require('../lib/core/chalk');
const { CliError, isCliError, toErrorPayload } = require('../lib/core/cli-error');
const { COMMAND_GROUPS, buildCommandManifest } = require('../lib/core/command-manifest');

const command = process.argv[2];
const args = process.argv.slice(3);

function isAgentEnvironment(env) {
  return !!(
    env.CODEX_SHELL ||
    env.CODEX_CI ||
    env.CODEX_THREAD_ID ||
    env.CODEX_HOME ||
    env.CLAUDE_CODE ||
    env.CLAUDE_CODE_ENTRYPOINT ||
    env.OPENCODE ||
    env.OPENCODE_CLIENT ||
    env.QODER_IDE ||
    env.QODER_AGENT ||
    env.QODERCLI_INTEGRATION_MODE ||
    env.CURSOR_TRACE_ID ||
    env.AGENT_WORK_ROOT ||
    env.OPENYIDA_AGENT_MODE ||
    (env.__CFBundleIdentifier || '').toLowerCase().includes('codex') ||
    (env.__CFBundleIdentifier || '').toLowerCase().includes('qoder')
  );
}

function shouldRunUpdateCheck() {
  if (process.env.OPENYIDA_SKIP_UPDATE_CHECK || process.env.NO_UPDATE_NOTIFIER) {
    return false;
  }
  if (process.env.CI || isAgentEnvironment(process.env)) {
    return false;
  }
  if (!process.stderr.isTTY) {
    return false;
  }
  if (!command || command === '--help' || command === '-h' || command === '--version' || command === '-v') {
    return false;
  }
  if (command === 'commands') {
    return false;
  }
  if (args.includes('--json') || args.includes('--check-only')) {
    return false;
  }
  return true;
}

function maybeCheckForUpdate() {
  if (!shouldRunUpdateCheck()) {
    return;
  }
  const { checkUpdate } = require('../lib/core/check-update');
  checkUpdate(currentVersion).catch(() => {});
}

maybeCheckForUpdate();

function printHelp() {
  const RESET   = '\x1b[0m';
  const BOLD    = '\x1b[1m';
  const DIM     = '\x1b[2m';
  const CYAN    = '\x1b[36m';
  const GREEN   = '\x1b[32m';
  const YELLOW  = '\x1b[33m';

  const SEP = `${DIM}${'─'.repeat(60)}${RESET}`;

  /**
   * 渲染一组命令列表。
   * @param {string} groupTitle - 分组标题
   * @param {Array<[string, string]>} commands - [命令, 描述] 数组
   */
  function renderGroup(groupTitle, commands) {
    console.log(`\n  ${BOLD}${CYAN}${groupTitle}${RESET}`);
    const maxCmdLen = Math.max(...commands.map(([cmd]) => cmd.length));
    const padWidth = Math.min(maxCmdLen + 2, 50);
    for (const [cmd, desc] of commands) {
      if (cmd.length >= padWidth) {
        console.log(`    ${GREEN}${cmd}${RESET}`);
        console.log(`      ${DIM}${desc}${RESET}`);
      } else {
        console.log(`    ${GREEN}${cmd.padEnd(padWidth)}${RESET}${DIM}${desc}${RESET}`);
      }
    }
  }

  // ── 标题 ──
  console.log('');
  console.log(`  ${BOLD}${CYAN}OpenYida${RESET} ${DIM}v${currentVersion}${RESET}`);
  console.log(`  ${DIM}${t('help.subtitle')}${RESET}`);
  console.log(`  ${DIM}"We are on the verge of the Singularity"${RESET}`);
  console.log('');
  console.log(`  ${YELLOW}${t('help.usage')}${RESET}  openyida <command> [args...]`);
  console.log(`  ${DIM}${t('help.alias')}${RESET}  yida`);
  console.log(SEP);

  for (const group of COMMAND_GROUPS) {
    renderGroup(
      t(group.titleKey),
      group.commands
        .filter(entry => !entry.hidden)
        .map(entry => [entry.usage, t(entry.descriptionKey)])
    );
  }

  // ── 快速上手 ──
  console.log(SEP);
  console.log(`\n  ${BOLD}${CYAN}${t('help.quickstart_title')}${RESET}`);
  console.log(`    ${DIM}${RESET} openyida data query form APP_XXX FORM_XXX --page 1 --size 20`);
  console.log('');
  console.log(`  ${DIM}${t('help.docs')} https://openyida.ai  ·  https://github.com/openyida/openyida${RESET}`);
  console.log('');
}

/**
 * 检测是否首次运行（安装后第一次执行 openyida 命令）。
 * 通过 ~/.openyida/first-run-done 标记文件判断。
 * 若是首次运行，打印新手引导并写入标记文件。
 */
function handleFirstRunGuide() {
  const os = require('os');
  const path = require('path');
  const fs = require('fs');

  const OPENYIDA_DIR = path.join(os.homedir(), '.openyida');
  const FIRST_RUN_FLAG = path.join(OPENYIDA_DIR, 'first-run-done');

  // 已运行过，跳过引导
  if (fs.existsSync(FIRST_RUN_FLAG)) {return;}

  // 写入标记，避免重复展示
  try {
    fs.mkdirSync(OPENYIDA_DIR, { recursive: true });
    fs.writeFileSync(FIRST_RUN_FLAG, new Date().toISOString(), 'utf8');
  } catch {
    // 写入失败不影响主流程
  }

  const RESET   = '\x1b[0m';
  const BOLD    = '\x1b[1m';
  const DIM     = '\x1b[2m';
  const CYAN    = '\x1b[36m';
  const GREEN   = '\x1b[32m';
  const YELLOW  = '\x1b[33m';
  const BLUE    = '\x1b[34m';
  const MAGENTA = '\x1b[35m';
  const BG_CYAN = '\x1b[46m';
  const WHITE   = '\x1b[37m';

  const SEP = `${DIM}${'─'.repeat(60)}${RESET}`;

  console.log('');
  console.log(`${BG_CYAN}${WHITE}${BOLD}${t('cli.first_run_title')}${RESET}`);
  console.log(SEP);
  console.log(t('cli.first_run_welcome', `${GREEN}${BOLD}`, RESET));
  console.log('');
  console.log(`${BOLD}${CYAN}${t('cli.first_run_way1_title')}${RESET}`);
  console.log(t('cli.first_run_way1_desc'));
  console.log('');
  console.log(`  ${YELLOW}${t('cli.first_run_prompt1')}${RESET}`);
  console.log(`  ${YELLOW}${t('cli.first_run_prompt2')}${RESET}`);
  console.log(`  ${YELLOW}${t('cli.first_run_prompt3')}${RESET}`);
  console.log('');
  console.log(`${BOLD}${CYAN}${t('cli.first_run_way2_title')}${RESET}`);
  console.log('');
  console.log(`  ${YELLOW}${t('cli.first_run_prompt4')}${RESET}`);
  console.log('');
  console.log(`${BOLD}${CYAN}${t('cli.first_run_examples_title')}${RESET}`);
  console.log('');
  console.log(`  ${MAGENTA}•${RESET} ${t('cli.first_run_examples')}`);
  console.log('');
  console.log(SEP);
  console.log(`${BOLD}${BLUE}${t('cli.first_run_tips_title')}${RESET}`);
  console.log('');
  console.log(t('cli.first_run_tip1', CYAN, RESET));
  console.log(t('cli.first_run_tip2', CYAN, RESET));
  console.log(t('cli.first_run_tip3'));
  console.log('');
  console.log(SEP);
  console.log(`  ${DIM}${t('cli.first_run_footer1')}${RESET}`);
  console.log(`  ${DIM}${t('cli.first_run_footer2')}${RESET}`);
  console.log('');
  console.log(`  ${DIM}${t('cli.first_run_footer3')}${RESET}`);
  console.log('');
}

function parseLoginTargetArg(value) {
  const raw = String(value || '').trim();
  if (!raw) {return null;}

  const hasProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw);
  if (!hasProtocol) {
    if (raw.startsWith('/') || raw.startsWith('.') || raw.includes('\\')) {return null;}
    const hostPart = raw.split('/')[0];
    if (!hostPart.includes('.') && hostPart !== 'localhost') {return null;}
  }

  try {
    return new URL(hasProtocol ? raw : `https://${raw}`);
  } catch {
    return null;
  }
}

function applyLoginTargetUrl(value) {
  const parsedUrl = parseLoginTargetArg(value);
  if (!parsedUrl) {return false;}

  const {
    deriveBaseUrlFromDingtalkOAuthUrl,
    inferEnvironmentNameFromUrl,
    inferLoginUrlForBaseUrl,
    normalizeBaseUrl,
    normalizeHostname,
  } = require('../lib/core/env-manager');

  const targetHref = parsedUrl.href;
  const redirectBaseUrl = deriveBaseUrlFromDingtalkOAuthUrl(targetHref, null);
  const endpoint = normalizeBaseUrl(redirectBaseUrl || parsedUrl.origin, null);
  const inferredEnv = inferEnvironmentNameFromUrl(redirectBaseUrl || targetHref);

  if (inferredEnv) {
    process.env.OPENYIDA_ENV = inferredEnv;
  }
  if (endpoint) {
    process.env.OPENYIDA_ENDPOINT = endpoint;
  }

  const host = normalizeHostname(targetHref);
  const isDingtalkLoginHost = host.endsWith('dingtalk.com') || host.endsWith('dingtalk.io');
  const normalizedPath = parsedUrl.pathname.replace(/\/+$/, '') || '/';
  const hasCustomLoginPath = normalizedPath !== '/' && normalizedPath !== '/workPlatform';
  process.env.OPENYIDA_LOGIN_URL = isDingtalkLoginHost || hasCustomLoginPath
    ? targetHref
    : inferLoginUrlForBaseUrl(endpoint || parsedUrl.origin);

  return true;
}

function applyLoginEnvironmentFlags(cliArgs, options = {}) {
  const envFlagMap = {
    '--public': 'public',
    '--intl': 'intl',
    '--overseas': 'intl',
    '--international': 'intl',
    '--global': 'intl',
    '--yidaapps': 'intl',
    '--alibaba': 'alibaba',
    '--internal': 'alibaba',
    '--intranet': 'alibaba',
  };
  const valuePassthroughFlags = new Set([
    '--agent-poll',
    '--codex-poll',
    '--agent-select',
    '--codex-select',
    '--corp-id',
  ]);
  const targetUrlFlags = new Set([
    '--endpoint',
    '--base-url',
    '--login-url',
  ]);
  const inferTargetUrl = !!options.inferTargetUrl;
  const filteredArgs = [];

  for (let index = 0; index < cliArgs.length; index++) {
    const arg = cliArgs[index];
    if (arg === '--env') {
      const envName = cliArgs[index + 1];
      if (envName && !envName.startsWith('--')) {
        process.env.OPENYIDA_ENV = envName;
        index++;
      }
      continue;
    }
    if (inferTargetUrl && targetUrlFlags.has(arg)) {
      const targetUrl = cliArgs[index + 1];
      if (targetUrl && !targetUrl.startsWith('--') && applyLoginTargetUrl(targetUrl)) {
        index++;
        continue;
      }
    }
    if (valuePassthroughFlags.has(arg)) {
      filteredArgs.push(arg);
      if (cliArgs[index + 1] && !cliArgs[index + 1].startsWith('--')) {
        filteredArgs.push(cliArgs[index + 1]);
        index++;
      }
      continue;
    }
    if (envFlagMap[arg]) {
      process.env.OPENYIDA_ENV = envFlagMap[arg];
      continue;
    }
    if (inferTargetUrl && !arg.startsWith('--') && applyLoginTargetUrl(arg)) {
      continue;
    }
    filteredArgs.push(arg);
  }

  return filteredArgs;
}

function applyGlobalEnvironmentFlags() {
  const filteredArgs = applyLoginEnvironmentFlags(args);
  args.splice(0, args.length, ...filteredArgs);
}

// 解析全局 --quiet 开关：从 args 中剔除并设置 YIDA_QUIET=1，让 chalk.js
// 的所有装饰输出（banner/step/info/...）变 no-op，AI 即可直接 `... --quiet | jq`。
function applyQuietFlag() {
  const idx = args.indexOf('--quiet');
  if (idx !== -1) {
    process.env.YIDA_QUIET = '1';
    args.splice(idx, 1);
  }
}

function throwCliUsage(...lines) {
  throw new CliError(lines.filter(Boolean).join('\n'), {
    code: 'INVALID_ARGUMENTS',
  });
}

function throwNeedLogin(message) {
  throw new CliError(message, {
    code: 'NEED_LOGIN',
  });
}

function shouldUseEnvManagement(argsList) {
  const subCommand = argsList[0];
  return !!subCommand && subCommand !== '--json';
}

function getArgValue(cliArgs, name) {
  const index = cliArgs.indexOf(name);
  if (index === -1 || !cliArgs[index + 1] || cliArgs[index + 1].startsWith('--')) {
    return null;
  }
  return cliArgs[index + 1];
}

function isAgentConversationEnvironment() {
  const { detectActiveTool } = require('../lib/core/utils');
  return !!detectActiveTool() || process.env.OPENYIDA_AGENT_MODE === '1';
}

function shouldUseBrowserHandoffLogin(cliArgs) {
  if (cliArgs.includes('--qr') || cliArgs.includes('--codex-qr') || cliArgs.includes('--agent-qr')) {return false;}
  if (cliArgs.includes('--browser') || cliArgs.includes('--codex') || cliArgs.includes('--qoder') || cliArgs.includes('--wukong')) {return true;}
  return false;
}

function shouldUseAgentLogin(cliArgs) {
  if (cliArgs.includes('--qr') || cliArgs.includes('--codex-qr') || cliArgs.includes('--agent-qr')) {return false;}
  if (shouldUseBrowserHandoffLogin(cliArgs)) {return false;}
  return isAgentConversationEnvironment();
}

function shouldUsePlaywrightFallbackInAgentLogin() {
  const { hasDesktopEnvironment } = require('../lib/core/utils');
  return hasDesktopEnvironment() || process.env.OPENYIDA_AGENT_PLAYWRIGHT_FALLBACK === '1';
}

function shouldUseDesktopBrowserLogin() {
  const { hasDesktopEnvironment } = require('../lib/core/utils');
  return hasDesktopEnvironment();
}

function shouldUseCodexQrLogin(cliArgs) {
  if (cliArgs.includes('--codex-qr') || cliArgs.includes('--agent-qr')) {return true;}
  return false;
}

// feedback 登录死循环检测已移除（依赖已删的 feedback 模块）。
// 保留为 no-op，保证 printLoginResult 调用链不断裂。
function noteLoginCommandResult() {}

function printLoginResult(result) {
  noteLoginCommandResult(result);

  if (result && (result.status === 'need_qr_scan' || result.status === 'need_corp_selection')) {
    console.log(JSON.stringify(result));
    return;
  }

  if (result && result.status === 'need_codex_browser_login') {
    const handoff = {
      status: result.status,
      handoff_type: result.handoff_type || 'browser',
      can_auto_use: false,
      browser: result.browser,
      login_url: result.login_url,
      message: result.message,
    };
    [
      'agent_action',
      'browser_open_strategy',
      'browser_use_local_redirect_fallback',
      'required_agent_tool',
      'required_runtime_tool',
      'cookie_export_file',
      'cookie_file',
      'post_login_check_command',
      'fallback_command',
    ].forEach((key) => {
      if (result[key]) {handoff[key] = result[key];}
    });
    console.log(JSON.stringify(handoff));
    return;
  }

  const summary = {
    ok: true,
    base_url: result && result.base_url,
    corp_id: result && result.corp_id,
    user_id: result && result.user_id,
    csrf_token: result && result.csrf_token ? `${result.csrf_token.slice(0, 16)}...` : undefined,
    cookies_count: Array.isArray(result && result.cookies) ? result.cookies.length : 0,
  };
  console.log(JSON.stringify(summary));
}

async function main() {
  applyQuietFlag();
  applyGlobalEnvironmentFlags();

  if (!command || command === '--help' || command === '-h') {
    handleFirstRunGuide();
    printHelp();
    return;
  }

  if (command === '--version' || command === '-v') {
    console.log(currentVersion);
    return;
  }

  switch (command) {
    case 'commands': {
      const manifest = buildCommandManifest({ t, version: currentVersion });
      console.log(JSON.stringify(manifest, null, 2));
      break;
    }

    case 'env': {
      if (shouldUseEnvManagement(args)) {
        const { run } = require('../lib/core/env-cmd');
        await run(args);
      } else {
        const { run } = require('../lib/core/env');
        run(args);
      }
      break;
    }

    case 'login': {
      const { checkLoginOnly } = require('../lib/auth/login');
      const loginArgs = applyLoginEnvironmentFlags(args, { inferTargetUrl: true });
      if (loginArgs.includes('--agent-poll') || loginArgs.includes('--codex-poll')) {
        const sessionFile = getArgValue(loginArgs, '--agent-poll') || getArgValue(loginArgs, '--codex-poll');
        const { pollCodexQrLogin } = require('../lib/auth/qr-login');
        const result = await pollCodexQrLogin(sessionFile, {
          corpId: getArgValue(loginArgs, '--corp-id'),
        });
        printLoginResult(result);
      } else if (loginArgs.includes('--agent-select') || loginArgs.includes('--codex-select')) {
        const sessionFile = getArgValue(loginArgs, '--agent-select') || getArgValue(loginArgs, '--codex-select');
        const { selectCodexQrCorp } = require('../lib/auth/qr-login');
        const result = await selectCodexQrCorp(sessionFile, {
          corpId: getArgValue(loginArgs, '--corp-id'),
        });
        printLoginResult(result);
      } else if (loginArgs[0] === '--check-only') {
        const result = checkLoginOnly({ includeSecrets: loginArgs.includes('--with-cookies') });
        console.log(JSON.stringify(result, null, 2));
      } else if (shouldUseCodexQrLogin(loginArgs)) {
        const { startCodexQrLogin } = require('../lib/auth/qr-login');
        const result = await startCodexQrLogin({ corpId: getArgValue(loginArgs, '--corp-id') });
        printLoginResult(result);
      } else if (loginArgs.includes('--browser')) {
        const { interactiveLogin } = require('../lib/auth/login');
        const result = interactiveLogin({ force: true });
        printLoginResult(result);
      } else if (loginArgs.includes('--qoder') || loginArgs.includes('--wukong')) {
        const { codexLogin } = require('../lib/auth/codex-login');
        const result = await codexLogin({ tool: loginArgs.includes('--qoder') ? 'qoder' : 'wukong' });
        printLoginResult(result);
      } else if (loginArgs.includes('--qr')) {
        const { qrLogin } = require('../lib/auth/qr-login');
        const result = await qrLogin({ corpId: getArgValue(loginArgs, '--corp-id') });
        printLoginResult(result);
      } else if (shouldUseAgentLogin(loginArgs)) {
        const cachedResult = checkLoginOnly({ includeSecrets: true });
        if (cachedResult.status === 'ok') {
          printLoginResult(cachedResult);
        } else {
          const { detectActiveTool } = require('../lib/core/utils');
          const activeTool = detectActiveTool();
          const { interactiveLogin } = require('../lib/auth/login');
          const browserResult = interactiveLogin({
            playwrightFallback: shouldUsePlaywrightFallbackInAgentLogin(),
          });
          if (browserResult) {
            printLoginResult(browserResult);
          } else {
            if (activeTool && (activeTool.tool === 'wukong' || activeTool.tool === 'qoderwork')) {
              const { codexLogin } = require('../lib/auth/codex-login');
              const result = await codexLogin({ tool: activeTool.tool });
              printLoginResult(result);
            } else {
              const { startCodexQrLogin } = require('../lib/auth/qr-login');
              const result = await startCodexQrLogin({ corpId: getArgValue(loginArgs, '--corp-id') });
              printLoginResult(result);
            }
          }
        }
      } else if (shouldUseBrowserHandoffLogin(loginArgs)) {
        const cachedResult = checkLoginOnly({ includeSecrets: true });
        if (cachedResult.status === 'ok') {
          printLoginResult(cachedResult);
        } else {
          const { codexLogin } = require('../lib/auth/codex-login');
          const result = await codexLogin({ tool: loginArgs.includes('--codex') ? 'codex' : undefined });
          printLoginResult(result);
        }
      } else {
        const cachedResult = checkLoginOnly({ includeSecrets: true });
        if (cachedResult.status === 'ok') {
          printLoginResult(cachedResult);
          break;
        }
        if (shouldUseDesktopBrowserLogin()) {
          const { interactiveLogin } = require('../lib/auth/login');
          const browserResult = interactiveLogin({ playwrightFallback: true });
          if (browserResult) {
            printLoginResult(browserResult);
            break;
          }
        }
        const { qrLogin } = require('../lib/auth/qr-login');
        const result = await qrLogin({ corpId: getArgValue(loginArgs, '--corp-id') });
        printLoginResult(result);
      }
      break;
    }

    case 'logout': {
      const { logout } = require('../lib/auth/login');
      logout();
      break;
    }

    case 'auth': {
      const subCommand = args[0];
      const { authStatus, authLogin, authRefresh, authLogout } = require('../lib/auth/auth');

      if (subCommand === 'status') {
        authStatus();
      } else if (subCommand === 'login') {
        const authArgs = applyLoginEnvironmentFlags(args.slice(1), { inferTargetUrl: true });
        let loginType = 'qrcode';
        if (authArgs.includes('--codex')) {
          loginType = 'codex';
        } else if (authArgs.includes('--qoder')) {
          loginType = 'qoder';
        } else if (authArgs.includes('--wukong')) {
          loginType = 'wukong';
        } else if (authArgs.includes('--browser')) {
          loginType = 'browser';
        }
        const result = await authLogin({
          type: loginType,
          corpId: getArgValue(authArgs, '--corp-id'),
          forceTerminalQr: authArgs.includes('--qr'),
        });
        if (result) {
          printLoginResult(result);
        }
      } else if (subCommand === 'refresh') {
        authRefresh();
      } else if (subCommand === 'logout') {
        authLogout();
      } else {
        throwCliUsage(t('cli.auth_usage'), t('cli.auth_example'));
      }
      break;
    }

    case 'org': {
      const subCommand = args[0];
      const { listOrganizations, switchOrganization, interactiveSwitch } = require('../lib/auth/org');
      const { loadCookieData } = require('../lib/core/utils');

      if (subCommand === 'list') {
        const cookieData = loadCookieData();
        if (!cookieData || !cookieData.cookies) {
          throwNeedLogin(t('org.no_login'));
        }
        await listOrganizations(cookieData);
      } else if (subCommand === 'switch') {
        const cookieData = loadCookieData();
        if (!cookieData || !cookieData.cookies) {
          throwNeedLogin(t('org.no_login'));
        }

        const corpIdIndex = args.indexOf('--corp-id');
        if (corpIdIndex !== -1 && args[corpIdIndex + 1]) {
          const targetCorpId = args[corpIdIndex + 1];
          await switchOrganization(targetCorpId, cookieData);
        } else {
          await interactiveSwitch(cookieData);
        }
      } else {
        throwCliUsage(t('cli.org_usage'), t('cli.org_example'));
      }
      break;
    }

    case 'data': {
      if (args.length < 2) {
        throwCliUsage(
          '用法: openyida data <action> <resource> [args] [options]',
          '示例: openyida data query form APP_XXX FORM_XXX --page 1 --size 20'
        );
      }
      const { run: runDataManagement } = require('../lib/core/query-data');
      await runDataManagement(args);
      break;
    }

    default: {
      throwCliUsage(t('cli.unknown_command', command), t('cli.run_help'));
    }
  }
}

main()
  .catch((err) => {
    if (isCliError(err) && args.includes('--json')) {
      console.error(JSON.stringify(toErrorPayload(err), null, 2));
    } else if (isCliError(err)) {
      warn(t('cli.exec_failed', err.message));
      if (err.usage) {
        warn(err.usage);
      }
    } else {
      warn(t('cli.exec_failed', err.message));
    }
    process.exit(err && err.exitCode ? err.exitCode : 1);
  });
