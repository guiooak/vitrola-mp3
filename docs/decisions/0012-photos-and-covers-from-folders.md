# D12 · Artist photos and album covers from the folders

- **Status:** Accepted
- **Date:** 2026-10-25
- **Related:** [D19](0019-folder-image-rule.md)

## Context

The maintainer keeps one image in each artist folder and each album folder, and wants the app to use them. Before this, the mockup only showed generated covers.

## Decision

The app uses these images on every screen. Which file counts as the photo or cover is defined in D19.
- **Cover:** image in the album folder → cover embedded in the audio file → generated cover.
- **Artist photo:** image in the artist folder → first album cover in a circle.
- The previous look (generated cover, cover in a circle) becomes the fallback when there is no image, as the maintainer requested.

## Consequences

- Details and where each image appears: [03-mockup.md](../design/03-mockup.md#artist-photos-and-album-covers).
- A Settings switch ("Use folder photos and covers") turns folder images off.
