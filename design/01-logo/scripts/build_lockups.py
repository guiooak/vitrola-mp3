# Builds the "Vitrola Mp3" lockups (symbol + outlined name).
# Usage: python3 build_lockups.py wordmark.json logo.html export
import json, re, sys, pathlib
wm = json.load(open(sys.argv[1]))
src = pathlib.Path(sys.argv[2]).read_text()
out = pathlib.Path(sys.argv[3])
sym = re.search(r'<symbol id="s-full" viewBox="0 0 200 200">(.*?)</symbol>', src, re.S).group(1).strip("\n")

F = 104; s = F / wm["upem"]
cap = wm["capHeight"] * s
w_v, w_sp, w_m = wm["vitrola"]["width"] * s, wm["space"] * s, wm["mp3"]["width"] * s
text_w = w_v + w_sp + w_m

def text(x, base, color):
    return (f'<g fill="{color}">'
            f'<path transform="translate({x:.2f} {base:.2f}) scale({s:.4f})" d="{wm["vitrola"]["d"]}"/>'
            f'<path transform="translate({x + w_v + w_sp:.2f} {base:.2f}) scale({s:.4f})" d="{wm["mp3"]["d"]}"/>'
            f'</g>')

def svg(vb, inner, title):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="{title}">\n<title>{title}</title>\n{inner}\n</svg>\n'

COLORS = {"positive": "#7A1F2B", "negative": "#F3E9D2"}
files = {}
for name, color in COLORS.items():
    # Horizontal: symbol on the left, name vertically centered on the record
    base = 110 + cap / 2
    tx = 212
    W = tx + text_w + 8
    files[f"vitrola-mp3-horizontal-{name}.svg"] = svg(f"16 8 {W - 16:.0f} 178",
        f"<g>{sym}</g>\n" + text(tx, base, color), "Vitrola Mp3")
    # Vertical: symbol on top, name below
    VW = text_w + 24
    sx = (VW - 200) / 2 - 9   # compensates for the record being shifted left
    vbase = 200 + 14 + cap
    files[f"vitrola-mp3-vertical-{name}.svg"] = svg(f"0 6 {VW:.0f} {vbase + 30 - 6:.0f}",
        f'<g transform="translate({sx:.2f} 0)">{sym}</g>\n' + text(12, vbase, color), "Vitrola Mp3")
    # Name only
    files[f"vitrola-mp3-wordmark-{name}.svg"] = svg(f"0 0 {text_w + 8:.0f} {cap + 36:.0f}",
        text(4, cap + 6, color), "Vitrola Mp3")

for n, c in files.items():
    (out / n).write_text(c); print(n)
print("text_w", round(text_w, 1), "cap", round(cap, 1))
