#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "=== Step 1: Install dependencies ==="
npm ci --ignore-scripts

echo ""
echo "=== Step 2: Validate project structure ==="
npm run check:structure

echo ""
echo "=== Step 3: Validate skills ==="
npm run check:skills

echo ""
echo "=== Step 4: Validate command manifest ==="
npm run check:commands

echo ""
echo "=== Step 5: Validate generated command docs ==="
npm run check:docs

echo ""
echo "=== Step 6: Build Wukong skills package ==="
npm run build:skills

echo ""
echo "=== Step 7: Check JavaScript syntax ==="
npm run check:syntax

echo ""
echo "=== Step 8: Run lint ==="
npm run lint

echo ""
echo "=== Step 9: Run tests ==="
npm run test:unit -- --runInBand

echo ""
echo "=== Step 10: Validate npm package size budget ==="
npm run check:package-size

echo ""
echo "=== Step 11: Validate npm package contents ==="
npm run check:package

echo ""
echo "=== All checks passed! ==="
