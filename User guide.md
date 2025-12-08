# MindStacks User Guide

Welcome to MindStacks, a retro-styled puzzle arcade that records real problem-solving sessions to help build better, more trustworthy AI. This guide walks you through setup, gameplay, privacy controls, and troubleshooting so you can focus on the puzzles.

---

## Table of Contents

1. What is MindStacks?
2. Account & Privacy
3. Navigation & Layout
4. Playing Puzzles
5. Hints, Scoring, and Progress
6. Telemetry & Research Mode
7. Troubleshooting and FAQ
8. Accessibility and Settings
9. Glossary

---

## 1. What is MindStacks?

MindStacks is a web app with a curated set of logic-first puzzles:

- **Sudoku** — 9×9 number placement
- **Wordle** — six-guess word deduction
- **Sokoban** — grid-based box pushing
- **Emoji Memory** — grid of paired emojis with move/time limits
- **Crossword/Trivia (coming soon)** — shown when a puzzle feed is available

Sessions are optionally instrumented (with consent) to create anonymized datasets that power AI hinting and validation.

### System Requirements

- **Browser**: Chrome, Edge, Firefox, or Safari (latest two versions)
- **Device**: Desktop or tablet recommended; mobile works with responsive controls
- **Network**: Stable internet; offline play is not supported yet

### Accessing the App

1. Open your browser and go to the MindStacks site or local dev server.
2. Land on the home screen with the puzzle carousel and leaderboard.
3. Sign in (or continue as a guest if enabled) to save attempts and earn badges.

---

## 2. Account & Privacy

### Sign Up or Sign In

1. Choose **Sign Up** to create an account (email + password or Google).
2. Verify you are 13+ and accept the consent notice.
3. Confirm your email if prompted, then you are routed to the dashboard.

**Password reset:** Click **Forgot password?**, enter your email, and follow the link sent to your inbox.

### Why Create an Account?

- Save puzzle attempts, streaks, and badges
- Sync progress across devices
- Access AI-powered hints and validation
- Opt in/out of telemetry at any time

### Privacy Defaults

- User IDs are pseudonymous; puzzle state is minimized and time-stamped.
- Telemetry is off until you accept the consent banner or toggle it on in **Settings > Privacy**.
- You can delete your account and associated data from **Settings > Privacy > Delete account**.

---

## 3. Navigation & Layout

- **Top bar:** Profile menu, privacy toggle, and quick links to Help.
- **Puzzle carousel:** Launch Sudoku, Wordle, or Sokoban; upcoming puzzles are labeled "Coming soon".
- **Attempt timeline:** Recent attempts with outcomes (completed, failed, abandoned).
- **Leaderboard:** Daily top players (rank, games played, points).
- **Status tray:** Shows streaks, XP, and badge progress.

---

## 4. Playing Puzzles

### 4.1 Sudoku

**Goal:** Fill the 9×9 grid so each row, column, and 3×3 box contains 1–9 exactly once.

**Steps:**

1. Pick difficulty (Easy/Medium/Hard) from the main menu.
2. Click **Start Game** to begin.
3. Click a cell to select it.
4. Type a number (1–9) or click the on-screen number pad.
5. Use **Notes** for pencil marks to track possibilities.
6. Use **Undo** to revert moves if needed.
7. Plan your moves strategically before filling cells.
8. Click **Submit** when the grid is complete.

**Scoring:** Fewer mistakes and faster times yield higher points; harder modes apply multipliers.

### 4.2 Wordle

**Goal:** Guess the hidden word within six attempts.

**Steps:**

1. Select difficulty (Easy/Medium/Hard/Expert).
2. Click **Start Game**.
3. Type a valid 5-letter word and press **Enter**.
4. Review the color feedback:
   - **Green** = correct letter in correct position
   - **Yellow** = letter in word but wrong position
   - **Gray** = letter not in word
5. Adjust your next guess using the feedback.
6. Complete the puzzle within six attempts or lose.

**Scoring:** Fewer guesses earn more points; streaks boost XP.

### 4.3 Sokoban

**Goal:** Push all crates onto target tiles without trapping them.

**Steps:**

1. Select difficulty (Easy/Medium/Hard/Expert).
2. Click **Start Game**.
3. Use **Arrow Keys** or **WASD** to move your character.
4. Plan before pushing crates into corners—they can get stuck.
5. Push each crate onto its target tile (marked position).
6. Click **Restart** anytime to reset the puzzle.
7. Click **Submit** when every crate is on a target.

**Scoring:** Move efficiency plus completion time; higher difficulties feature larger maps.

### Upcoming Puzzles

Crossword/Nonogram/Trivia appear as soon as their feeds are live. You will see "Loading soon" cards with a short description and ETA.

### 4.4 Emoji Memory

**Goal:** Reveal the grid of face-down cards, matching every emoji pair before you run out of moves or time.

**Steps:**

1. Choose a difficulty:
   - *Easy* — 4×3 grid (6 pairs, generous limits)
   - *Medium* — 6×4 grid (12 pairs)
   - *Hard* — 7×8 grid (28 pairs, tight limits)
2. Press **Start Game** (or **Play** from the catalog) to load a randomized deck seeded for fairness.
3. Click/tap a card to flip it, then select a second card:
   - If the emojis match, the pair locks in with a glow.
   - If they mismatch, both cards flip back after a short delay.
4. Track your stats in the right panel: elapsed time, remaining time, moves used, mismatches, and best streak.
5. Use **Restart Round** at any time to reshuffle the deck (the attempt logs the restart count).
6. When all pairs are matched, the summary dialog shows moves, time, and an option to jump to the next difficulty.

**Limits & Scoring:**

- Each difficulty enforces both a time limit and a move limit; exceeding either ends the run as failed.
- Efficient matching (few mismatches, fast flips) yields better telemetry metrics and leaderboard points.
- Telemetry captures memory-specific stats such as pairs matched, consecutive streaks, restart count, and board seed for research mode.

---

## 5. Hints, Scoring, and Progress

- **AI Hints:** Available on supported puzzles. Request a hint to get a context-aware nudge; using hints reduces score but preserves streaks if you finish.
- **Validation:** After submission, Gemini validates your solution and flags likely mistakes before finalizing the attempt.
- **XP & Streaks:** Complete daily puzzles to keep streaks; XP feeds into badge unlocks.
- **Badges:** Examples include First Clear, Speed Runner (fast solve), Perfect Logic (no hints), and Clean Sweep (all daily puzzles).
- **Leaderboards:** Daily leaderboard shows rank, nickname, games played, and total points. Updates every 15 minutes.

---

## 6. Telemetry & Research Mode

### What We Collect

Timestamps, move counts, hint usage, and minimal puzzle state needed to study problem-solving patterns. No raw keystrokes or personal text content.

### Consent Controls

Enable/disable telemetry in **Settings > Privacy**. A banner also asks for consent on first run.

### Anonymization

- Pseudonymous user IDs
- Redacted puzzle content where possible
- Aggregation before export
- Research exports are opt-in only; you can revoke consent or delete your data at any time.

---

## 7. Troubleshooting and FAQ

**Q: Password reset not arriving?**
A: Check your spam folder. If you still don't see it, request another reset after 5 minutes.

**Q: Progress not saving?**
A: Ensure you are signed in and online. Refresh the page and retry. If the problem persists, sign out and sign back in.

**Q: Game freezes or lags?**
A: Close other heavy browser tabs, disable animations in **Settings > Display**, and retry.

**Q: Hint not working?**
A: Hints require network access and a valid API key on the server. Try again after a moment.

**Q: How do I report a bug?**
A: Use **Help > Report a bug** with steps to reproduce and a screenshot if possible.

**Q: How do I delete my account?**
A: Go to **Settings > Privacy > Delete account**. This removes saved attempts and telemetry data permanently. This action cannot be undone.

**Q: Can I play offline?**
A: Currently, MindStacks requires an internet connection. Offline play is not yet supported but is planned for future releases.

**Q: What data is collected?**
A: Only timestamps, move counts, hint requests, and puzzle state—nothing personally identifiable. You control telemetry consent in **Settings > Privacy**.

---

## 8. Accessibility and Settings

### Display Options

- **Themes:** Light and dark modes with high-contrast accents.
- **Typography:** Adjustable font sizes; retro pixel overlays can be toggled off for readability.
- **Color assistance:** Color-blind friendly palette for feedback tiles (especially Wordle).

### Input & Navigation

- Full keyboard support throughout the app
- Large tap targets on touch devices
- Mouse, keyboard, and touch controls fully supported

### Sound & Notifications

- Enable/disable sound effects and background audio
- Haptics control for mobile devices
- Customize notification preferences

### Privacy Settings

- Toggle telemetry on/off
- Export your data
- Delete your account and associated data
- Manage consent preferences

---

## 9. Glossary

**Attempt** — A started puzzle session with start/end timestamps.

**Badge** — A reward for completing specific milestones (e.g., first clear, no-hint completion).

**Consent** — Your choice to allow or deny telemetry collection; managed in **Settings > Privacy**.

**Difficulty** — Challenge level of a puzzle (Easy, Medium, Hard, or Expert).

**Grid** — The playing board for puzzles like Sudoku and Sokoban.

**Hint** — AI-provided nudge tailored to your current puzzle state; reduces score but helps progress.

**Leaderboard** — Daily ranking by points and games played; updates every 15 minutes.

**Streak** — Consecutive days with at least one completed puzzle.

**Telemetry** — Anonymized events (moves, hints, timings) collected for research and improvement.

**Validation** — Gemini's check of your solution for correctness before finalizing the attempt.

**XP** — Experience points earned by completing puzzles; used for badge progression.

---

## Need More Help?

**Contact Support:**
- Email: [support@mindstacks.app](mailto:support@mindstacks.app)
- Help Center: [help.mindstacks.app](https://help.mindstacks.app)
- Community Forum: [community.mindstacks.app](https://community.mindstacks.app)

We are building this in the open. Send feedback anytime—your input directly shapes MindStacks.

---

**Version:** 1.0  
**Last Updated:** December 2025  
**Next Review Date:** March 2026

*Thank you for playing MindStacks. We hope you enjoy the challenge and help us build better AI through your problem-solving.*