#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const { COMMAND_GROUPS, flattenCommandManifest } = require('../lib/core/command-manifest');

const ROOT = path.resolve(__dirname, '..');
const ROUTER_FILE = path.join(ROOT, 'bin/yida.js');
const README_FILE = path.join(ROOT, 'README.md');

const errors = [];

function toRelative(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join('/');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function commandRoot(value) {
  return String(value || '').trim().split(/\s+/)[0];
}

function collectRouterCases() {
  const text = fs.readFileSync(ROUTER_FILE, 'utf8');
  const cases = new Set();
  const pattern = /case '([^']+)'\s*:/g;
  let match = pattern.exec(text);
  while (match) {
    cases.add(match[1]);
    match = pattern.exec(text);
  }
  return cases;
}

function collectManifestRoots(commands) {
  const roots = new Set();
  for (const entry of commands) {
    roots.add(entry.path[0]);
    for (const alias of entry.aliases || []) {
      roots.add(commandRoot(alias));
    }
  }
  return roots;
}

function validateUniqueIds(commands) {
  const seen = new Set();
  for (const entry of commands) {
    if (seen.has(entry.id)) {
      errors.push(`Duplicate command manifest id: ${entry.id}`);
    }
    seen.add(entry.id);
  }
}

function validateRouterCoverage(commands) {
  const routerCases = collectRouterCases();
  const manifestRoots = collectManifestRoots(commands);

  for (const routerCase of [...routerCases].sort()) {
    if (!manifestRoots.has(routerCase)) {
      errors.push(`${toRelative(ROUTER_FILE)}: route case "${routerCase}" is missing from command manifest roots or aliases`);
    }
  }

  for (const root of [...manifestRoots].sort()) {
    if (!routerCases.has(root)) {
      errors.push(`${toRelative(ROUTER_FILE)}: command manifest root/alias "${root}" has no route case`);
    }
  }
}

function validateReadmeCoverage(commands) {
  const readme = fs.readFileSync(README_FILE, 'utf8');
  const visibleRoots = new Set(commands.filter(entry => !entry.hidden).map(entry => entry.path[0]));

  for (const root of [...visibleRoots].sort()) {
    const pattern = new RegExp(`yidaconnector\\s+${escapeRegExp(root)}(\\s|\`|$)`);
    if (!pattern.test(readme)) {
      errors.push(`${toRelative(README_FILE)}: visible command root "${root}" is missing from CLI reference`);
    }
  }
}

function validateGroupReferences() {
  const commands = new Set(flattenCommandManifest().map(entry => entry.id));
  for (const group of COMMAND_GROUPS) {
    for (const commandId of group.commands.map(entry => entry.id)) {
      if (!commands.has(commandId)) {
        errors.push(`Command group "${group.id}" references unknown command id "${commandId}"`);
      }
    }
  }
}

function run() {
  const commands = flattenCommandManifest();

  validateUniqueIds(commands);
  validateGroupReferences();
  validateRouterCoverage(commands);
  validateReadmeCoverage(commands);

  if (errors.length > 0) {
    console.error('Command manifest validation failed:');
    for (const error of errors) {
      console.error('  error ' + error);
    }
    process.exit(1);
  }

  console.log(`Command manifest OK: ${commands.length} entries aligned with router and README`);
}

run();
