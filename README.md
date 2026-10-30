<p align="center">
  <img src="design/01-logo/export/vitrola-mp3-horizontal-positive.svg" alt="Vitrola Mp3" height="96">
</p>

# Vitrola Mp3

An Android music player for the MP3s stored on your phone. It works offline, needs no account and only reads the folders you choose.

> **Status:** design done. Logo ✅ · Style guide ✅ · HTML mockup ✅ · Android app ⏳

## See it online

| | Page | What's inside |
|:-:|---|---|
| 🏠 | **[App website](https://guiooak.github.io/vitrola-mp3/)** | Vitrola Mp3 overview and access to all the material |
| 🎨 | **[Logo guidelines](https://guiooak.github.io/vitrola-mp3/01-logo/logo.html)** | Symbol, variations, Android icon, lockups and palette |
| 📐 | **[Style guide](https://guiooak.github.io/vitrola-mp3/02-style-guide/style-guide.html)** | Colors, typography, components and motion |
| 📱 | **[Clickable mockup](https://guiooak.github.io/vitrola-mp3/03-mockup/)** | The whole app to try in a browser or on a phone |

## The idea

- **Only your folders:** you choose the music folders and nothing outside them enters the library (WhatsApp audio, for example).
- **Plays in the background:** music keeps going with the screen off or in another app, with controls in the notification, on the lock screen and on your headphones.
- **Turntable soul:** on "now playing", the album cover becomes the label of a spinning vinyl record.

## How the project is being built

Design comes before code. Each step starts only after the previous one is approved:

1. **Logo:** done, in [`design/01-logo/`](design/01-logo/)
2. **Style guide:** done, in [`design/02-style-guide/`](design/02-style-guide/)
3. **HTML mockup:** approved, in [`design/03-mockup/`](design/03-mockup/)
4. **Android app:** to be built by another agent, starting from [`.ai/`](.ai/README.md)

## Structure

```
.ai/                handoff for the agent implementing the Android app
design/
  01-logo/          logo pages, exported SVGs and export scripts
  02-style-guide/   style guide, design tokens and generator
  03-mockup/        clickable app for validating screens and interactions
  index.html        website landing page
docs/
  decisions/        decision records (ADRs), one file per decision
  design/           documentation for each design step
CLAUDE.md           repository rules (everything in US English)
```

## Website publishing

The `design/` folder is published to GitHub Pages by the [`.github/workflows/pages.yml`](.github/workflows/pages.yml) workflow on every push to `main` that changes the design.

## View the design locally

```bash
python3 -m http.server 8765 --directory design
```

Then open:
- Landing page: http://localhost:8765/
- Logo: http://localhost:8765/01-logo/logo.html
- Style guide: http://localhost:8765/02-style-guide/style-guide.html
- Mockup: http://localhost:8765/03-mockup/

## Documentation

- [Project decisions (ADRs)](docs/decisions/README.md)
- [Implementation handoff (.ai/)](.ai/README.md)
- [Design: logo](docs/design/01-logo.md)
- [Design: style guide](docs/design/02-style-guide.md)
- [Design: mockup](docs/design/03-mockup.md)
