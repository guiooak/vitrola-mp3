# Style guide — Vitrola Mp3

| File | What it is |
|---|---|
| `style-guide.html` | The visual guide (open in a browser): principles, colors, typography, space, icons, components, motion, voice, accessibility and the Compose mapping. |
| `tokens.json` | **Source of truth** for colors, typography, spacing, radii, shadows and motion. |
| `tokens.css` / `tokens.js` | Generated from `tokens.json`. Do not edit by hand. |
| `generate_tokens.py` | Regenerates the two files above. |

After changing `tokens.json`:

```bash
python3 design/02-style-guide/generate_tokens.py
```

To view it with a local server (logo images load more reliably this way):

```bash
python3 -m http.server 8765 --directory design
```

Then open http://localhost:8765/02-style-guide/style-guide.html.

Full documentation: [docs/design/02-style-guide.md](../../docs/design/02-style-guide.md).
