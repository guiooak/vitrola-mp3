#!/usr/bin/env bash
# Regenerates every SVG in design/01-logo/export from logo.html.
# Requires: python3, uv and curl (the Fraunces font is downloaded from the Google Fonts repository).
set -euo pipefail
cd "$(dirname "$0")/.."
tmp="$(mktemp -d)"
curl -sSL -o "$tmp/fraunces.ttf" "https://github.com/google/fonts/raw/main/ofl/fraunces/Fraunces%5BSOFT,WONK,opsz,wght%5D.ttf"
python3 -I scripts/export_symbols.py logo.html export
uv run -q --no-project --with fonttools --with uharfbuzz python -I scripts/outline_wordmark.py "$tmp/fraunces.ttf" "$tmp/wordmark.json"
python3 -I scripts/build_lockups.py "$tmp/wordmark.json" logo.html export
rm -rf "$tmp"
echo "SVGs updated in design/01-logo/export"
