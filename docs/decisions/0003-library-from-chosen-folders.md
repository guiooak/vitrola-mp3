# D3 · Library only from chosen folders (SAF)

- **Status:** Accepted
- **Date:** 2026-10-25
- **Related:** [D5](0005-tech-stack.md), [D19](0019-folder-image-rule.md)

## Context

Phones hold a lot of audio that is not music (WhatsApp audio, voice recordings). Reading all audio through MediaStore would put that in the library and would need the broad `READ_MEDIA_AUDIO` permission, which is worse for privacy and for the Play Store review.

## Decision

The user picks one or more folders through the system picker (`ACTION_OPEN_DOCUMENT_TREE`), and the app keeps the permission persistently (`takePersistableUriPermission`). Only those folders are read.

## Consequences

- Scanning through SAF is slower than through MediaStore. The index is stored in a local database (Room) and each rescan only checks what changed (`lastModified`). Metadata is read with `MediaMetadataRetriever`.
- The app must handle lost permissions (folder moved, renamed or access revoked).

## Alternatives considered

- **Filter MediaStore by path.** Faster, but requires access to every audio file on the device. Rejected.
