/**
 * update.js - openyida 自更新命令
 *
 * 检查 npm registry 上的最新版本，若有新版则执行 npm install -g openyida@latest 更新。
 * 类似 openclaw update 的行为：检查 → 提示 → 执行更新。
 */

'use strict';

const { execSync } = require('child_process');
const { fetchLatestVersion, isNewer } = require('./check-update');
const { t } = require('./i18n');

/**
 * 执行自更新流程：
 * 1. 查询 npm registry 获取最新版本
 * 2. 与当前版本比较
 * 3. 若有新版本，执行 npm install -g openyida@latest
 * 4. 若已是最新，提示无需更新
 *
 * @param {string} currentVersion - 当前版本号（来自 package.json）
 */
async function runUpdate(currentVersion) {
  console.log(t('update.checking'));

  const latestVersion = await fetchLatestVersion();

  if (!latestVersion) {
    console.error(t('update.fetch_failed'));
    process.exit(1);
  }

  if (!isNewer(currentVersion, latestVersion)) {
    console.log(t('update.already_latest', currentVersion));
    return;
  }

  console.log(t('update.found_new_version', latestVersion, currentVersion));
  console.log(t('update.installing'));

  try {
    execSync('npm install -g openyida@latest', { stdio: 'inherit' });
    console.log(t('update.success', latestVersion));
  } catch (error) {
    console.error(t('update.install_failed', error.message));
    console.error(t('update.manual_hint'));
    process.exit(1);
  }
}

module.exports = { runUpdate };
