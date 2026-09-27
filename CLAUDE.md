# CLAUDE.md: niki-method

Context for Claude Code. This project was started in a claude.ai chat; this file carries over everything decided there.

## What this is
A dark-mode workout calendar and full-screen workout player for a 5-day-a-week strength class. It is built from a monthly program PDF. It is a static PWA with no build step and no framework, hosted on GitHub Pages at `https://micheltobon.github.io/niki-method/`. It works offline and can be installed to the home screen. Michel and a couple of friends use it, mostly on iPhone.

Michel works alone on this ("one-man team"). The long-term vision is a social fitness app, related to his `fitness-junkie` repo, which hasn't been reviewed yet. When that happens, the goal is **one codebase** for web, iOS and Android, most likely by wrapping this web app with Capacitor.

## Files
| File | Purpose |
| --- | --- |
| `index.html` | The whole schedule app: calendar, day sheet, player, timers, sounds, wake lock. Inline CSS and JS. |
| `programs.js` | Workout data: `window.PROGRAMS = [ ... ]`, one entry per month. |
| `sw.js` | Service worker. Serves from cache and refreshes in the background (stale-while-revalidate). |
| `manifest.webmanifest`, `icons/` | PWA install data. |
| `erg.html` | **Standalone** Concept2 PM5 Bluetooth proof of concept. Must stay separate (see below). |
| `ERG-PLAN.md` | Erg test checklist and roadmap. |
| `README.md` | User-facing setup and install instructions. |

## Hard rules
- **No "Row House" branding anywhere** (names, titles, comments, manifest). It was removed on purpose.
- **The erg POC stays out of the schedule app.** No links, shared code or shared storage between `erg.html` and `index.html`. This holds until Michel says the POC is ready to integrate.
- **Keep it build-free.** Plain HTML, CSS and JS that work when `index.html` is opened directly from disk (`file://`) and on GitHub Pages. Scripts load with plain `<script src>`, never `fetch()` of local JSON, because `fetch` fails on `file://`.
- **Service worker:** whenever the `FILES` list in `sw.js` changes, bump `VERSION`. Never list a file that doesn't exist: `addAll` fails, and installed phones stop updating.
- **Ask before building new modules or features that aren't clearly specified.** Michel likes to answer questions first.
- Big fonts and dark mode throughout. The player must stay readable from a distance, on phone, tablet and desktop.

## Data model (`programs.js`)
Helpers build days as `day(id, date, key, blocks)`, where `id` is like `W2D3` and `date` is `YYYY-MM-DD`. Block kinds:
- `sets`: rep-based work. `{ label, movements:[{name, detail, weight?}], sets, reps, load, rest (s), restSuggested?, note? }`. Tapping "Set done" starts the rest timer. `weight:true` shows a weight box.
- `intervals`: timed work. `{ intervals: [[name, seconds, "work"|"rest"], ...], rounds }`. It opens with a 3-2-1 countdown, and the trailing rest is skipped in the final round.
- `amrap`: `{ duration, movements }` with a "+1 round" counter.
- `info`: text only (Saturday express class).

The sheet's "5×4" means **5 reps × 4 sets**. The block works like this:
- **W1:** 5×4, rest 90 s.
- **W2:** 6×3, rest 75 s.
- **W3:** 8×3, rest 60 s.
- **W4:** 10×3, rest 60 s.
- **Accessories:** 8/10/12/15 reps × 3 sets. The sheet gives no rest, so they use a 45 s suggested rest.

## Rules applied at runtime in `index.html` (don't bake these into the data)
- **5 s change between exercises:** `withChanges()` inserts `["Change", 5, "change"]` between two back-to-back `work` intervals. The time comes out of the block's rest, so the round length stays the same. Example: 20 L + 20 R + 20 rest becomes 20 L + 5 change + 20 R + 15 rest. A change has its own sound, a lavender color, and "Get ready: <next>" in large type.
- **5 min cool-down stretch** (`STRETCH_BLOCK`, kind `timer`) is appended to every day. It chimes each minute and has an "End early" button. The day is checked off when the last block ends.
- **4-week restart:** `repeatCycles()` repeats the newest program every 4 weeks after it ends, starting the next Tuesday as W1. Each cycle is named after the month most of its days fall in: Sep 29 – Oct 24, 2026 = "October 2026". Cycles appear once they are within 28 days. Adding a real new month to `programs.js` supersedes the repeats automatically.

## Player behavior (implemented)
- Full-screen overlay (`100vw × 100dvh`), block by block, with block progress segments.
- **Sets:** a counter with dots, a rest countdown with a shrinking bar, −15/+15 s, skip, and undo.
- **Timers:** wall-clock based (`performance.now()`), so they stay accurate when the tab sleeps.
- **Sound:** Web Audio beeps. There are 3-2-1 ticks before every transition, and go, rest, change and done tones, plus vibration on Android.
- **Screen on:** Wake Lock while the player is open, and a Full screen button.
  - On iPhone, true full screen only works from a Home Screen install.
  - iPhone sounds follow the ring/silent switch.
- **Storage** (localStorage, per device):
  - `rh.weights`: weights by movement slug, then by `id@date`. "Last: X lb" carries across cycles.
  - `rh.done`: completed days.
  - `rh.sound`: sound on or off.
  - The `rh.` prefix is internal; leave it so existing data isn't lost.
- `?today=YYYY-MM-DD` overrides the date for testing.

## Design tokens
- **Background and surfaces:** `--bg #0F1E2B`, `--surface #16293A`, `--surface-2 #1E364B`, `--line #2C465B`.
- **Text:** `--text #EAF1F5`, `--muted #95ABBA`.
- **State colors:**
  - `--work #F2B134` (amber): work and go
  - `--rest #5CC8D6` (cyan): rest
  - `--change #B9A3F0` (lavender): switching exercises
  - `--done #86D39A`: complete
- **Type:** system font stack only, so it works offline. Tabular numerals for all timers.

## Erg POC (`erg.html`)
- **What it is:** a single self-contained page that reads a Concept2 PM5 over Web Bluetooth.
- **How it's used:** Michel sets up the piece on the PM5 and the page follows it.
- **What it shows:** live split, average split, meters, time, stroke rate, watts, and heart rate or calories. When the piece ends, a summary with the average split and splits is saved to `erg.sessions` (schema v1). JSON export and Demo mode (fake data through the same parser) are included.
- **Protocol:** UUIDs `CE06xxxx-43E5-11E4-916C-0800200C9A66`, service `0x0030`.
  - `0x0031`: general status
  - `0x0032`: pace, average pace, stroke rate, heart rate
  - `0x0033`: calories, power, last split
  - `0x0039`: end-of-workout summary
- **Untested on a real PM5.** The byte layouts come from Concept2's spec. Expect fixes after testing, guided by the "Raw data" panel. See `ERG-PLAN.md`.
- **iPhone:** Safari doesn't support Web Bluetooth, so testing is done in the **Bluefy** browser. ErgData must be closed, because the PM5 accepts only one app connection.
- **Structure:** all Bluetooth calls sit in one section (`connect()`), so it can later be swapped for `@capacitor-community/bluetooth-le`.

## Updating to a new month
Convert the new PDF into a new `PROGRAMS` entry in `programs.js`, using the same helpers and block kinds. Keep `id` as `YYYY-MM`. Upload it and the app picks it up. Also check that day patterns and the reps/sets reading still match the new sheet.

## Status and backlog
- **Done:**
  - calendar and player
  - 5 s change intervals
  - 5 min stretch
  - 4-week repeat
  - erg POC split out into its own page
  - Row House branding removed
- **Next:** Michel tests the erg POC on his PM5 (checklist in `ERG-PLAN.md`), then the protocol gets fixed.
- **Later:**
  - integrate the erg into the schedule (rowing finishers, cardio days)
  - backend and accounts
  - Capacitor iOS/Android app (Apple Developer account not created yet; Mac + Xcode available)
  - social features (review the `fitness-junkie` repo first)
