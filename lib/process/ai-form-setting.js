'use strict';

const fs = require('fs');
const http = require('http');
const https = require('https');
const querystring = require('querystring');

const {
  loadCookieData,
  triggerLogin,
  resolveBaseUrl,
  httpGet,
  httpPost,
  requestWithAutoLogin,
  isLoginExpired,
  isCsrfTokenExpired,
} = require('../core/utils');
const { t } = require('../core/i18n');
const { error, result: printResult, success, warn } = require('../core/chalk');

const VALID_ITEM_TYPES = ['TEXT', 'IMAGE', 'ATTACHMENT'];
const ENABLED_STATUS = 'AUTO';
const DISABLED_STATUS = 'DISABLE';
const MAX_CHECK_ITEMS = 3;

function hasHelpFlag(args) {
  return (args || []).includes('--help') || (args || []).includes('-h');
}

function printUsage() {
  process.stderr.write([
    t('ai_form_setting.usage'),
    '',
    t('ai_form_setting.commands_title'),
    `  ${t('ai_form_setting.cmd_get')}`,
    `  ${t('ai_form_setting.cmd_fields')}`,
    `  ${t('ai_form_setting.cmd_models')}`,
    `  ${t('ai_form_setting.cmd_enable')}`,
    `  ${t('ai_form_setting.cmd_disable')}`,
    `  ${t('ai_form_setting.cmd_save')}`,
    '',
    t('ai_form_setting.examples_title'),
    `  ${t('ai_form_setting.example_get')}`,
    `  ${t('ai_form_setting.example_fields')}`,
    `  ${t('ai_form_setting.example_save')}`,
    '',
  ].join('\n'));
}

function parseFlags(args) {
  const positional = [];
  const flags = {
    json: false,
    raw: false,
    type: null,
    enable: false,
    disable: false,
  };

  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--json') {
      flags.json = true;
      continue;
    }
    if (arg === '--raw') {
      flags.raw = true;
      continue;
    }
    if (arg === '--enable') {
      flags.enable = true;
      continue;
    }
    if (arg === '--disable') {
      flags.disable = true;
      continue;
    }
    if ((arg === '--type' || arg === '--item-type') && args[index + 1]) {
      flags.type = normalizeItemType(args[++index]);
      continue;
    }
    positional.push(arg);
  }

  if (flags.enable && flags.disable) {
    throw new Error(t('ai_form_setting.enable_disable_conflict'));
  }

  return { positional, flags };
}

function normalizeItemType(value) {
  const normalized = String(value || '').trim().toUpperCase();
  const aliasMap = {
    TEXT: 'TEXT',
    TXT: 'TEXT',
    IMAGE: 'IMAGE',
    IMG: 'IMAGE',
    VISION: 'IMAGE',
    ATTACHMENT: 'ATTACHMENT',
    FILE: 'ATTACHMENT',
    ATTACH: 'ATTACHMENT',
  };
  const itemType = aliasMap[normalized] || normalized;
  if (!VALID_ITEM_TYPES.includes(itemType)) {
    throw new Error(t('ai_form_setting.invalid_type', value, VALID_ITEM_TYPES.join(', ')));
  }
  return itemType;
}

function normalizeStatus(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const normalized = String(value).trim().toUpperCase();
  if (['AUTO', 'ENABLE', 'ENABLED', 'ON', 'TRUE'].includes(normalized)) {
    return ENABLED_STATUS;
  }
  if (['DISABLE', 'DISABLED', 'OFF', 'FALSE', 'CLOSE', 'CLOSED'].includes(normalized)) {
    return DISABLED_STATUS;
  }
  throw new Error(t('ai_form_setting.invalid_status', value));
}

function buildSettingsUrl(baseUrl, appType, formUuid) {
  return `${baseUrl}/${appType}/admin/${formUuid}/settings/aiFormSetting`;
}

function buildCommonParams(csrfToken, extra = {}) {
  return {
    _api: 'nattyFetch',
    _mock: 'false',
    _csrf_token: csrfToken,
    _locale_time_zone_offset: '28800000',
    _stamp: Date.now(),
    ...extra,
  };
}

function parseMaybeJson(value, fallback) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  if (typeof value !== 'string') {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function readJsonInput(input) {
  if (!input) {
    throw new Error(t('ai_form_setting.config_required'));
  }

  const raw = fs.existsSync(input) ? fs.readFileSync(input, 'utf8') : input;
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(t('ai_form_setting.invalid_json', err.message));
  }
}

function resolveLocalizedText(value, fallback = '') {
  if (!value) {
    return fallback;
  }
  if (typeof value === 'string') {
    const parsed = parseMaybeJson(value, null);
    if (parsed && typeof parsed === 'object') {
      return resolveLocalizedText(parsed, fallback);
    }
    return value;
  }
  if (typeof value === 'object') {
    return value.zh_CN || value.en_US || value.pureEn_US || value.name || fallback;
  }
  return fallback;
}

function replaceAllLiteral(text, from, to) {
  return String(text || '').split(from).join(to);
}

function normalizeVariable(rawVariable, index) {
  if (!rawVariable || typeof rawVariable !== 'object' || Array.isArray(rawVariable)) {
    throw new Error(t('ai_form_setting.invalid_variable', String(index + 1)));
  }
  const fieldId = rawVariable.fieldId || rawVariable.id || rawVariable.key;
  const varName = rawVariable.varName || rawVariable.name || rawVariable.fieldName || rawVariable.label;
  if (!fieldId || !varName) {
    throw new Error(t('ai_form_setting.variable_required', String(index + 1)));
  }
  const normalizedVarName = resolveLocalizedText(varName, String(varName));
  const fieldName = resolveLocalizedText(rawVariable.fieldName || varName, normalizedVarName);
  return {
    varName: normalizedVarName,
    fieldId: String(fieldId),
    fieldName,
    fieldType: String(rawVariable.fieldType || rawVariable.type || rawVariable.componentName || ''),
  };
}

function normalizePrompt(rawItem) {
  const rawPrompt = rawItem.prompt && typeof rawItem.prompt === 'object'
    ? rawItem.prompt
    : {};
  const content = rawPrompt.content || rawItem.prompt || rawItem.content || rawItem.promptContent || '';
  const variables = rawItem.variables || rawPrompt.variables || [];

  if (typeof content !== 'string' || !content.trim()) {
    throw new Error(t('ai_form_setting.prompt_required', rawItem.itemName || rawItem.name || rawItem.title || ''));
  }
  if (!Array.isArray(variables)) {
    throw new Error(t('ai_form_setting.variables_array_required'));
  }

  return {
    content,
    variables: variables.map(normalizeVariable),
  };
}

function normalizeInputItem(rawItem, index) {
  if (!rawItem || typeof rawItem !== 'object' || Array.isArray(rawItem)) {
    throw new Error(t('ai_form_setting.invalid_item', String(index + 1)));
  }

  const itemType = normalizeItemType(rawItem.itemType || rawItem.type || rawItem.modelType || 'TEXT');
  const itemId = String(rawItem.itemId || rawItem.id || `ai_item_${itemType.toLowerCase()}_${index + 1}`);
  const itemName = String(rawItem.itemName || rawItem.name || rawItem.title || itemType);
  const prompt = normalizePrompt(rawItem);
  let content = prompt.content;

  for (const variable of prompt.variables) {
    content = replaceAllLiteral(content, `[${variable.varName}]`, `[${variable.fieldId}]`);
  }

  const variables = prompt.variables.filter((variable) => content.includes(`[${variable.fieldId}]`));
  const modelSource = rawItem.modelConfig && typeof rawItem.modelConfig === 'object'
    ? rawItem.modelConfig
    : rawItem.model && typeof rawItem.model === 'object'
      ? rawItem.model
      : {};
  const modelId = rawItem.modelId || modelSource.modelId || (typeof rawItem.model === 'string' ? rawItem.model : null);
  if (!modelId) {
    throw new Error(t('ai_form_setting.model_required', itemName));
  }

  return {
    item: {
      itemId,
      itemType,
      itemName,
      order: Number.isFinite(Number(rawItem.order)) ? Number(rawItem.order) : index + 1,
      enabled: rawItem.enabled !== false,
      prompt: {
        content,
        variables,
      },
    },
    model: {
      modelType: itemType,
      modelId: String(modelId),
      deepThinking: Boolean(rawItem.deepThinking ?? modelSource.deepThinking ?? false),
    },
  };
}

function stringifyConfigPart(value, key) {
  if (typeof value === 'string') {
    JSON.parse(value);
    return value;
  }
  if (!value || typeof value !== 'object') {
    throw new Error(t('ai_form_setting.invalid_config_part', key));
  }
  return JSON.stringify(value);
}

function buildSavePayload(config) {
  if (!config || (typeof config !== 'object' && !Array.isArray(config))) {
    throw new Error(t('ai_form_setting.config_object_required'));
  }

  if (!Array.isArray(config) && config.modelConfig && config.checkItem) {
    return {
      status: normalizeStatus(config.status),
      modelConfig: stringifyConfigPart(config.modelConfig, 'modelConfig'),
      checkItem: stringifyConfigPart(config.checkItem, 'checkItem'),
    };
  }

  const rawItems = Array.isArray(config) ? config : config.items;
  if (!Array.isArray(rawItems)) {
    throw new Error(t('ai_form_setting.items_array_required'));
  }
  if (rawItems.length > MAX_CHECK_ITEMS) {
    throw new Error(t('ai_form_setting.too_many_items', String(MAX_CHECK_ITEMS)));
  }

  const seenIds = new Set();
  const checkItem = { items: [] };
  const modelConfig = { models: {} };

  rawItems.forEach((rawItem, index) => {
    const normalized = normalizeInputItem(rawItem, index);
    if (seenIds.has(normalized.item.itemId)) {
      throw new Error(t('ai_form_setting.duplicate_item_id', normalized.item.itemId));
    }
    seenIds.add(normalized.item.itemId);
    checkItem.items.push(normalized.item);
    modelConfig.models[normalized.item.itemId] = normalized.model;
  });

  return {
    status: normalizeStatus(config.status),
    modelConfig: JSON.stringify(modelConfig),
    checkItem: JSON.stringify(checkItem),
  };
}

function formatPromptForDisplay(content, variables) {
  let displayPrompt = String(content || '');
  for (const variable of variables || []) {
    displayPrompt = replaceAllLiteral(displayPrompt, `[${variable.fieldId}]`, `[${variable.varName}]`);
  }
  return displayPrompt;
}

function normalizeStoredConfig(content) {
  const safeContent = content || {};
  const checkItem = parseMaybeJson(safeContent.checkItem, { items: [] }) || { items: [] };
  const modelConfig = parseMaybeJson(safeContent.modelConfig, { models: {} }) || { models: {} };
  const items = Array.isArray(checkItem.items) ? checkItem.items : [];
  const models = modelConfig.models && typeof modelConfig.models === 'object'
    ? modelConfig.models
    : {};

  return {
    status: safeContent.status || '',
    enabled: safeContent.status === ENABLED_STATUS,
    version: safeContent.version,
    itemCount: items.length,
    items: items.map((item) => {
      const variables = item.prompt && Array.isArray(item.prompt.variables)
        ? item.prompt.variables
        : [];
      const content = item.prompt && item.prompt.content ? item.prompt.content : '';
      return {
        itemId: item.itemId,
        itemType: item.itemType,
        itemName: item.itemName,
        order: item.order,
        enabled: item.enabled !== false,
        model: models[item.itemId] || null,
        prompt: {
          content,
          displayContent: formatPromptForDisplay(content, variables),
          variables,
        },
      };
    }),
    raw: {
      modelConfig,
      checkItem,
    },
  };
}

function collectFields(value, out = []) {
  if (!value || typeof value !== 'object') {
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectFields(item, out));
    return out;
  }

  const fieldId = value.fieldId || value.fieldUuid || value.key || value.id;
  const fieldName = value.fieldName || value.label || value.title || value.name;
  const fieldType = value.fieldType || value.componentName || value.type;
  if (fieldId && fieldName && String(fieldId).match(/field/i)) {
    out.push({
      fieldId: String(fieldId),
      fieldName: resolveLocalizedText(fieldName, String(fieldName)),
      fieldType: fieldType ? String(fieldType) : '',
    });
  }

  Object.values(value).forEach((child) => collectFields(child, out));
  return out;
}

function normalizeFormComponents(response) {
  const fields = collectFields(response)
    .filter((field, index, list) => list.findIndex((item) => item.fieldId === field.fieldId) === index);
  return fields;
}

function filterCookiesForBaseUrl(baseUrl, cookies) {
  const host = new URL(baseUrl).hostname;
  const filtered = (cookies || []).filter((cookie) => {
    const domain = String(cookie.domain || '').replace(/^\./, '');
    return domain && (host === domain || host.endsWith(`.${domain}`));
  });
  return filtered.length > 0 ? filtered : (cookies || []);
}

function buildCookieHeader(baseUrl, cookies) {
  return filterCookiesForBaseUrl(baseUrl, cookies)
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');
}

function postJson(baseUrl, requestPath, payload, authRef, referer) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(baseUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    const requestModule = isHttps ? https : http;
    const body = JSON.stringify(payload);

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: requestPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        Accept: 'application/json, text/plain, */*',
        Origin: baseUrl,
        Referer: referer || `${baseUrl}/`,
        Cookie: buildCookieHeader(baseUrl, authRef.cookies),
        'x-requested-with': 'XMLHttpRequest',
        global_csrf_token: authRef.csrfToken,
      },
      timeout: 30000,
    };

    const req = requestModule.request(options, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (isLoginExpired(parsed)) { resolve({ __needLogin: true }); return; }
          if (isCsrfTokenExpired(parsed)) { resolve({ __csrfExpired: true }); return; }
          resolve(parsed);
        } catch {
          resolve({
            success: false,
            errorMsg: `HTTP ${res.statusCode}: ${t('common.response_not_json')}`,
          });
        }
      });
    });

    req.on('timeout', () => { req.destroy(); reject(new Error(t('common.request_timeout'))); });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function assertSuccess(response, action) {
  if (!response || response.success === false || response.__needLogin || response.__csrfExpired) {
    const message = response
      ? response.errorMsg || response.error || response.message || t('common.unknown_error')
      : t('common.request_failed');
    throw new Error(`${action}: ${message}`);
  }
  return Object.prototype.hasOwnProperty.call(response, 'content') ? response.content : response;
}

async function createAuthRef() {
  let cookieData = loadCookieData();
  if (!cookieData || !cookieData.cookies || !cookieData.csrf_token) {
    cookieData = await triggerLogin();
  }
  if (!cookieData || !cookieData.cookies || !cookieData.csrf_token) {
    throw new Error(t('ai_form_setting.no_login'));
  }
  return {
    csrfToken: cookieData.csrf_token,
    cookies: cookieData.cookies,
    baseUrl: resolveBaseUrl(cookieData),
    cookieData,
  };
}

function getAIApproveConfig(authRef, appType, formUuid) {
  return requestWithAutoLogin((auth) => {
    return httpGet(
      auth.baseUrl,
      `/${appType}/query/aiApprove/getAIApproveConfig.json`,
      buildCommonParams(auth.csrfToken, { formUuid }),
      auth.cookies
    );
  }, authRef);
}

function listModels(authRef, appType, itemType) {
  return requestWithAutoLogin((auth) => {
    return httpGet(
      auth.baseUrl,
      `/${appType}/query/aiApprove/listModels.json`,
      buildCommonParams(auth.csrfToken, itemType ? { itemType } : {}),
      auth.cookies
    );
  }, authRef);
}

function getFormComponent(authRef, appType, formUuid, itemType) {
  return requestWithAutoLogin((auth) => {
    return httpPost(
      auth.baseUrl,
      `/${appType}/query/aiApprove/getFormComponent.json`,
      querystring.stringify(buildCommonParams(auth.csrfToken, { formUuid, itemType })),
      auth.cookies
    );
  }, authRef);
}

function updateAIApproveStatus(authRef, appType, formUuid, status) {
  return requestWithAutoLogin((auth) => {
    return httpPost(
      auth.baseUrl,
      `/${appType}/query/aiApprove/updateAIApproveStatus.json`,
      querystring.stringify(buildCommonParams(auth.csrfToken, { formUuid, status })),
      auth.cookies
    );
  }, authRef);
}

function saveAIApproveConfig(authRef, appType, formUuid, payload) {
  const requestBody = {
    formUuid,
    modelConfig: payload.modelConfig,
    checkItem: payload.checkItem,
  };
  return requestWithAutoLogin((auth) => {
    return postJson(
      auth.baseUrl,
      `/${appType}/query/aiApprove/saveOrUpdateAIApproveConfig.json?_csrf_token=${encodeURIComponent(auth.csrfToken)}`,
      requestBody,
      auth,
      buildSettingsUrl(auth.baseUrl, appType, formUuid)
    );
  }, authRef);
}

function printJsonOutput(payload) {
  console.log(JSON.stringify(payload, null, 2));
}

async function runGet(args) {
  const { positional, flags } = parseFlags(args);
  const [appType, formUuid] = positional;
  if (!appType || !formUuid) {
    error(t('ai_form_setting.get_usage'), { hint: t('ai_form_setting.example_get') });
    return;
  }

  const authRef = await createAuthRef();
  const response = await getAIApproveConfig(authRef, appType, formUuid);
  const content = assertSuccess(response, t('ai_form_setting.get_action'));
  const normalized = normalizeStoredConfig(content);
  const output = {
    success: true,
    appType,
    formUuid,
    settingsUrl: buildSettingsUrl(authRef.baseUrl, appType, formUuid),
    config: flags.raw ? content : normalized,
  };

  if (!flags.json) {
    printResult(true, t('ai_form_setting.get_success'), [
      ['App', appType],
      ['Form', formUuid],
      ['Status', normalized.status || '-'],
      ['Items', String(normalized.itemCount)],
    ]);
  }
  printJsonOutput(output);
}

async function runModels(args) {
  const { positional, flags } = parseFlags(args);
  const [appType] = positional;
  if (!appType) {
    error(t('ai_form_setting.models_usage'), { hint: t('ai_form_setting.example_models') });
    return;
  }

  const authRef = await createAuthRef();
  const response = await listModels(authRef, appType, flags.type);
  const content = assertSuccess(response, t('ai_form_setting.models_action'));
  const output = {
    success: true,
    appType,
    itemType: flags.type || null,
    models: content,
  };
  if (!flags.json) {
    printResult(true, t('ai_form_setting.models_success'), [
      ['App', appType],
      ['Type', flags.type || 'ALL'],
    ]);
  }
  printJsonOutput(output);
}

async function runFields(args) {
  const { positional, flags } = parseFlags(args);
  const [appType, formUuid] = positional;
  const itemType = flags.type || 'TEXT';
  if (!appType || !formUuid) {
    error(t('ai_form_setting.fields_usage'), { hint: t('ai_form_setting.example_fields') });
    return;
  }

  const authRef = await createAuthRef();
  const response = await getFormComponent(authRef, appType, formUuid, itemType);
  const content = assertSuccess(response, t('ai_form_setting.fields_action'));
  const fields = normalizeFormComponents(content);
  const output = {
    success: true,
    appType,
    formUuid,
    itemType,
    fields,
  };
  if (!flags.json) {
    printResult(true, t('ai_form_setting.fields_success'), [
      ['App', appType],
      ['Form', formUuid],
      ['Type', itemType],
      ['Fields', String(fields.length)],
    ]);
  }
  printJsonOutput(output);
}

async function runStatusMutation(args, status) {
  const { positional, flags } = parseFlags(args);
  const [appType, formUuid] = positional;
  if (!appType || !formUuid) {
    error(t('ai_form_setting.status_usage'), { hint: t('ai_form_setting.example_enable') });
    return;
  }

  const authRef = await createAuthRef();
  const response = await updateAIApproveStatus(authRef, appType, formUuid, status);
  const content = assertSuccess(response, t('ai_form_setting.status_action'));
  const output = {
    success: true,
    appType,
    formUuid,
    status,
    enabled: status === ENABLED_STATUS,
    settingsUrl: buildSettingsUrl(authRef.baseUrl, appType, formUuid),
    response: content,
  };
  if (!flags.json) {
    success(status === ENABLED_STATUS ? t('ai_form_setting.enabled') : t('ai_form_setting.disabled'));
  }
  printJsonOutput(output);
}

async function runSave(args) {
  const { positional, flags } = parseFlags(args);
  const [appType, formUuid, input] = positional;
  if (!appType || !formUuid || !input) {
    error(t('ai_form_setting.save_usage'), { hint: t('ai_form_setting.example_save') });
    return;
  }

  const authRef = await createAuthRef();
  const payload = buildSavePayload(readJsonInput(input));
  const response = await saveAIApproveConfig(authRef, appType, formUuid, payload);
  const content = assertSuccess(response, t('ai_form_setting.save_action'));

  let statusResult = null;
  const requestedStatus = flags.enable
    ? ENABLED_STATUS
    : flags.disable
      ? DISABLED_STATUS
      : payload.status;
  if (requestedStatus) {
    statusResult = assertSuccess(
      await updateAIApproveStatus(authRef, appType, formUuid, requestedStatus),
      t('ai_form_setting.status_action')
    );
  }

  const output = {
    success: true,
    appType,
    formUuid,
    status: requestedStatus || null,
    settingsUrl: buildSettingsUrl(authRef.baseUrl, appType, formUuid),
    version: content && content.version,
    response: content,
    statusResponse: statusResult,
    saved: {
      modelConfig: parseMaybeJson(payload.modelConfig, {}),
      checkItem: parseMaybeJson(payload.checkItem, {}),
    },
  };

  if (!flags.json) {
    printResult(true, t('ai_form_setting.save_success'), [
      ['App', appType],
      ['Form', formUuid],
      ['Items', String(output.saved.checkItem.items ? output.saved.checkItem.items.length : 0)],
      ['Status', output.status || '-'],
    ]);
  }
  printJsonOutput(output);
}

async function run(args) {
  if (!args || args.length === 0 || hasHelpFlag(args)) {
    printUsage();
    return;
  }

  const subCommand = args[0];
  const subArgs = args.slice(1);
  try {
    switch (subCommand) {
      case 'get':
      case 'inspect':
      case 'status':
        return await runGet(subArgs);
      case 'fields':
      case 'components':
        return await runFields(subArgs);
      case 'models':
        return await runModels(subArgs);
      case 'enable':
        return await runStatusMutation(subArgs, ENABLED_STATUS);
      case 'disable':
        return await runStatusMutation(subArgs, DISABLED_STATUS);
      case 'save':
      case 'set':
        return await runSave(subArgs);
      default:
        warn(t('ai_form_setting.unknown_subcommand', subCommand));
        printUsage();
        return null;
    }
  } catch (err) {
    error(err.message || String(err));
    process.exit(1);
  }
}

module.exports = {
  DISABLED_STATUS,
  ENABLED_STATUS,
  VALID_ITEM_TYPES,
  buildSavePayload,
  buildSettingsUrl,
  normalizeFormComponents,
  normalizeItemType,
  normalizeStoredConfig,
  parseFlags,
  readJsonInput,
  run,
  __api__: {
    getAIApproveConfig,
    getFormComponent,
    listModels,
    saveAIApproveConfig,
    updateAIApproveStatus,
  },
};
