# Erg POC: test plan and next steps

## Where things stand

`erg.html` is a standalone proof of concept that reads live data from a Concept2 PM5 over Bluetooth. It is **not connected to the workout schedule** (`index.html`): no links, no shared code, no shared storage. Removing `erg.html` has no effect on the schedule app.

The POC follows the monitor. You set up the piece on the PM5 (Just Row, distance, time, intervals). The page shows the live numbers and saves a summary when the PM5 finishes the piece.

The data decoding follows Concept2's published protocol (*PM Bluetooth Smart Communication Interface Definition*). It has only been checked with simulated data, never with a real PM5. Verifying it on the real monitor is the main goal of testing.

## How to test

1. Open `https://<your-username>.github.io/niki-method/erg.html` in the **Bluefy** browser on iPhone. Safari cannot use Bluetooth. On Android or a computer, Chrome or Edge also work.
2. Close ErgData, since the PM5 accepts only one app connection at a time.
3. Set up a piece on the PM5 and tap **Connect PM5**.
4. Row, and compare the page with the monitor.
5. If a number is wrong, tap **Raw data** during the row and take a screenshot. It shows the exact bytes the PM5 sends, which is what's needed to fix the decoding.

**Demo** mode runs the same screens with fake data and works in any browser.

## Test checklist

For each item, check that the live numbers match the PM5 and that a correct summary is saved at the end.

- [ ] Connect, disconnect, and reconnect without reloading the page
- [ ] **Just Row**: live split, average split, meters, time, stroke rate, watts
- [ ] **Distance piece** (e.g. 2,000 m with 500 m splits): the summary's average split matches the PM5, and the splits table is correct
- [ ] **Time piece** (e.g. 10:00)
- [ ] **Intervals** (e.g. 5×500 m / 1:00 rest): what happens during rest, and whether each interval is recorded
- [ ] **Heart rate strap** paired to the PM5: the heart rate tile appears
- [ ] Walk away mid-piece, so Bluetooth drops: the piece is saved as "unfinished"
- [ ] Two pieces back to back without reconnecting: two separate sessions are saved
- [ ] Screen stays on during a 20+ minute row
- [ ] Split and meters keep up with each stroke, with no noticeable lag
- [ ] Android phone or laptop with Chrome gives the same results

**Things most likely to need fixing:**
- Interval pieces: how rest is reported, and whether each interval is split out correctly
- Calories: this value may be reported differently than the POC assumes
- When the end-of-piece summary arrives: Just Row pieces in particular may end differently

## What a saved session looks like (schema v1)

| Field | Meaning |
| --- | --- |
| `schema` | Format version, currently `1` |
| `id`, `startedAt`, `endedAt` | Identity and timing (ISO dates) |
| `source`, `device` | `pm5` or `demo`, plus the monitor's name |
| `workoutType` | Just row, Distance, Time intervals, … |
| `distance` (m), `time` (s) | Totals |
| `avgPace` | Average split, in seconds per 500 m |
| `avgWatts`, `avgSpm`, `avgHr`, `maxHr`, `calories`, `dragFactor` | Averages and totals |
| `splits[]` | `{ time, distance, pace }` for each split or interval |
| `partial` | `true` if the piece didn't finish normally |

Sessions are stored on the device only (`erg.sessions` in the browser's storage). **Export JSON** downloads them.

## Next steps after testing

### 1. Fix the protocol details
Correct any wrong readings from the test results. Confirm how intervals, rest, and Just Row endings behave on the real PM5.

### 2. Integrate with the schedule (once the POC is solid)
- Rowing finishers (e.g. "200 m hard + 100 m paddle") show live meters and split from the erg. Possibly advance automatically when the distance is reached.
- Standalone cardio sessions appear on the calendar and in history next to strength days.
- Rows done during a workout are linked to that day's session.
- Replace the separate erg storage with one shared data store for strength and cardio.

### 3. Data and accounts (groundwork for the social app)
- Choose a backend and sign-in method.
- Sync sessions from the device to the server. The schema already has a version number to support this.
- Decide what is private and what is shareable.
- Review how this fits with the **fitness-junkie** repository.

### 4. One codebase for iPhone and Android (Capacitor)
- Wrap the existing web app with Capacitor. The same HTML, CSS, and JS ship as both the iOS and Android app, and the web version keeps working.
- Replace the Web Bluetooth calls with the Capacitor Bluetooth LE plugin (`@capacitor-community/bluetooth-le`). All Bluetooth code sits in one small section of the erg module, so this swap is contained.
- Once it's an App Store app, Bluefy is no longer needed.
- Accounts needed: an Apple Developer Program membership ($99/year) and a Google Play developer account (one-time fee).
- The Mac with Xcode is already available.

### 5. Social features
To be scoped once the fitness-junkie plan is reviewed.

## Open questions
- Should the app ever program pieces onto the PM5 (e.g. set up 5×500 m from the phone)? The POC only follows the monitor. The PM5 supports programming if wanted later.
- Should heart rate come from the PM5, or from a strap connected directly to the phone?
- Metric only (meters, /500 m), or also calories and watts modes?
