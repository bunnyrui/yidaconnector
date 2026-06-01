#!/usr/bin/env node

'use strict';

const { spawnSync } = require('child_process');

const MAX_TARBALL_BYTES = 1536 * 1024;
const MAX_UNPACKED_BYTES = 4608 * 1024;
const MAX_ENTRY_COUNT = 300;
const MAX_SINGLE_FILE_BYTES = 512 * 1024;

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KiB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}

function fail(message) {
  console.error('Package size validation failed:');
  console.error('  error ' + message);
  process.exit(1);
}

function runNpmPackDryRun() {
  const result = spawnSync('npm', ['pack', '--dry-run', '--json'], {
    encoding: 'utf8',
    stdio: 'pipe',
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    process.exit(result.status || 1);
  }

  try {
    const parsed = JSON.parse(result.stdout);
    return parsed[0];
  } catch (_error) {
    process.stderr.write(result.stdout);
    fail('npm pack --dry-run --json did not return valid JSON');
  }
}

function validateLargestFiles(files) {
  const sorted = [...files].sort((a, b) => b.size - a.size);
  const oversized = sorted.find(file => file.size > MAX_SINGLE_FILE_BYTES);
  if (oversized) {
    fail(`${oversized.path} is ${formatBytes(oversized.size)}, above ${formatBytes(MAX_SINGLE_FILE_BYTES)}`);
  }

  return sorted.slice(0, 5).map(file => `${file.path} (${formatBytes(file.size)})`);
}

function run() {
  const pack = runNpmPackDryRun();
  const largestFiles = validateLargestFiles(pack.files || []);

  if (pack.size > MAX_TARBALL_BYTES) {
    fail(`tarball is ${formatBytes(pack.size)}, above ${formatBytes(MAX_TARBALL_BYTES)}`);
  }
  if (pack.unpackedSize > MAX_UNPACKED_BYTES) {
    fail(`unpacked package is ${formatBytes(pack.unpackedSize)}, above ${formatBytes(MAX_UNPACKED_BYTES)}`);
  }
  if (pack.entryCount > MAX_ENTRY_COUNT) {
    fail(`package has ${pack.entryCount} files, above ${MAX_ENTRY_COUNT}`);
  }

  console.log(
    `Package size OK: ${formatBytes(pack.size)} tarball, ${formatBytes(pack.unpackedSize)} unpacked, ${pack.entryCount} files`
  );
  console.log('Largest files: ' + largestFiles.join(', '));
}

run();
