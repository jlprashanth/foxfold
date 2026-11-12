# Foxfold

Playful PWA for beginners learning Claude and AI. Full plan: `PLAN.md` (one milestone per session).

- Plain HTML/CSS/JS modules. No framework, no build step, no npm deps.
- App name and mascot name only in `app/config.js`.
- Content is JSON in `content/` (index.json + topics/<id>.json); never hard-code lesson text in JS.
- Content text allows only `**bold**` and `` `code` ``; no HTML. Max 45 words per fold.
- No exact prices, limits or dates in fold text; fast-changing facts go in `facts.json` (milestone 2).
- Windows: `python` and `python3` are Microsoft Store stubs and fail. Use `py` (e.g. `py -m http.server 8000`, `py -I script.py`).
- Run: `py -m http.server 8000` in the repo root, then open in Chrome phone view.
- Don't use Anthropic logos or brand colours.
- Hosted at https://jlprashanth.github.io/foxfold/ (a subfolder): use only relative paths, never a leading `/`.
- Offline: `sw.js` caches app code (bump `APP_VERSION` and the `SHELL` list when app files change) and serves content network-first.
- Fonts: `assets/fonts/` holds Latin-subset WOFF2 files of Baloo 2 and Nunito (SIL OFL, licences alongside). Add new files to `SHELL` in `sw.js`.
- Testing locally: the service worker serves app code cache-first, so after editing app files in Chrome, unregister it (DevTools > Application) or you will see stale code.
- Unfolding moves live in `app/flow.js` (four moves between Tracks, Topics and a topic page); `app/fx.js` has the shared helpers and `app/topics.js` the topics sheet. The outgoing screen rides in a fixed overlay while the new one is in place. With "reduce motion" on, none of these run and screens just fade.
- Testing moves in Chrome: if the OS has reduce motion on, `matchMedia` reports it, so the moves are skipped.
- Topic page polish: `turnPage()` in `app/fx.js` flips between folds; `app/reward.js` is the star burst; widgets take a `react` helper (`yes`/`no`) so Nib nods or tilts. `pose()` in `fx.js` assumes a top-centre origin, so `.fold` sets `transform-origin: 50% 0`. The page-to-tab and tab-to-page folds show a loose copy of the tab (`ghostTab` in `flow.js`) so its label never pops in or out.
- No Nunito italic file is shipped and `font-synthesis: none` is set, so do not use italics (use a left border for notes).
