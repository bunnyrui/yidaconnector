'use strict';

const { createYidaClient } = require('../core/yida-client');
const { buildYidaI18n } = require('../core/yida-i18n');

/**
 * 调用 saveFormSchemaInfo 创建空白报表
 */
async function createBlankReport(authRef, appType, reportTitle) {
  return createYidaClient({ authRef }).postForm(`/dingtalk/web/${appType}/query/formdesign/saveFormSchemaInfo.json`, auth => ({
    _csrf_token: auth.csrfToken,
    formType: 'report',
    title: JSON.stringify(buildYidaI18n(reportTitle, { en_US: reportTitle, ja_JP: reportTitle })),
  }));
}

/**
 * 调用 saveFormSchema 保存报表 Schema
 */
async function saveReportSchema(authRef, appType, reportId, schema) {
  return createYidaClient({ authRef }).postForm(`/dingtalk/web/${appType}/_view/query/formdesign/saveFormSchema.json`, auth => ({
    _csrf_token: auth.csrfToken,
    formUuid: reportId,
    content: JSON.stringify(schema),
    schemaVersion: 'V5',
    importSchema: 'true',
  }));
}

module.exports = {
  createBlankReport,
  saveReportSchema,
};
