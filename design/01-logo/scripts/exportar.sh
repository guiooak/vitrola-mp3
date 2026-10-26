#!/usr/bin/env bash
# Regera todos os SVGs de design/01-logo/export a partir de logo-vinil.html.
# Precisa de: python3, uv e curl (a fonte Fraunces é baixada do repositório do Google Fonts).
set -euo pipefail
cd "$(dirname "$0")/.."
tmp="$(mktemp -d)"
curl -sSL -o "$tmp/fraunces.ttf" "https://github.com/google/fonts/raw/main/ofl/fraunces/Fraunces%5BSOFT,WONK,opsz,wght%5D.ttf"
python3 -I scripts/exportar_simbolos.py logo-vinil.html export
uv run -q --no-project --with fonttools --with uharfbuzz python -I scripts/contornar_nome.py "$tmp/fraunces.ttf" "$tmp/nome.json"
python3 -I scripts/montar_assinaturas.py "$tmp/nome.json" logo-vinil.html export
rm -rf "$tmp"
echo "SVGs atualizados em design/01-logo/export"
