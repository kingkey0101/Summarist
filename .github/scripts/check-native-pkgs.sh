#!/usr/bin/env bash
set -euo pipefail
echo "=== CI native package diagnostics ==="
echo "Node: $(node --version)  npm: $(npm --version)"
echo "PWD: $(pwd)"
echo "--- List top-level installed packages (first 200 chars) ---"
npm ls --depth=0 2>/dev/null | sed -n '1,20p' || true

echo "--- Searching for native .node files under node_modules ---"
FOUND_NODE_FILES=$(find node_modules -type f -name '*.node' -print | head -n 50 || true)
if [ -z "$FOUND_NODE_FILES" ]; then
  echo "WARNING: no .node files found (node native binaries)."
else
  echo "Found .node files (first 50):"
  echo "$FOUND_NODE_FILES"
fi

echo "--- Looking for lightningcss or @tailwindcss oxide pkg folders ---"
if [ -d "node_modules/lightningcss/pkg" ] || find node_modules -type d -name "pkg" -path "*/lightningcss/*" -print | grep -q '.'; then
  echo "OK: lightningcss pkg folder found."
else
  echo "MISSING: lightningcss pkg folder not found."
fi

if find node_modules -type d -name "*oxide*" -print | grep -q '.'; then
  echo "OK: found @tailwindcss oxide package directories:"
  find node_modules -type d -name "*oxide*" -print | head -n 20
else
  echo "MISSING: @tailwindcss oxide directories not found."
fi

echo "--- Check for Biome linux CLI installed under node_modules ---"
if node -e "try{require.resolve('@biomejs/cli-linux-x64/biome'); console.log('OK: @biomejs/cli-linux-x64/biome is resolvable');}catch(e){console.error('MISSING: @biomejs/cli-linux-x64/biome not resolvable'); process.exit(1)}"; then
  true
else
  echo "Biome linux CLI not resolvable from node_modules."
fi

echo "=== End diagnostics ==="
# If we reach here, keep exit 0 so it's diagnostic only; uncomment to fail CI when missing:
# exit 1