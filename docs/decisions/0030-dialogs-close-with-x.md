# D30 · Dialogs close with an X

- **Status:** Accepted
- **Date:** 2026-10-30
- **Related:** [D9](0009-design-tokens-source-of-truth.md), [D17](0017-html-mockup-approved.md), [D28](0028-landscape.md)

## Context

In landscape, the phone is only about 390dp tall. The File details dialog touched the bottom of the screen, and most of its height went to a "Close" button row. The maintainer replaced that button with an X floating in the top-right corner, then asked for the same X in every dialog so they all close the same way.

## Decision

- **Every app dialog has a close X** floating 8dp from its top-right corner: a 48dp icon button with the `close` icon and the content description "Close".
- **No Cancel, Close or "Not now" buttons.** A dialog shows only its main action, right-aligned:
  - Create, Save, Delete, Remove, Choose folder;
  - filled, in the error color when the action is destructive.
- **Information-only dialogs** have no buttons at all (File details).
- **Dismissing:** tapping the X, tapping the scrim or pressing system back all close the dialog, and none of them changes anything. For a dialog with a text field, that also discards what was typed.
- Applies to every app dialog: new playlist, rename playlist, delete playlist, remove folder, lost folder access and file details.
- Applies in both orientations.
- **Not covered:**
  - system dialogs and screens (permission requests, the folder picker), which follow Android;
  - bottom sheets, which keep their drag handle and close by swiping down, tapping the scrim or pressing back.

## Consequences

- One shared dialog component in Compose draws the X. Screens pass only the icon, title, body and an optional main action.
- The copy loses the dialog Cancel / Close / "Not now" buttons. `action_close` remains as the X's content description (`.ai/06-copy.md`).
- The style guide's dialog sample and the mockup show the X. Both were reviewed and approved before the app is built (D6).

## Alternatives considered

- **Keep the X only on information dialogs** (File details) and Cancel on the others. Rejected by the maintainer, who prefers one consistent rule.
- **Standard Material dialogs with text buttons** (Cancel + action). Rejected: they need a full button row even when the only choice is to leave, which wastes height in landscape.
