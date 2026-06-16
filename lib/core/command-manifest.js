'use strict';

function command(id, path, usage, descriptionKey, options = {}) {
  return {
    id,
    path,
    command: path[0],
    name: path.join(' '),
    usage,
    descriptionKey,
    requiresLogin: options.requiresLogin !== false,
    output: options.output || 'text',
    aliases: options.aliases || [],
    examples: options.examples || [],
    hidden: options.hidden === true,
  };
}

const COMMAND_GROUPS = [
  {
    id: 'auth',
    titleKey: 'help.group_auth',
    commands: [
      command('login', ['login'], 'login [target-url] [--qr|--agent-qr|--codex|--browser] [--env <name>|--intl|--overseas|--global|--yidaapps|--alibaba] [--corp-id <corpId>]', 'help.cmd_login', {
        requiresLogin: false,
        output: 'json',
      }),
      command('logout', ['logout'], 'logout', 'help.cmd_logout', { requiresLogin: false }),
      command('auth', ['auth'], 'auth <status|login|refresh|logout>', 'help.cmd_auth', { requiresLogin: false }),
      command('org', ['org'], 'org <list|switch>', 'help.cmd_org'),
      command('env', ['env'], 'env [--json]', 'help.cmd_env', {
        requiresLogin: false,
        output: 'text|json',
      }),
      command('env-management', ['env'], 'env <setup|list|show|switch|add|remove>', 'help.cmd_env_management', {
        requiresLogin: false,
      }),
    ],
  },
  {
    id: 'data',
    titleKey: 'help.group_data',
    commands: [
      command('data', ['data'], 'data <action> <resource> [args]', 'help.cmd_data'),
    ],
  },
  {
    id: 'utility',
    titleKey: 'help.group_utility',
    commands: [
      command('commands', ['commands'], 'commands [--json]', 'help.cmd_commands', {
        requiresLogin: false,
        output: 'json',
      }),
    ],
  },
];

function flattenCommandManifest(groups = COMMAND_GROUPS) {
  return groups.flatMap(group => group.commands.map(entry => ({ ...entry, group: group.id })));
}

function localizeCommand(entry, translate) {
  return {
    id: entry.id,
    name: entry.name,
    path: entry.path,
    command: entry.command,
    usage: `openyida ${entry.usage}`,
    raw_usage: entry.usage,
    description: translate(entry.descriptionKey),
    description_key: entry.descriptionKey,
    group: entry.group,
    requires_login: entry.requiresLogin,
    output: entry.output,
    aliases: entry.aliases,
    examples: entry.examples,
    hidden: entry.hidden,
  };
}

function buildCommandManifest(options = {}) {
  const translate = typeof options.t === 'function' ? options.t : key => key;
  const commands = flattenCommandManifest();

  return {
    schema_version: 1,
    name: 'openyida',
    version: options.version || null,
    aliases: ['yida'],
    command_prefix: 'openyida',
    groups: COMMAND_GROUPS.map(group => ({
      id: group.id,
      title: translate(group.titleKey),
      title_key: group.titleKey,
      commands: group.commands.map(entry => entry.id),
    })),
    commands: commands.map(entry => localizeCommand(entry, translate)),
  };
}

module.exports = {
  COMMAND_GROUPS,
  buildCommandManifest,
  flattenCommandManifest,
};
