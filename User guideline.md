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
- **Sudoku** - 9x9 number placement
- **Wordle** - six-guess word deduction
- **Sokoban** - grid-based box pushing
- **Crossword/Memory Games/Trivia (coming soon)** - shown when a puzzle feed is available

Sessions are optionally instrumented (with consent) to create anonymized datasets that power AI hinting and validation.

### System Requirements
- Modern browser: Chrome, Edge, Firefox, or Safari (latest two versions)
- Device: Desktop or tablet recommended; mobile works with responsive controls
- Network: Stable internet; offline play is not supported yet

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

### Sudoku
- **Goal:** Fill the 9x9 grid so each row, column, and 3x3 box contains 1-9 exactly once.
- **Steps:** Pick difficulty (Easy/Medium/Hard), start the puzzle, click a cell, and type 1-9. Use **Notes** for pencil marks and **Undo** to revert moves. Submit when solved.
- **Scoring:** Fewer mistakes and faster times yield higher points; harder modes add multipliers.

### Wordle
- **Goal:** Guess the hidden word within six attempts.
- **Steps:** Type a valid word and press Enter. Tile colors show feedback (green = correct spot, yellow = wrong spot, gray = not in word). Adjust your guesses using the feedback. Submit when solved or out of attempts.
- **Scoring:** Fewer guesses earn more points; streaks boost XP.

### Sokoban
- **Goal:** Push all crates onto target tiles without trapping them.
- **Steps:** Use arrow keys or WASD to move. Plan before pushing into corners. Restart anytime; Undo steps back one move. Submit when every crate is on a target.
- **Scoring:** Move efficiency plus completion time; higher difficulties use larger maps.

### Upcoming Puzzles
Crossword/Nonogram/Trivia appear as soon as their feeds are live. You will see "Loading soon" cards with a short description and ETA.

---

## 5. Hints, Scoring, and Progress

- **AI Hints:** Available on supported puzzles. Request a hint to get a context-aware nudge; using hints reduces score but preserves streaks if you finish.
- **Validation:** After submission, Gemini validates your solution and flags likely mistakes before finalizing the attempt.
- **XP & Streaks:** Complete daily puzzles to keep streaks; XP feeds into badge unlocks.
- **Badges:** Examples: First Clear, Speed Runner (fast solve), Perfect Logic (no hints), and Clean Sweep (all daily puzzles).
- **Leaderboards:** Daily leaderboard shows rank, nickname, games played, and total points. Updates every 15 minutes.

---

## 6. Telemetry & Research Mode

- **What we collect:** Timestamps, move counts, hint usage, and minimal puzzle state needed to study problem-solving patterns. No raw keystrokes or personal text content.
- **Consent controls:** Enable/disable telemetry in **Settings > Privacy**. A banner also asks for consent on first run.
- **Anonymization:** Pseudonymous user IDs, redacted puzzle content where possible, and aggregation before export.
- **Exports:** Research exports are opt-in only; you can revoke consent or delete your data at any time.

---

## 7. Troubleshooting and FAQ

- **Password reset not arriving:** Check spam; if blocked, request again after 5 minutes.
- **Progress not saving:** Ensure you are signed in and online; refresh and retry. If it persists, sign out/in.
- **Game freezes or lags:** Close other heavy tabs, disable animations in **Settings > Display**, and retry.
- **Hint not working:** Hints require network access and a valid API key on the server. Try again after a moment.
- **Report a bug:** Use **Help > Report a bug** with steps and a screenshot if possible.
- **Delete account/data:** Go to **Settings > Privacy > Delete account**; this removes saved attempts and telemetry.

---

## 8. Accessibility and Settings

- **Themes:** Light and dark modes with high-contrast accents.
- **Typography:** Adjustable font sizes; retro pixel overlays can be toggled off for readability.
- **Input:** Full keyboard support; large tap targets on touch devices.
- **Color assistance:** Color-blind friendly palette for feedback tiles (especially Wordle).
- **Notifications:** Enable/disable sound and haptics; mute background audio.
- **Privacy:** Toggle telemetry, export data, or delete your account from the privacy panel.

---

## 9. Glossary

- **Attempt:** A started puzzle session with start/end timestamps.
- **Badge:** A reward for completing specific milestones (e.g., no-hint clear).
- **Hint:** AI-provided nudge tailored to your current puzzle state.
- **Leaderboard:** Daily ranking by points and games played.
- **Streak:** Consecutive days with at least one completed puzzle.
- **Telemetry:** Anonymized events (moves, hints, timings) collected for research.

---

Need more help? Contact support@mindstacks.app. We are building this in the open - send feedback any time.
