#!/usr/bin/env bash
set -euo pipefail
echo "=== CI native package diagnostics ==="
echo "Node: $(node --version)  npm: $(npm --version)"
echo "PWD: $(pwd)"
echo "--- Top-level packages ---"
npm ls --depth=0 2>/dev/null | sed -n '1,40p' || true

echo "--- Searching for .node files (first 50) ---"
find node_modules -type f -name '*.node' -print | head -n 50 || true

echo "--- lightningcss pkg folder (if any) ---"
if [ -d "node_modules/lightningcss/pkg" ]; then
  echo "OK: node_modules/lightningcss/pkg exists"
else
  find node_modules -type d -name "pkg" -path "*/lightningcss/*" -print | head -n 10 || echo "MISSING: lightningcss pkg not found"
fi

echo "--- @tailwindcss oxide dirs ---"
find node_modules -type d -name "*oxide*" -print | head -n 20 || echo "MISSING: @tailwindcss oxide dirs not found"

echo "=== End diagnostics ==="
# keep exit 0 for diagnostics only