# PLAN.md: Foxfold, a playful app for learning Claude and AI

> Approved 2026-11-11. Each milestone in section 8 is one Sonnet session.

## 1. Context and goal

Prashanth and a group of AI beginners want to learn Claude and the AI basics around it.
Typical learning apps are rows of text, and this one must feel like a toy instead: you tap
a paper fox, things unfold, and each fold teaches one small idea.

- **Audience:** general beginners on a mix of Android phones and iPhones. No profession assumed.
- **Outcome:** about 28 short topics in 6 tracks, each ending in an optional mini-game.
- **Tone:** plain, friendly, practical, taken from `docs/cheatsheet.md`.
- **Biggest risk:** Claude's products change often, so content goes stale. Section 7 handles this.

## 2. Key decisions (made)

| Decision | Choice | Why |
|---|---|---|
| Platform | Installable web app (PWA), shared by a link | Runs on Android and iPhone, no app store, no APK |
| Hosting | GitHub Pages from this repo | Free, and `git push` is the whole release process |
| Tech | Plain HTML, CSS and JavaScript modules. No framework, no build step | Small, easy for Sonnet to work in, nothing to install |
| Animation | CSS transforms (including 3D folds), inline SVG, Web Animations API | All written in code by Claude, no animation files |
| Claude API | None. Fully offline after the first visit | No key, no cost, nothing to secure |
| Progress | Everything open from the start. Optional games earn a paper star | No locks, so nobody gets stuck |
| Storage | `localStorage` on the device for stars. No accounts, no server | Simplest thing that works |
| Content | JSON files fetched at run time, separate from app code | Lessons update without touching the app |
| Mascot | Nib, the origami fox (picked) | See section 3 |
| Name | **Foxfold** (working name, held in one constant so it is cheap to change) | Not "Claude", ties to the mascot |
| JavaVisual reuse | Only the idea of JSON lesson content. No code or visuals shared | Different platform, and the look must differ |
| Fonts | Baloo 2 (headings) and Nunito (body), stored in the repo | Rounded and friendly, and they work offline |

## 3. Visual style and mascot

**World:** a craft table. Everything is folded or cut paper lying on a cutting mat.

- **Colours:** teal cutting-mat background with faint grid lines. Nib is tangerine paper with
  white tips. Each track has its own paper colour: sunflower, sky blue, coral pink, mint,
  violet, and midnight blue with silver for the optional track. Text is near-black ink on
  off-white paper.
- **Shapes:** flat colour, hard-edged fold shadows (one darker tone per facet), no gradients or
  glassy effects. Corners are sharp like paper, and buttons are paper tabs.
- **Type:** Baloo 2 for titles, Nunito for reading, at least 17px body size on phones.
- **Motion rules:** things fold, unfold, flip and hop rather than fade or slide. Each move
  overshoots a little and settles, like springy paper. Moves last 250 to 600 ms and can always
  be tapped through. With the phone's "reduce motion" setting on, folds become quick fades.

**Mascot concepts**

1. **Nib, the origami fox (chosen).** Built from about 12 SVG triangles. Idles by blinking,
   twitching an ear and swishing its tail. Reacts to taps with a hop and a head tilt.
2. Scribble, the living doodle: an ink squiggle that redraws itself into shapes. Not chosen.
3. Bloop, the jelly lantern: a glowing jelly whose bubbles hold the tracks. Not chosen.

Nib is an original character. It must not resemble Anthropic's logo, spark mark or any brand
character, and the app uses no Anthropic logos or brand colours.

## 4. Screen-by-screen experience

There is one page with four states. The back gesture always plays the reverse fold.

**A. Home.** Nib sits in the middle of the mat, idling. A small paper tag says "tap me".
First visit only: Nib folds itself up from a flat square in about 2 seconds.

**B. Tracks (tap Nib).** Nib hops and its tail fans out into six coloured paper strips. Each
strip flies to a spot in a ring around Nib and folds into that track's origami shape:

| Track | Shape | Colour |
|---|---|---|
| 1 AI foundations | Boat | Sunflower |
| 2 Using Claude | House | Sky blue |
| 3 Prompting | Paper plane | Coral pink |
| 4 Extending Claude | Pinwheel | Mint |
| 5 Claude Code | Lantern | Violet |
| 6 Beyond the basics | Star | Midnight and silver |

Each shape bobs gently and shows its earned stars as small dots. Tracks not yet written show
as an unfolded square with "coming soon".

**C. Topics (tap a shape).** The shape glides to the centre and unfolds into a large sheet,
like a pop-up book page. A dashed fold line winds down the sheet, and each topic stands up
along it as a pop-up paper tab, one after another. Nib shrinks to a corner and walks along
the line to whichever tab you tap. Finished topics carry a star.

**D. Topic content (tap a tab).** The tab unfolds in three folds into a full page. Content is
a short run of **folds** (panels), one idea each, moved through by tap or swipe. A page-corner
curl shows there is more. There is no long scrolling text. Nib sits in the corner and reacts:
it nods on a right answer and tilts its head on a miss. The last fold is the optional
mini-game. On finishing, the page folds into a paper star that flies back to the track shape.

**Mini-game types (6 reusable, data-driven widgets)**

| Widget | What you do | Example use |
|---|---|---|
| `sort` | Flick paper planes into the right basket | Which model for which task; safe to paste or not |
| `pick` | Tap one of 2 to 4 answers | Quick check at the end of a topic |
| `flip` | Flip a card from weak to strong | Vague prompt versus clear prompt |
| `meter` | Drag to fill something and watch what happens | Context window filling up and compacting |
| `build` | Snap pieces together | Build a prompt from what, context, constraints, format |
| `spot` | Tap the suspicious part | Spot the made-up fact in an answer |

## 5. Topic outline

Limits per topic: 4 to 7 folds, at most 45 words per fold, one game. Volatility is how fast
the facts change (S stable, M medium, F fast) and drives the review schedule in section 7.

**Track 1, AI foundations**

| Topic | Hook | Vol. |
|---|---|---|
| What an AI model is | `pick`: guess the next word, as the model does | S |
| Tokens and the context window | `meter`: fill Claude's desk until it compacts | S |
| Hallucinations and checking answers | `spot`: find the made-up fact | S |
| Knowledge cutoff and web search | `sort`: needs a search or not | S |
| How models are trained | `flip`: myth versus what really happens | S |
| Using AI safely | `sort`: fine to paste or never paste | S |

**Track 2, Using Claude**

| Topic | Hook | Vol. |
|---|---|---|
| The Claude apps (web, desktop, mobile, Claude Code, Cowork, Chrome, Excel, PowerPoint, Google Workspace) | `sort`: match the job to the app | F |
| Models and effort, Haiku to Fable | `sort`: the "which model for which task" game | F |
| Usage limits and habits that save usage | `pick`: which habit saves more | F |
| Projects, memory, artifacts and skills | `sort`: which feature fits this need | M |
| Research and web search | `pick`: quick question or research job | M |

Not covered yet: styles (the official article returned a 404) and voice (until an official page confirms it).

**Track 3, Prompting**

| Topic | Hook | Vol. |
|---|---|---|
| Prompt basics | `build`: assemble the four parts | S |
| Prompting techniques (examples, step-by-step, structure, iterating) | `flip`: before and after | S |
| Fixing bad answers | `pick`: choose the best follow-up | S |

**Track 4, Extending Claude:** skills (M), connectors and MCP (M), CLAUDE.md, standing instructions (M).

**Track 5, Claude Code:** what it is and a first session (M), plan mode, permissions and auto
mode (F), essential commands (F), the plan-then-build workflow (M), hooks (M), subagents and
plugins (F), git as a safety net (S).

**Track 6, Beyond the basics (optional):** what an AI agent is (S), the API and tool use as
concepts (M), RAG and embeddings (S), evaluating AI output (S).

**Changes from the cheatsheet**

- QA examples (Selenium tests, Jira tickets, TestNG) become everyday ones: planning a trip,
  writing an email, summarising a long document, a household budget, studying for an exam.
- The model topic covers the full family from Haiku to Fable. The cheatsheet calls Opus the
  deepest reasoner, which is out of date, so this topic is rewritten from the official models
  page, not from memory.
- Nothing time-limited: no promotions, no prices, no exact limit numbers.

## 6. Content format

```
index.html, app/ (code), assets/ (fonts)
content/
  index.json            tracks, topic order, content version
  facts.json            the facts that change often, in one place
  topics/<topic-id>.json
check.html              content checker, opened in a browser
```

One topic file:

```json
{
  "id": "tokens-context",
  "track": 1,
  "title": "Tokens and the context window",
  "reviewed": "2026-11-20",
  "volatility": "stable",
  "sources": [{ "title": "Official page title", "url": "https://..." }],
  "folds": [
    { "type": "say", "text": "A **token** is a small piece of text..." },
    { "type": "meter", "prompt": "Fill the desk", "data": { } },
    { "type": "pick", "question": "...", "options": ["...", "..."], "answer": 0, "why": "..." }
  ]
}
```

- Fold types are `say` (Nib talks, with an optional small picture), `steps`, and the six games.
- Text allows only bold and inline code. No HTML in content files.
- `facts.json` holds the model list (name, one-line strength, relative usage cost), the app
  list and the names of the limits. Folds refer to it with `{{facts.models}}`, and the model
  game builds its baskets from it. A new model is then a one-file edit.
- `check.html` loads every file and reports missing fields, over-long folds, unknown fold
  types, broken `{{facts}}` references and topics that are due for review.

## 7. Keeping content fresh (the main risk)

**Write it so it ages slowly**

- Teach the idea first and the product detail second. "Bigger models cost more usage" stays
  true for years, while a specific number does not.
- No exact limits, prices, token counts or dates in fold text. Say "depends on your plan" and
  link to the official page.
- Fast-changing facts live only in `facts.json`, never inside fold text.

**Source it from official pages**

- For every M or F topic, the writing session must fetch the official Anthropic pages first:
  the Claude help centre, the Claude docs, the Claude Code docs and the official models page.
  It records the exact URLs in `sources` and sets `reviewed` to that day.
- If a claim cannot be found on an official page, it is left out. Product facts are never
  written from the model's memory.
- S topics start from the cheatsheet and general knowledge, and still get a `reviewed` date.

**Show the date to learners**

- Every topic ends with a paper postage stamp reading "Checked Nov 2026", plus its source links.
- The app compares `reviewed` to today: F topics after 60 days, M after 120 and S after 365
  show a small note, "This may have changed. Check the official page." This needs no update
  from anyone, so stale content is never presented as current.

**Update without rebuilding**

- Content is fetched from `content/` when the app opens. The offline cache tries the network
  first for content and falls back to the saved copy, so an update is: edit JSON, `git push`,
  and every phone has it the next time it opens online. Nobody reinstalls anything.
- App code is cached separately with a version number, so content updates never touch it.

**Refresh routine (one short Sonnet session, monthly or when Anthropic announces something)**

1. Open `check.html` and list the topics that are due.
2. For each, fetch its `sources` and compare them with the folds and `facts.json`.
3. Show the proposed changes as a diff. Prashanth approves them.
4. Update `reviewed`, commit and push.

## 8. Milestones (one Sonnet session each, in order)

Each session starts with "Read PLAN.md, do milestone N only" and ends with a commit.

| # | Milestone | Done when |
|---|---|---|
| 1 | **Skeleton and full flow.** Page, four states, back navigation, content loader, short `CLAUDE.md`, two sample topics with `say` and `pick`. Transitions are plain fades. Placeholder fox. | You can tap from Nib to tracks to topics to content and back on a phone-sized screen |
| 2 | **Widgets and checker.** The other five games in plain form, final schema, `facts.json`, `check.html`. | Every widget works from JSON alone, and the checker catches a deliberately broken file |
| 3 | **Track 1 content** (6 topics), broadened from the cheatsheet. | Checker is clean and each topic reads in under 2 minutes |
| 4 | **Track 2 content** (5 topics) from official pages, with the model game. | Every topic has sources and a date, and the model list covers Haiku to Fable |
| 5 | **Track 3 content** (3 topics), stars and saved progress. | Stars survive closing and reopening the app |
| 6 | **Installable and shared.** Manifest, icon, offline cache, freshness stamps and notes, GitHub Pages. | Installed on one Android phone and one iPhone, works in aeroplane mode, and a pushed content edit appears without reinstalling |
| 7 | **Nib comes alive.** SVG fox, idle loop, tap reactions, first-visit fold-up, tail-to-tracks reveal with the six shapes. | Home and tracks match section 4 and stay smooth on an older phone |
| 8 | **Unfolding.** Shape-to-sheet unfold, pop-up topic tabs, Nib walking, tab-to-page unfold, reverse folds. | Every step in the flow has its own transition |
| 9 | **Polish.** Fold-to-fold motion, star reward, Nib's reactions in games, reduced-motion mode, tap targets, text contrast. | A first-time tester gets through a topic with no help |
| 10 | **Track 4 content** (3 topics). | As milestone 4 |
| 11 | **Track 5 content, part 1** (first 4 topics). | As milestone 4 |
| 12 | **Track 5 content, part 2** (last 3 topics). | As milestone 4 |
| 13 | **Track 6 content** (4 topics). | As milestone 4 |

Milestone 6 is the first version worth sharing with the group: Tracks 1 to 3 with simple
transitions. Milestones 7 to 9 add the rich animation, as the build order requires.

## 9. How to check the work

- **Each session:** serve the folder locally (any simple static server already on the machine),
  open it in Chrome's phone view and walk the whole flow. Then open `check.html`.
- **From milestone 6:** test the live link on a real Android phone and a real iPhone in Safari,
  including "Add to Home Screen" and aeroplane mode.
- **Content sessions:** open three source links per topic and confirm the folds match them.
- **Animation sessions:** turn on "reduce motion" and confirm nothing breaks or blocks taps.

## 10. Out of scope

Accounts, syncing progress between devices, live calls to Claude, sound, languages other than
English, and app store listings.
