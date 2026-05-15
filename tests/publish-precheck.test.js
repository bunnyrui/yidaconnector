'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

jest.mock('../lib/app/form-navigation', () => ({
  fetchFormPageList: jest.fn(),
}));

const { fetchFormPageList } = require('../lib/app/form-navigation');
const {
  findDuplicateSourceMismatches,
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
});
