# Converts "Vitrola" (Fraunces 800) and "Mp3" (Fraunces 500) into SVG outlines
# Usage: python outline_wordmark.py Fraunces.ttf wordmark.json
import sys, json, uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

path = sys.argv[1]
blob = hb.Blob.from_file_path(path)
face = hb.Face(blob)
upem = face.upem
tt = TTFont(path)

def outline(text, wght, opsz=144):
    font = hb.Font(face)
    font.set_variations({"wght": wght, "opsz": opsz, "SOFT": 0, "WONK": 0})
    buf = hb.Buffer(); buf.add_str(text); buf.guess_segment_properties()
    hb.shape(font, buf, {"kern": True, "liga": True})
    x = 0; d = []
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        pen = SVGPathPen(None)
        # flip the Y axis (font units grow upward, SVG grows downward)
        tp = TransformPen(pen, (1, 0, 0, -1, x + pos.x_offset, -pos.y_offset))
        font.draw_glyph_with_pen(info.codepoint, tp)
        d.append(pen.getCommands())
        x += pos.x_advance
    return {"d": " ".join(d), "width": x}

os2 = tt["OS/2"]
out = {
    "upem": upem,
    "capHeight": getattr(os2, "sCapHeight", 0),
    "xHeight": getattr(os2, "sxHeight", 0),
    "descender": tt["hhea"].descent,
    "space": None,
    "vitrola": outline("Vitrola", 800),
    "mp3": outline("Mp3", 500),
}
f = hb.Font(face); f.set_variations({"wght": 800, "opsz": 144})
out["space"] = f.get_glyph_h_advance(f.get_nominal_glyph(32))
json.dump(out, open(sys.argv[2], "w"))
print({k: (v["width"] if isinstance(v, dict) else v) for k, v in out.items()})
