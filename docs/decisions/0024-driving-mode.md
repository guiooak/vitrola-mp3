# D24 · Driving mode

- **Status:** Accepted
- **Date:** 2026-10-30
- **Revised:** 2026-10-30: the rest of the app also adapts to landscape (D28).
- **Related:** [D1](0001-personal-use-play-store-ready.md), [D3](0003-library-from-chosen-folders.md), [D4](0004-background-playback.md), [D6](0006-design-before-code.md), [D11](0011-navigation-structure.md)

## Context

The maintainer wants a driving mode: a screen similar to Android Auto, focused on the main functions, so controlling the app takes as little of the driver's attention as possible.

- Real Android Auto support (the app showing on the car's screen) is a different feature and stays in the "Later" list. Driving mode runs on the phone, inside the app.
- The maintainer chose: manual entry plus automatic entry when the phone connects to the car's Bluetooth; a player with a few shortcuts; the screen kept on; a landscape layout for car mounts.
- Recognizing a specific Bluetooth device needs the `BLUETOOTH_CONNECT` runtime permission ("Nearby devices") on Android 12+.

## Decision

**Screen.** A full-screen mode on top of the app, with only two tabs:
- **Now playing:** the record with the cover (no tonearm), title (large, up to 2 lines) and artist, a progress bar **without seeking**, and five large controls: favorite, previous, play/pause (104dp), next, shuffle.
- **Music:** big tiles that start playing at once and switch back to Now playing: **Shuffle all**, **Favorite songs**, **Most played**, **Recently added**, and **Playlists**, which opens one simple list of playlists (never deeper). With nothing playing, Now playing shows "Nothing playing" and a big "Shuffle all".
- An **Exit** button with a text label. No search, song menus, dialogs, queue editing, lyrics or equalizer inside the mode. Snackbars are allowed (above the tabs).
- Large touch targets everywhere (controls 56–104dp, tabs and tiles 72dp+ tall), large type, the app's normal theme (light/dark as chosen).
- **Screen stays on** while driving mode is open.
- **Landscape:** driving mode has its own landscape layout (Exit and the tabs in a side rail, the record on the left, title and controls on the right; tiles in 3 columns). Every other screen adapts to landscape too (D28).

**Entering and leaving.**
- **Manual:** a car button in the Now playing top bar and Settings › Driving › Driving mode. Exit button or system back leaves (back first closes the playlists list).
- **Automatic (optional, off by default):** Settings › Driving › **Start automatically in the car**. Turning it on asks once for the Nearby devices permission (Android 12+), then shows the **paired Bluetooth devices** to pick the car (Settings › Driving › Car changes it). When that device connects, driving mode opens; when it disconnects, a mode that opened automatically closes (a manually opened one stays).
- If the permission is denied, the switch stays off and a snackbar explains why it is needed.

## Consequences

- New permissions: `BLUETOOTH_CONNECT` (Android 12+, runtime, requested only when the user turns on the automatic start) and `BLUETOOTH` with `android:maxSdkVersion="30"` (normal, for Android 8–11). Nothing else changes for users who never turn it on. The chosen car's address and name are stored only on the phone (nothing leaves the phone, D1).
- Android does not let an app open its screen from the background. So the automatic start opens driving mode when the app is in the foreground, or the next time the app is opened while the car is connected; it never brings the app to the front by itself, and it never starts playback by itself.
- Connection detection: listen to Bluetooth connect/disconnect events while the app or the playback service (D4) is running, and check the chosen device's connection state when the app comes to the foreground.
- New saved settings: `driveAuto`, `driveCarAddress`, `driveCarName`.
- Designed in the mockup (Settings › Driving, the car button in Now playing, the "Driving mode" shortcuts and the "Car Bluetooth connects" / "Rotate phone" simulations) and approved before it is built (D6).

## Alternatives considered

- **Android Auto (`MediaLibraryService` + car app quality rules).** Not now: it is a separate integration, still in the "Later" list. Driving mode works on any phone and in any car.
- **Automatic start on any Bluetooth audio connection** (no permission needed). Rejected: it would also trigger with headphones and speakers.
- **Forced dark theme in the mode.** Not chosen by the maintainer; the mode follows the app theme.
- **Gestures over the whole screen** (swipe to skip, double tap to pause). Not chosen for now.
