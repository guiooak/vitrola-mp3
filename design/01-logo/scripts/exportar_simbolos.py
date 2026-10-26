# Exporta os <symbol> de logo-vinil.html como SVGs avulsos e camadas do ícone Android.
# Uso: python3 exportar_simbolos.py logo-vinil.html export
import re, sys, pathlib
src = pathlib.Path(sys.argv[1]).read_text()
out = pathlib.Path(sys.argv[2]); (out / "android").mkdir(parents=True, exist_ok=True)

def body(sym_id):
    m = re.search(rf'<symbol id="{sym_id}" viewBox="0 0 200 200">(.*?)</symbol>', src, re.S)
    return m.group(1).strip("\n")

def svg(view, inner, extra=""):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}"{extra}>\n{inner}\n</svg>\n'

full, small, mono = body("s-full"), body("s-small"), body("s-mono")
fg = 'transform="translate(23 24.2) scale(0.31)"'
files = {
    "vitrola-simbolo.svg": svg("0 0 200 200", full),
    "vitrola-simbolo-pequeno.svg": svg("0 0 200 200", small),
    "vitrola-simbolo-mono.svg": svg("0 0 200 200", mono, ' color="#000000"'),
    "vitrola-icone-app.svg": svg("0 0 200 200", '<rect width="200" height="200" rx="44" fill="#F3E9D2"/>\n' + full),
    "android/ic_launcher_foreground.svg": svg("0 0 108 108", f"<g {fg}>\n{full}\n</g>"),
    "android/ic_launcher_background.svg": svg("0 0 108 108", '<rect width="108" height="108" fill="#F3E9D2"/>'),
    "android/ic_launcher_monochrome.svg": svg("0 0 108 108", f"<g {fg}>\n{mono}\n</g>", ' color="#000000"'),
    "android/ic_notification.svg": svg("0 0 200 200", mono, ' color="#FFFFFF"'),
}
for name, content in files.items():
    (out / name).write_text(content)
    print(name)
