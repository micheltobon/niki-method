/*
  Workout programs.
  ---------------------------------------------------------------
  Each month is one entry in PROGRAMS. To add October, append a new
  entry with the same shape (or ask Claude to convert the new PDF).

  Block kinds:
    sets      -> rep-based work. "Set done" starts the rest timer.
                 sets = number of sets, rest = seconds between sets.
    intervals -> timed work. 3-2-1 countdown, then each interval runs.
                 intervals = [[name, seconds, "work"|"rest"], ...]
    amrap     -> as many rounds as possible in `duration` seconds,
                 with a tap-to-count rounds button.
    info      -> text only (e.g. Saturday express class).
*/

(function () {
  // ---- small helpers so each day reads like the sheet ----
  const S = (label, movements, sets, reps, load, rest, extra = {}) =>
    ({ kind: "sets", label, movements, sets, reps, load, rest, ...extra });
  const I = (label, intervals, rounds, extra = {}) =>
    ({ kind: "intervals", label, intervals, rounds, ...extra });
  const A = (label, duration, movements, extra = {}) =>
    ({ kind: "amrap", label, duration, movements, ...extra });
  const INFO = (label, text) => ({ kind: "info", label, text });

  // Sheet format: "5×4" = 5 reps × 4 sets.
  const WEEK = {
    1: { reps: 5, sets: 4, load: "Heavy", rest: 90, acc: 8 },
    2: { reps: 6, sets: 3, load: "Hold W1 load", rest: 75, acc: 10 },
    3: { reps: 8, sets: 3, load: "Hold W1 load, or drop 5–10 lb if form breaks", rest: 60, acc: 12 },
    4: { reps: 10, sets: 3, load: "Hold W1 load, or drop 5–10 lb if form breaks", rest: 60, acc: 15 },
  };
  const ACC_REST = 45; // sheet says N/A for accessories; suggested rest

  const NOTES = {
    tue: "SL glute bridge: DB on working hip, drive through heel, non-working leg extended or bent 90°. Renegade row: modified plank with one knee behind hips, both hands on DBs. Row one DB from floor to hip, alternate sides. Down knee stabilizes; regress to full quadruped if the plank breaks down.",
    wed: "Ipsilateral = weight on the same side as the working leg. Load through the front heel, chest tall. Pendlay row: half-kneel, down knee on the same side as the pulling arm. Row from floor to hip, full pause between reps. “Back of hand to front” = external rotation cue for elbow position at the top.",
    thu: "Suitcase squat: single DB in one hand at your side. Resist leaning sideways. Alternate sides between sets. Rotate to press: DB at shoulder, rotate torso 45° away from the working arm as you press up. Return to center between reps. Rotation comes from the hip, not the low back.",
    fri: "DB glute bridge: DBs stacked on the hip crease, feet planted, drive through heels, squeeze glutes at the top. Floor press: DBs at chest, elbows land on the floor between reps (full stop). Thumbs slightly forward keeps shoulders safe.",
  };

  function tuesday(w, heelTouches, bearHold, accBLoad, swings, finNote) {
    const W = WEEK[w];
    return [
      S("Lower strength", [
        { name: "Single-leg glute bridge", detail: `${W.reps} each side · DB on hip`, weight: true },
        { name: "Side-to-side heel touches", detail: `${heelTouches} total` },
      ], W.sets, `${W.reps} each side`, w === 1 ? "Heavy" : W.load, W.rest),
      S("Upper strength", [
        { name: "DB renegade row", detail: `${W.reps} each side · knee behind hips`, weight: true },
        { name: "Bear plank hold", detail: `${bearHold} seconds` },
      ], W.sets, `${W.reps} each side`, w === 1 ? "Heavy" : W.load, W.rest),
      S("Accessory A", [
        { name: "RDL", detail: `${W.acc} reps`, weight: true },
        { name: "Standing DB pullover", detail: `${W.acc} reps`, weight: true },
      ], 3, `${W.acc} reps each`, "Medium", ACC_REST, { restSuggested: true, note: "Superset" }),
      S("Accessory B", [
        { name: "Curtsy lunge", detail: `${W.acc} reps · alternating sides`, weight: true },
        { name: "Hammer curls", detail: `${W.acc} reps`, weight: true },
      ], 3, `${W.acc} reps each`, accBLoad, ACC_REST, { restSuggested: true, note: "Superset" }),
      A("Finisher", 240, [
        { name: "Skier swings", detail: `${swings} swings` },
        { name: "Row", detail: "200 m" },
      ], { note: finNote }),
    ];
  }

  function wednesday(w, accBLoad, finisher, pendlayExtra, accANote) {
    const W = WEEK[w];
    return [
      S("Lower strength", [
        { name: "Bulgarian split squat", detail: `${W.reps} each side · ipsilateral`, weight: true },
      ], W.sets, `${W.reps} each side`, w === 1 ? "Heavy" : W.load, W.rest),
      S("Upper strength", [
        { name: "Half-kneel DB Pendlay row", detail: `${W.reps} each side · back of hand faces front${pendlayExtra}`, weight: true },
      ], W.sets, `${W.reps} each side`, w === 1 ? "Heavy" : W.load, W.rest),
      I("Accessory A", [
        ["Hamstring walk-outs", 20, "work"],
        ["Toe reaches", 20, "work"],
        ["Rest", 40, "rest"],
      ], 3, { note: accANote }),
      S("Accessory B", [
        { name: "Rear delt fly", detail: `${W.acc} reps`, weight: true },
        { name: "Banded pull-apart", detail: `${W.acc} reps · medium band` },
      ], 3, `${W.acc} reps each`, accBLoad, ACC_REST, { restSuggested: true, note: "Superset" }),
      I("Finisher", finisher, 2),
    ];
  }

  function thursday(w, calves, accBLoad, finRest, finRounds) {
    const W = WEEK[w];
    return [
      S("Lower strength", [
        { name: "Suitcase squat", detail: `${W.reps} reps · DB hanging at side`, weight: true },
        { name: "Calf raises", detail: `${calves} reps` },
      ], W.sets, `${W.reps} reps`, w === 1 ? "Heavy" : W.load, W.rest),
      S("Upper strength", [
        { name: "Trunk rotate to OH press", detail: `${W.reps} each side`, weight: true },
        { name: "TRX / band bent-over rows", detail: "10 reps" },
      ], W.sets, `${W.reps} each side`, w === 1 ? "Heavy" : W.load, W.rest),
      S("Accessory A", [
        { name: "Single-leg RDL", detail: `${W.acc} each side`, weight: true },
        { name: "Pallof press hold, single DB", detail: `${W.acc} reps · light`, weight: true },
      ], 3, `${W.acc} reps each`, "Light on the Pallof press", ACC_REST, { restSuggested: true, note: "Superset" }),
      S("Accessory B", [
        { name: "DB lateral raise", detail: `${W.acc} reps`, weight: true },
        { name: "Tricep kickback", detail: `${W.acc} reps`, weight: true },
      ], 3, `${W.acc} reps each`, accBLoad, ACC_REST, { restSuggested: true, note: "Superset" }),
      I("Finisher", [
        ["Plank DB walk-overs", 30, "work"],
        ["Push-ups", 30, "work"],
        ["Rest", finRest, "rest"],
      ], finRounds),
    ];
  }

  function friday(w, abduction, fly, hard, paddle, finNote) {
    const W = WEEK[w];
    return [
      S("Lower strength", [
        { name: "DB glute bridge", detail: `${W.reps} reps · DBs on hips`, weight: true },
        { name: "Band abduction", detail: `${abduction} reps` },
      ], W.sets, `${W.reps} reps`, w === 1 ? "Heaviest" : W.load, W.rest),
      S("Upper strength", [
        { name: "DB floor press", detail: `${W.reps} reps · full stop on floor`, weight: true },
        { name: "Chest fly", detail: `${fly} reps · light`, weight: true },
      ], W.sets, `${W.reps} reps`, w === 1 ? "Heavy" : W.load, W.rest),
      S("Accessory A", [
        { name: "DB goblet squat", detail: `${W.acc} reps`, weight: true },
        { name: "Banded face pull", detail: `${W.acc} reps` },
      ], 3, `${W.acc} reps each`, "Medium-light", ACC_REST, { restSuggested: true, note: "Superset" }),
      S("Accessory B", [
        { name: "Hammer curls", detail: `${W.acc} reps`, weight: true },
        { name: "Upright rows", detail: `${W.acc} reps`, weight: true },
      ], 3, `${W.acc} reps each`, "Moderate", ACC_REST, { restSuggested: true, note: "Superset · 2 rounds back to back, then rest" }),
      A("Finisher", 270, [
        { name: "Row hard", detail: `${hard} m` },
        { name: "Row paddle", detail: `${paddle} m` },
      ], { note: finNote }),
    ];
  }

  const saturday = () => [
    INFO("Express strength", "Express class, coach’s choice. Suggested: 2 main patterns + 1 accessory to fit the 30-minute class."),
  ];

  const sidePlank = (s) => [
    ["Side plank, left", s, "work"],
    ["Side plank, right", s, "work"],
    ["Mountain climbers", s, "work"],
    ["Rest", 35, "rest"],
  ];

  const PATTERN = {
    tue: "Unilateral hinge + horizontal pull",
    wed: "Unilateral knee + horizontal pull",
    thu: "Bilateral knee + vertical push",
    fri: "Bilateral hinge + horizontal push",
    sat: "Express strength, dealer’s choice",
  };

  const day = (id, date, key, blocks) => ({
    id, date, pattern: PATTERN[key], notes: NOTES[key] || "", blocks,
  });

  const september = {
    id: "2026-09",
    title: "September 2026",
    name: "DUP Strength Block",
    summary: "4-week hypertrophy accumulation block. Hold your August weights while reps climb. Goal: keep your Week 1 weight all the way to Week 4.",
    weeks: {
      1: "W1 · 5 reps × 4 sets, heavy. Find your working weight.",
      2: "W2 · 6 reps × 3 sets. Hold W1 weight.",
      3: "W3 · 8 reps × 3 sets. Hold W1 weight; drop 5–10% if form breaks.",
      4: "W4 · 10 reps × 3 sets. Peak volume.",
    },
    days: [
      // ---------- Week 1 ----------
      day("W1D1", "2026-09-01", "tue", tuesday(1, 16, 20, "Light", 15)),
      day("W1D2", "2026-09-02", "wed", wednesday(1, "Light on fly, medium band", sidePlank(20), "", "")),
      day("W1D3", "2026-09-03", "thu", thursday(1, 10, "Bodyweight or light", 30, 2)),
      day("W1D4", "2026-09-04", "fri", friday(1, 10, 10, 100, 200, "Suggested: no more than 4.5 min")),
      day("W1D5", "2026-09-05", "sat", saturday()),
      // ---------- Week 2 ----------
      day("W2D1", "2026-09-08", "tue", tuesday(2, 20, 25, "Medium", 10, "Make the swings heavier")),
      day("W2D2", "2026-09-09", "wed", wednesday(2, "Moderate fly, medium band", sidePlank(25), "", "Light weight for the toe reach")),
      day("W2D3", "2026-09-10", "thu", thursday(2, 12, "Moderate", 30, 2)),
      day("W2D4", "2026-09-11", "fri", friday(2, 6, 12, 150, 150, "Suggested: no more than 4.5 min")),
      day("W2D5", "2026-09-12", "sat", saturday()),
      // ---------- Week 3 ----------
      day("W3D1", "2026-09-15", "tue", tuesday(3, 16, 20, "Moderate", 8, "Swings heavier than last week")),
      day("W3D2", "2026-09-16", "wed", wednesday(3, "Moderate fly, medium band", sidePlank(30), "", "")),
      day("W3D3", "2026-09-17", "thu", thursday(3, 8, "Moderate", 15, 3)),
      day("W3D4", "2026-09-18", "fri", friday(3, 8, 16, 200, 100, "Suggested: no more than 4.5 min")),
      day("W3D5", "2026-09-19", "sat", saturday()),
      // ---------- Week 4 ----------
      day("W4D1", "2026-09-22", "tue", tuesday(4, 20, 20, "Moderate", 8, "Heavier swings; aim for more rounds")),
      day("W4D2", "2026-09-23", "wed", wednesday(4, "Moderate fly, medium band", [
        ["Side plank roll-throughs", 20, "work"],
        ["Side plank roll-throughs", 20, "work"],
        ["Mountain climbers", 20, "work"],
        ["Rest", 35, "rest"],
      ], " · single DB", "")),
      day("W4D3", "2026-09-24", "thu", thursday(4, 10, "Moderate", 30, 2)),
      day("W4D4", "2026-09-25", "fri", friday(4, 10, 20, 300, 100, "Try to get through this at least 1–2 times")),
      day("W4D5", "2026-09-26", "sat", saturday()),
    ],
  };

  window.PROGRAMS = [september];
})();
