"""Gera tokens.css e tokens.js a partir de tokens.json.

Uso: python3 gerar_tokens.py
"""
import json
import pathlib

aqui = pathlib.Path(__file__).parent
t = json.loads((aqui / "tokens.json").read_text())


def cores(tema):
    return "\n".join(f"  --cor-{k}: {v};" for k, v in t["cores"][tema].items())


linhas = ["/* Gerado por gerar_tokens.py a partir de tokens.json. Não edite à mão. */", ":root {"]
linhas.append(cores("claro"))

fam = t["tipografia"]["familias"]
linhas.append(f'  --fonte-marca: "{fam["marca"]}", Georgia, serif;')
linhas.append(f'  --fonte-interface: "{fam["interface"]}", system-ui, sans-serif;')
for nome, e in t["tipografia"]["escala"].items():
    linhas.append(f"  --tipo-{nome}: {e['peso']} {e['tamanho']}px/{e['altura']}px var(--fonte-{e['familia']});")
for k, v in t["espaco"].items():
    linhas.append(f"  --espaco-{k}: {v}px;")
for k, v in t["raio"].items():
    linhas.append(f"  --raio-{k}: {v}px;")
for k, v in t["elevacao"].items():
    linhas.append(f"  --elevacao-{k}: {v};")
for k, v in t["movimento"]["duracao"].items():
    linhas.append(f"  --duracao-{k}: {v}ms;")
for k, v in t["movimento"]["curva"].items():
    linhas.append(f"  --curva-{k}: {v};")
linhas.append("  color-scheme: light;")
linhas.append("}")

escuro = cores("escuro")
linhas += [
    "@media (prefers-color-scheme: dark) {",
    '  :root:not([data-theme="light"]) {',
    escuro.replace("  --", "    --"),
    "    color-scheme: dark;",
    "  }",
    "}",
    ':root[data-theme="dark"] {',
    escuro,
    "  color-scheme: dark;",
    "}",
]
(aqui / "tokens.css").write_text("\n".join(linhas) + "\n")
# Cópia em JS para a página do style guide ler os tokens mesmo aberta via file://
(aqui / "tokens.js").write_text(
    "// Gerado por gerar_tokens.py a partir de tokens.json. Não edite à mão.\n"
    f"window.TOKENS = {json.dumps(t, ensure_ascii=False, indent=2)};\n"
)
print("tokens.css e tokens.js atualizados")
