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
