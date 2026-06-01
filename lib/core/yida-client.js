'use strict';

const querystring = require('querystring');
const {
  loadCookieData,
  triggerLogin,
  resolveBaseUrl,
  extractInfoFromCookies,
  httpPost,
  httpPostJson,
  httpGet,
  requestWithAutoLogin,
} = require('./utils');

function createAuthRef(cookieData) {
  const cachedCookieData = cookieData || loadCookieData();
  const loadedCookieData = cachedCookieData && cachedCookieData.cookies
    ? cachedCookieData
    : triggerLogin();
  const safeCookieData = loadedCookieData || {};
  const cookieInfo = typeof extractInfoFromCookies === 'function'
    ? extractInfoFromCookies(safeCookieData.cookies || [])
    : {};

  return {
    csrfToken: safeCookieData.csrf_token || cookieInfo.csrfToken || '',
    cookies: safeCookieData.cookies || [],
    baseUrl: resolveBaseUrl(safeCookieData),
    cookieData: safeCookieData,
    corpId: safeCookieData.corp_id || cookieInfo.corpId || '',
    userId: safeCookieData.user_id || cookieInfo.userId || '',
  };
}

class YidaClient {
  constructor(options = {}) {
    this.authRef = options.authRef || createAuthRef(options.cookieData);
  }

  getAuthRef() {
    return this.authRef;
  }

  async get(requestPath, queryParams, options) {
    return requestWithAutoLogin(
      (ref) => {
        const resolvedRequestPath = typeof requestPath === 'function'
          ? requestPath(ref)
          : requestPath;
        const resolvedQueryParams = typeof queryParams === 'function'
          ? queryParams(ref)
          : queryParams;
        if (options === undefined) {
          return httpGet(ref.baseUrl, resolvedRequestPath, resolvedQueryParams || null, ref.cookies);
        }
        return httpGet(ref.baseUrl, resolvedRequestPath, resolvedQueryParams || null, ref.cookies, options);
      },
      this.authRef
    );
  }

  async postForm(requestPath, bodyParams, options) {
    return requestWithAutoLogin(
      (ref) => {
        const resolvedRequestPath = typeof requestPath === 'function'
          ? requestPath(ref)
          : requestPath;
        const resolvedBodyParams = typeof bodyParams === 'function'
          ? bodyParams(ref)
          : bodyParams;
        const postData = typeof resolvedBodyParams === 'string'
          ? resolvedBodyParams
          : querystring.stringify(resolvedBodyParams || {});
        if (options === undefined) {
          return httpPost(ref.baseUrl, resolvedRequestPath, postData, ref.cookies);
        }
        return httpPost(ref.baseUrl, resolvedRequestPath, postData, ref.cookies, options);
      },
      this.authRef
    );
  }

  async postJson(requestPath, bodyParams, options) {
    return requestWithAutoLogin(
      (ref) => {
        const resolvedRequestPath = typeof requestPath === 'function'
          ? requestPath(ref)
          : requestPath;
        const resolvedBodyParams = typeof bodyParams === 'function'
          ? bodyParams(ref)
          : bodyParams;
        const resolvedOptions = typeof options === 'function'
          ? options(ref)
          : options;
        const requestOptions = Object.assign({ csrfToken: ref.csrfToken }, resolvedOptions || {});
        return httpPostJson(
          ref.baseUrl,
          resolvedRequestPath,
          resolvedBodyParams || {},
          ref.cookies,
          requestOptions
        );
      },
      this.authRef
    );
  }
}

function createYidaClient(options = {}) {
  return new YidaClient(options);
}

module.exports = {
  YidaClient,
  createAuthRef,
  createYidaClient,
};
