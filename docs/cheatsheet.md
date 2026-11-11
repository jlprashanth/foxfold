Claude Model & Effort Cheat Sheet
Nov 8, 2026· @Prashanth
Golden rule: start cheap and step up only when the answer isn't good enough. Default to Sonnet at medium effort.
How Claude works: the basics
The ideas below build on each other. Tokens are the unit everything is measured in. They fill up the context window. Good prompts get results with fewer tokens and turns. Skills save you from typing the same prompt again and again. CLAUDE.md and Projects do the same for one project, and connectors let Claude fetch information itself instead of you pasting it.
1. Tokens: the unit of everything
A token is a small piece of text, usually a word or part of a word. 100 tokens is roughly 75 English words.
Usage limits are counted in tokens. That includes your message, Claude's reply, files Claude reads, and the whole earlier chat, which is re-read with every message.
So long chats and big files use up your limits faster.
2. Context window: Claude's desk for one chat
The context window is Claude's working memory for the current conversation. It's made of tokens, and it has a size limit.
When it gets full, Claude compacts: older parts become a summary, and recent parts stay in full.
A summary keeps the main points but can drop details, like an exact old error message, a one-time rule ("don't use Thread.sleep") or code written long ago.
To protect important details: keep decisions in a file (PLAN.md, CLAUDE.md), start a fresh chat per task, and restate anything that seems forgotten.
The context window is not long-term memory. Memory carries a few facts about you across chats. Compaction doesn't erase it.
3. Prompts: how you spend those tokens well
A prompt is simply what you type. Casual language, typos and your own style are all fine.
"Prompt engineering" just means giving clear instructions, like briefing a new colleague. Clear prompts get it right in fewer turns, which means fewer tokens and less context used.
A good prompt covers what you want, the context (language, tools, existing code), the constraints (style, what to avoid) and the format (code only, steps, a table).
Vague: "write a test for login". Clear: "Selenium + Java test for login: valid login, wrong password, empty fields. Use our BasePage, follow LoginPage.java style."
4. Skills: prompts you never retype
A skill is a saved set of instructions for one kind of task, like a recipe card Claude picks up when that task comes up.
Not mandatory. Claude works fine without any. Skills just save you from repeating yourself, and that saves tokens too.
Work ideas: a test-script skill with your team's framework, naming and assertion style; a bug-report skill (steps, expected vs. actual, severity); a test-cases-from-user-story skill.
Personal ideas: an Android project skill with your preferred stack and code style.
When to make one: if you're giving the same instructions a third time, ask Claude to "make this a skill".
5. CLAUDE.md and Projects: instructions that stick
A skill is for one kind of task. CLAUDE.md is for one project: a file in your project folder that Claude Code reads automatically at the start of every session.
Put your project rules in it, like "We use TestNG, not JUnit", "never use Thread.sleep" or "run tests with mvn test -Dgroups=smoke".
It survives /clear and compaction. It fixes "I told Claude this yesterday and it forgot."
Projects are the chat version on claude.ai: a folder of related chats with shared files and instructions. For example, an "Office QA" project could hold your framework docs and conventions.
6. Connectors: let Claude fetch it itself
Connectors (technically called MCP servers) link Claude to other apps, like GitHub, Jira, Google Drive or a database.
Then Claude reads the information directly instead of you copy-pasting it. That means less typing and fewer wasted tokens.
QA example: with a Jira connector, "read ticket QA-123 and write test cases for it" becomes one prompt.
Check your company's rules before connecting work tools.
The two settings
Model = how capable the brain is. Haiku is fast and light, Sonnet is the strong all-rounder, Opus is the deepest reasoner and costs the most usage.
Effort = how long it thinks before answering. High effort helps with multi-step reasoning, tricky bugs and design. It does little for lookups, rewording or boilerplate.
Both use up your limits, and they multiply: Opus at high effort costs far more per message than Sonnet at low.
Chat (claude.ai)
Task
Model
Effort
Quick facts, definitions, error meanings, rewording
Haiku or Sonnet
Low
Everyday questions: comparing, planning, explaining
Sonnet
Medium
Hard trade-offs, long analysis, Sonnet got it wrong
Opus
Medium–High
Claude Code
Task
Model
Effort
Renames, formatting, one-line fixes
Haiku or Sonnet
Low
QA test scripts: test cases, page objects, fixtures, assertions, refactors
Sonnet
Low–Medium
Implementing an agreed plan, UI tweaks, small bugs, Gradle/dependency errors
Sonnet
Medium
Architecture, multi-file features, migrations, new test framework design
Opus
High
Flaky tests (timing, async, race conditions), bugs Sonnet can't crack
Opus
High
Understanding a large unfamiliar codebase
Opus
Medium–High
The Opus-plans, Sonnet-builds workflow
Plan in Opus (plan mode helps). Settle the files to change, the approach, the order of steps and the key do-this-not-that choices.
Check the plan: could a competent junior dev build it without asking you design questions? If yes, it's ready. Aim for clear enough, not 100% perfect.
Save big plans to a file such as PLAN.md so they survive /clear and /compact.
Switch to Sonnet with /model and implement. Sonnet sees the whole conversation, so switching doesn't lose context or quality.
Switch back to Opus only if something big comes up, like a design question or a bug Sonnet keeps failing on.
Optional: for important changes, have Opus review the final result.
Switch at natural points, not every few messages. The first message after a switch costs a bit more.
Permissions and plan mode
Claude Code asks before editing files or running commands. You can approve each action, or allow some automatically.
Plan mode lets Claude think and propose without changing anything. Use it for step 1 above.
At the office, be careful auto-approving commands that delete files, push code or touch shared environments.
Use git, so any change Claude makes can be undone.
Usage-saving habits
Fresh chat or /clear for each new task. Long chats re-send all their history with every message.
/compact when a long session is still on the same task.
Be specific: give the file, the line and the error or stack trace, so there are fewer turns and fewer files to read.
Step up after a miss, not before. If Sonnet misses twice, switch to Opus instead of retrying a third time.
Exact usage limits depend on your plan and can change.
Important things to keep in mind
Claude can be confidently wrong
Sometimes Claude gives an answer that sounds sure but is wrong, like a made-up function name, a library option that doesn't exist or a wrong fact. This is called "hallucination."
Verify what matters: run the code, check the docs, and ask "are you sure? check again" when something looks off.
Treat Claude like a smart colleague, not a source of truth.
Knowledge cutoff and web search
Claude learned from data up to a certain date, so it may not know about new library versions, recent Android API changes or today's news.
When web search is available, Claude can look things up.
For anything version-specific, say "check the latest docs" or name your version ("Appium 2.x", "Android 15").
Be careful what you paste
Check your office's AI policy before sharing company code, internal documents or customer data with any AI tool.
Never paste passwords, API keys or tokens, even in personal projects. Use placeholders like <API_KEY> instead.