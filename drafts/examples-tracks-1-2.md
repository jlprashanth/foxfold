# Draft: examples before the quiz (Tracks 1 and 2)

Status: **superseded**. The live content now uses titled cards with points and chat-style `example` cards; see `content/topics/`. Kept for history.

How to read this:
- Lines marked **NEW** are added folds. **CHANGED** replaces an existing fold. Anything not listed stays as it is.
- Each fold stays under the 45-word limit and uses only `**bold**` and `` `code` ``.
- Every topic stays within 7 folds, and the new folds sit just **before the game**.
- Example prompts are in quotes, so they read like something you would really type.

---

## Models and effort (Track 2): the big rewrite

Old: 5 folds. New: 7 folds. Each model now comes with an example job, effort gets its own example, and there is a short "how to choose" list before the quiz.

1. **CHANGED** (say)
   > Claude comes in a family of models. From lightest to most capable: {{facts.models}}. Think of them as helpers of different sizes: lighter ones are quicker, bigger ones think deeper and use more of your allowance.

2. **CHANGED** (say)
   > **Haiku** is the quickest, for short jobs you repeat a lot. Example: "Sort these 50 comments into praise, complaints and questions." **Sonnet** mixes speed and smarts. Example: "Summarise this article in five bullet points."

3. **CHANGED** (say)
   > **Opus** suits long coding and knowledge work. Example: "Read these three reports and turn them into one plan." **Fable** is for the hardest reasoning and long, many-step work. Example: "Find why this big project keeps breaking, then fix it."

4. **CHANGED** (say)
   > **Effort** is how much work Claude puts into an answer: how long it thinks and how carefully it checks. Higher effort helps on hard problems but is slower and uses more. Simple jobs do not need it.

5. **NEW** (say), effort example
   > Same model, different effort. "Suggest a name for my goldfish" needs no deep thought, so low effort is fine. "Plan a two-week trip on a tight budget" has many moving parts, and higher effort weighs more options before answering.

6. **NEW** (steps), how to choose
   - Start with the default model and effort.
   - Answer too shallow? Step up the model or the effort.
   - Quick, simple job? Step down to save usage.
   - Change one thing at a time, so you can see what helped.

7. Quiz (sort): **unchanged**, but with one new item that is different from the examples above, so it tests the idea rather than memory:
   - "Turn a long list of receipts into a table of dates and amounts" goes in **Haiku** (quick, repetitive).

**Please decide:** fold 2 used to say Sonnet is "a good default for most jobs". The official models page now says: "If you're unsure which model to use, start with Claude Opus 5.5 for most workloads." That line is written for developers using the API, so I have left out any "default" claim. We could add one, if you want it.

Sources I read for this topic: Models overview (platform.claude.com/docs/en/models/overview), Effort (platform.claude.com/docs/en/build-with-claude/effort), Usage limit best practices (support.claude.com). The effort page lists the levels as low, medium, high, xhigh and max, but those are the API names. I have not found an official page showing what the Claude apps call them, so the draft does not name levels.

---

## Track 1: AI foundations

### What an AI model is (5 to 6 folds)
**NEW** before the pick:
> Try it: ask Claude "Write a short poem about Mondays" twice. You get two different poems. Each word is a fresh prediction, not a stored answer pulled from a shelf.

### Tokens and the context window (5 to 7 folds)
**NEW** after fold 1 (the token fold):
> Example: a long word like `unbelievable` may be split into a few tokens, while a short word like `cat` is usually one. That is why long messages and big files use up more of the desk.

**NEW** before the meter:
> Example: early in a long recipe chat you say you are vegetarian. Many messages later, Claude suggests a chicken dish. Remind it, or start a fresh chat with the key facts at the top.

### Hallucinations and checking answers (5 to 6 folds)
**NEW** before the spot game:
> Example: you ask for three books about beekeeping. Claude lists three, with authors and years. Two are real. The third sounds just right but does not exist. Searching each title quickly catches it.

### Knowledge cutoff and web search (5 to 6 folds)
**NEW** before the sort game:
> Example: ask "What is the newest model of my phone?" Without search, Claude may name an older one, because that was the newest in what it learned. With search on, it can check current pages.

### How models are trained (5 to 6 folds)
**NEW** before the flip game:
> Example: tell Claude your dog is called Biscuit, and it uses that for the rest of the chat. In a new chat it will not know, unless memory is switched on or you say it again.

### Using AI safely (5 to 6 folds)
**NEW** before the sort game:
> Example: instead of "I am Priya Shah, account 4471 2290, why was I charged twice?", write "My bank charged me twice for one purchase. How do I ask for a refund?" You get the same help without sharing anything private.

---

## Track 2: Using Claude (other topics)

### The Claude apps (5 to 6 folds)
**NEW** before the sort game:
> Example day: you ask Claude something on your phone at the bus stop, then pick up the same chat on your laptop at home. Later, the Chrome extension helps you with the web page you have open.

### Usage limits and saving usage (5 to 6 folds)
**NEW** before the steps:
> Example: you have a 60-message chat about a holiday, and now you ask about your car. Claude carries all 60 messages along with that question. In a fresh chat it reads just one.

### Projects, memory, artifacts and skills (6 to 7 folds)
**NEW** before the sort game:
> Example: in a "Kitchen makeover" project you add your floor plan and budget. Every chat in it starts out knowing them. Ask for a shopping list, and Claude can make it an artifact you keep and share.

### Research and web search (5 to 6 folds)
**NEW** before the pick:
> Same topic, three tools. "Is the museum open today?" is web search. "Plan a fair way to split chores among four flatmates" is extended thinking. "Find and sum up what experts say about four-day work weeks" is research.

---

## Optional: an "example" card

Right now an example is just Nib talking (a `say` fold). We could add a small `example` fold type that looks like a chat: **You:** the prompt, then **Claude:** a short reply or note. Examples would then stand out from explanations at a glance. That is a code change (widget, styles, schema, `sw.js` version bump), so only if you like the idea once the wording is settled.
