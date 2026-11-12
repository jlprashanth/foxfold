# Foxfold

A playful app for beginners learning Claude and AI. Tap a paper fox, watch things unfold, and learn one small idea per fold.

**Try it:** https://jlprashanth.github.io/foxfold/

Foxfold is built for phones (Android and iPhone), installs as a PWA, and works offline after the first visit. There are no accounts, no server and no API key.

## What's inside

- **28 short topics in 6 tracks:** AI foundations, Using Claude, Prompting, Extending Claude, Claude Code, and Beyond the basics.
- **Nib, the origami fox,** a mascot that blinks, hops and tilts its head as you answer.
- **Folds:** each topic is a handful of short cards (45 words or fewer), with small interactive widgets and an optional mini-game.
- **Paper stars** earned by finishing games, saved on your device with `localStorage`. Everything is open from the start, so nothing is locked.
- **Paper-craft look:** flat colour, hard-edged fold shadows and springy fold and flip moves. With "reduce motion" on, screens just fade.

## Tech

Plain HTML, CSS and JavaScript modules. No framework, no build step, no npm dependencies.

```
index.html            App shell
app/                  JS modules and style.css
  config.js           App and mascot names (the only place they appear)
  flow.js, fx.js      Unfolding moves and shared animation helpers
  topics.js           Topics sheet
  widgets.js          Data-driven widgets, one per fold type
  reward.js           Star burst
content/              Lesson text as JSON
  index.json          Tracks and topic order
  topics/<id>.json    One file per topic
  facts.json          Fast-changing facts, kept out of fold text
assets/fonts/         Baloo 2 and Nunito (Latin subset WOFF2, SIL OFL)
sw.js                 Service worker for offline use
docs/cheatsheet.md    Tone reference for writing content
PLAN.md               Full plan, one milestone per session
```

## Run locally

You need any static file server. On Windows, with the Python launcher:

```
py -m http.server 8000
```

Then open http://localhost:8000 in Chrome, ideally in phone view (DevTools device toolbar).

The service worker serves app code cache-first, so after editing app files, unregister it in DevTools > Application or you will see stale code.

## Contributing content

- Lesson text lives in `content/`, never in JS.
- Text allows only `**bold**` and `` `code` ``. No HTML, no italics.
- Keep each fold to 45 words or fewer.
- Don't put exact prices, limits or dates in fold text. Put fast-changing facts in `facts.json`.
- Only cite pages you actually opened and read.

When app files change, bump `APP_VERSION` and update the `SHELL` list in `sw.js` so installed copies pick up the change.

## Hosting

Served from GitHub Pages in a subfolder, so all paths are relative (never a leading `/`). Pushing to `main` is the release process.

## Credits

- Fonts: [Baloo 2](https://fonts.google.com/specimen/Baloo+2) and [Nunito](https://fonts.google.com/specimen/Nunito), under the SIL Open Font License (see `assets/fonts/`).
- Nib is an original character. Foxfold is not affiliated with Anthropic and uses no Anthropic logos or brand colours.
