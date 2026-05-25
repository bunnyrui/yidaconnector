'use strict';

const querystring = require('querystring');
const { __test__ } = require('../lib/app/import-app');

describe('import-app helpers', () => {
  test('preserves page/report formType when creating imported placeholders', () => {
    expect(__test__.normalizeImportFormType('display')).toBe('display');
    expect(__test__.normalizeImportFormType('report')).toBe('report');
    expect(__test__.normalizeImportFormType('receipt')).toBe('receipt');
    expect(__test__.normalizeImportFormType('form')).toBe('receipt');
    expect(__test__.normalizeImportFormType('')).toBe('receipt');

    const displayPayload = querystring.parse(
      __test__.buildCreateFormPostData('csrf-1', 'Imported Page', 'display')
    );
    const reportPayload = querystring.parse(
      __test__.buildCreateFormPostData('csrf-1', 'Imported Report', 'report')
    );

    expect(displayPayload.formType).toBe('display');
    expect(reportPayload.formType).toBe('report');
    expect(displayPayload._csrf_token).toBe('csrf-1');
    expect(JSON.parse(displayPayload.title).zh_CN).toBe('Imported Page');
  });

  test('adapts app and form identifiers inside exported schema content', () => {
    const schema = {
      pages: [{ id: 'FORM-OLD', props: { appType: 'APP_OLD' } }],
      actions: { source: 'APP_OLD/FORM-OLD' },
    };

    expect(__test__.adaptSerialNumberFormulas(schema, 'APP_OLD', 'APP_NEW', 'FORM-OLD', 'FORM-NEW')).toEqual({
      pages: [{ id: 'FORM-NEW', props: { appType: 'APP_NEW' } }],
      actions: { source: 'APP_NEW/FORM-NEW' },
    });
  });
});
