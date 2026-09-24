# Row House Strength

A monthly workout calendar with a full-screen workout player: set counter, rest timer,
3-2-1 countdowns, sounds, and a shrinking timer bar. Works offline.

## Files
- `index.html` – the app
- `programs.js` – the workout data (one entry per month)
- `sw.js`, `manifest.webmanifest`, `icons/` – make it an installable offline app

Keep all files together in the same folder.

## Use it locally
Open `index.html` in Chrome, Edge, Safari or Firefox. Everything works except
"install as an app", which needs the GitHub Pages link.

## Put it on GitHub Pages
1. Create a new public repository on github.com (for example `rowhouse`).
2. Click **Add file → Upload files**, drag in everything from this folder
   (including the `icons` folder), then **Commit changes**.
3. Go to **Settings → Pages**. Under **Branch**, pick `main` and `/ (root)`, then **Save**.
4. After about a minute your link appears there:
   `https://YOUR-USERNAME.github.io/rowhouse/`

Share that link. Anyone can open it; nobody needs a GitHub account.

## Install on a phone
- **iPhone / iPad:** open the link in Safari → Share → **Add to Home Screen**.
  Open it from the home screen icon for full-screen mode.
- **Android:** open in Chrome → menu → **Install app** (or Add to Home screen).

After the first visit it works with no internet.

## Tips
- iPhone: sounds follow the ring/silent switch. Keep the ringer on to hear the beeps.
- Weights and completed days are saved on each person's own device only.
- Test another date by adding `?today=2026-09-22` to the address.

## Adding next month
Add a new entry to `PROGRAMS` in `programs.js` (or send the new PDF to Claude to
convert), then upload the new `programs.js` to GitHub. Installed apps pick up the
change the next time they're opened with an internet connection.
