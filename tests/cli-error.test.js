'use strict';

const { CliError, isCliError, toErrorPayload } = require('../lib/core/cli-error');

describe('CliError', () => {
  test('keeps exit code and code metadata', () => {
    const error = new CliError('Bad input', {
      code: 'BAD_INPUT',
      exitCode: 2,
      details: { token: 'secret-token-value' },
      usage: 'yidaconnector example',
    });

    expect(isCliError(error)).toBe(true);
    expect(error.exitCode).toBe(2);
    expect(error.usage).toBe('yidaconnector example');
    expect(toErrorPayload(error)).toEqual({
      success: false,
      errorCode: 'BAD_INPUT',
      errorMsg: 'Bad input',
      details: { token: 'secr***alue' },
    });
  });

  test('normal errors become unexpected error payloads', () => {
    const payload = toErrorPayload(new Error('Boom'));

    expect(payload).toEqual({
      success: false,
      errorCode: 'UNEXPECTED_ERROR',
      errorMsg: 'Boom',
    });
  });
});
