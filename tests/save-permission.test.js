'use strict';

jest.mock('../lib/core/utils', () => ({
  loadCookieData: jest.fn(),
  triggerLogin: jest.fn(),
  resolveBaseUrl: jest.fn(() => 'https://www.aliwork.com'),
  isLoginExpired: jest.fn(() => false),
  isCsrfTokenExpired: jest.fn(() => false),
  requestWithAutoLogin: jest.fn(),
}));

jest.mock('../lib/core/i18n', () => ({
  t: jest.fn((key, ...args) => args.length ? `${key}: ${args.join(', ')}` : key),
}));

const utils = require('../lib/core/utils');
const { run } = require('../lib/permission/save-permission');

const mockCookieData = {
  csrf_token: 'csrf',
  cookies: [{ name: 'tianshu_csrf_token', value: 'csrf' }],
};

describe('save-permission command', () => {
  let mockLog;
  let mockError;
  let mockStderrWrite;

  beforeEach(() => {
    jest.clearAllMocks();
    utils.loadCookieData.mockReturnValue(mockCookieData);
    mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockStderrWrite = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    mockLog.mockRestore();
    mockError.mockRestore();
    mockStderrWrite.mockRestore();
  });

  test('updates field permissions without requiring data or action permissions', async () => {
    utils.requestWithAutoLogin
      .mockResolvedValueOnce({
        success: true,
        content: {
          formPermit: [
            {
              packageUuid: 'pkg-1',
              packageName: { zh_CN: '默认组' },
              roleMembers: [{ roleType: 'DEFAULT' }],
              dataPermit: '{"rule":[{"type":"ALL","value":"y"}]}',
              operatePermit: '{"OPERATE_VIEW":"y"}',
              fieldPermit: '{"fieldRange":"FORM"}',
            },
          ],
        },
      })
      .mockResolvedValueOnce({ success: true });

    await run([
      'APP-1',
      'FORM-1',
      '--field-permission',
      '{"role":"DEFAULT","fieldRange":"CUSTOM","fields":{"textField_a":"READONLY"}}',
    ]);

    expect(utils.requestWithAutoLogin).toHaveBeenCalledTimes(2);
    const output = JSON.parse(mockLog.mock.calls[0][0]);
    expect(output).toMatchObject({
      success: true,
      summary: {
        fieldPermission: '字段权限已更新',
      },
      message: '权限配置已保存',
    });
  });

  test('creates a permission group with custom fieldPermit payload', async () => {
    utils.requestWithAutoLogin.mockResolvedValueOnce({
      success: true,
      content: 'pkg-new',
    });

    await run([
      'APP-1',
      'FORM-1',
      '--create',
      '--name',
      '只读字段组',
      '--field-permission',
      '{"fieldRange":"CUSTOM","fields":{"textField_a":"READONLY"}}',
    ]);

    expect(utils.requestWithAutoLogin).toHaveBeenCalledTimes(1);
    const output = JSON.parse(mockLog.mock.calls[0][0]);
    expect(output).toMatchObject({
      success: true,
      packageUuid: 'pkg-new',
      summary: {
        name: '只读字段组',
        fieldPermission: '自定义 fieldPermit',
      },
      message: '权限组已新增',
    });
  });
});
