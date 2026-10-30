# D4 · Continuous background playback

- **Status:** Accepted
- **Date:** 2026-10-25
- **Related:** [D5](0005-tech-stack.md)

## Context

Music must keep playing with the screen off and be controllable from outside the app.

## Decision

A `MediaSessionService` (Media3) runs as a foreground service of type `mediaPlayback`, and the UI only sends commands to it. It includes wake lock, audio focus (pause on calls), pause when headphones disconnect, a notification with controls, lock-screen controls, Bluetooth headphone buttons and resume where you left off.

## Consequences

- Manufacturers such as Xiaomi and Samsung may kill background apps. The app guides users to exempt it from battery optimization (a tip in Settings) instead of requesting the exemption directly.
