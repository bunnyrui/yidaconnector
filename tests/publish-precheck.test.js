'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

jest.mock('../lib/app/form-navigation', () => ({
  fetchFormPageList: jest.fn(),
}));

const { fetchFormPageList } = require('../lib/app/form-navigation');
const {
  buildDefaultPageDataSource,
  buildSchemaContent,
  countCustomPageDataSources,
  extractPageDataSource,
  findDuplicateSourceMismatches,
  mergePageDataSource,
  verifyPublishTarget,
} = require('../lib/app/publish');

describe('publish prechecks', () => {
  let workspace;

  beforeEach(() => {
    workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'openyida-publish-precheck-'));
    jest.clearAllMocks();
  });

  afterEach(() => {
    fs.rmSync(workspace, { recursive: true, force: true });
  });

  test('detects project and artifacts copies with the same name but different content', () => {
    const projectRoot = path.join(workspace, 'project');
    const projectSourceDir = path.join(projectRoot, 'pages', 'src');
    const artifactDir = path.join(workspace, 'projects', 'demo-id', 'artifacts');
    fs.mkdirSync(projectSourceDir, { recursive: true });
    fs.mkdirSync(artifactDir, { recursive: true });

    const sourcePath = path.join(projectSourceDir, 'dashboard.jsx');
    const artifactPath = path.join(artifactDir, 'dashboard.jsx');
    fs.writeFileSync(sourcePath, 'export function renderJsx() { return <div>A</div>; }\n', 'utf8');
    fs.writeFileSync(artifactPath, 'export function renderJsx() { return <div>B</div>; }\n', 'utf8');

    const mismatches = findDuplicateSourceMismatches(sourcePath, projectRoot);

    expect(mismatches).toEqual([
      { sourcePath, duplicatePath: artifactPath },
    ]);
  });

  test('allows publishing only to display custom pages', async () => {
    fetchFormPageList.mockResolvedValue([
      { formUuid: 'FORM-DATA', formName: 'Skill 信息底表', formType: 'receipt' },
      { formUuid: 'FORM-PAGE', formName: 'Skill 广场首页', formType: 'display' },
    ]);

    await expect(verifyPublishTarget('APP_XXX', 'FORM-PAGE', {})).resolves.toEqual({
      ok: true,
      target: { formUuid: 'FORM-PAGE', formName: 'Skill 广场首页', formType: 'display' },
    });

    await expect(verifyPublishTarget('APP_XXX', 'FORM-DATA', {})).resolves.toEqual({
      ok: false,
      reason: 'wrong_type',
      target: { formUuid: 'FORM-DATA', formName: 'Skill 信息底表', formType: 'receipt' },
    });
  });

  test('supports an explicit force bypass for unusual publish targets', async () => {
    await expect(verifyPublishTarget('APP_XXX', 'FORM-DATA', {}, { force: true })).resolves.toEqual({
      ok: true,
      skipped: true,
    });

    expect(fetchFormPageList).not.toHaveBeenCalled();
  });

  test('preserves existing custom page data sources while keeping built-ins', () => {
    const existingDataSource = {
      offline: [{ id: 'LOCAL_1', name: 'localCache', protocal: 'VALUE', initialData: [] }],
      online: [
        { id: 'REMOTE_1', name: 'customers', protocal: 'HTTP', url: '/query/customers' },
        { id: 'VCB660714833IBHEOXK376TA7XJH2AXUWR8MMW', name: 'urlParams', protocal: 'URI', custom: true },
        { id: 'SERVER_TIMESTAMP_1', name: 'timestamp', protocal: 'VALUE', initialData: '' },
      ],
      list: [{ id: 'REMOTE_1', name: 'customers', protocal: 'HTTP', url: '/query/customers' }],
      globalConfig: {
        fit: { type: 'js', source: 'function fit(response) { return response; }' },
        timeout: 30000,
      },
      sync: false,
      extra: 'keep-me',
    };

    const merged = mergePageDataSource(
      existingDataSource,
      buildDefaultPageDataSource('FORM-PAGE')
    );

    expect(merged.extra).toBe('keep-me');
    expect(merged.sync).toBe(false);
    expect(merged.globalConfig.fit.source).toBe('function fit(response) { return response; }');
    expect(merged.globalConfig.timeout).toBe(30000);
    expect(merged.online.map((item) => item.name)).toEqual(['customers', 'urlParams', 'timestamp']);
    expect(merged.list.map((item) => item.name)).toEqual(['customers', 'urlParams', 'timestamp']);
    expect(merged.offline.map((item) => item.name)).toEqual(['localCache']);
    expect(countCustomPageDataSources(merged)).toBe(2);
  });

  test('builds publish schema with existing page data sources merged in', () => {
    const existingDataSource = {
      online: [{ id: 'REMOTE_ORDERS', name: 'orders', protocal: 'HTTP', url: '/query/orders' }],
      list: [{ id: 'REMOTE_ORDERS', name: 'orders', protocal: 'HTTP', url: '/query/orders' }],
    };

    const previousQuiet = process.env.YIDA_QUIET;
    process.env.YIDA_QUIET = '1';
    let schema;
    try {
      schema = JSON.parse(buildSchemaContent(
        'export function renderJsx() { return React.createElement("div", null, "ok"); }',
        'function renderJsx(){return React.createElement("div",null,"ok");}',
        'FORM-PAGE',
        { existingDataSource }
      ));
    } finally {
      if (previousQuiet === undefined) {
        delete process.env.YIDA_QUIET;
      } else {
        process.env.YIDA_QUIET = previousQuiet;
      }
    }
    const pageDataSource = extractPageDataSource(schema);

    expect(pageDataSource.online.map((item) => item.name)).toEqual(['orders', 'urlParams', 'timestamp']);
    expect(pageDataSource.list.map((item) => item.name)).toEqual(['orders', 'urlParams', 'timestamp']);
  });
});
