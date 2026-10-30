# D19 · Folder image rule: `folder.*`, else the only image

- **Status:** Accepted
- **Date:** 2026-10-26
- **Related:** [D12](0012-photos-and-covers-from-folders.md)

## Context

D12 makes the app use the image in each artist and album folder, but a folder can have several images or differently named files. An earlier proposal accepted several names (`artist`, `cover`, `capa`…), which was more complex than needed.

## Decision

The same rule applies to artist folders (photo) and album folders (cover). In each folder the app uses:

1. a file named `folder.jpg`, `folder.jpeg` or `folder.png` (any letter case) in the folder;
2. otherwise, if the folder has **exactly one** image (`.jpg`, `.jpeg` or `.png`), that image;
3. otherwise, no folder image (several images and none named `folder.*` is ambiguous).

An **album folder** is a folder that contains audio files; an **artist folder** is the folder right above album folders. So `folder.jpg` in an artist folder is the artist photo and in an album folder is the album cover.

## Consequences

- After the folder image, the fallbacks from D12 still apply: cover embedded in the audio file (albums only), then the generated cover; for artists, the first album cover in a circle.
- Existing `artist.jpg` / `cover.jpg` files keep working when they are the only image in their folder.

## Alternatives considered

- **Several accepted names** (`artist`, `cover`, `capa`…). Replaced by this rule.
