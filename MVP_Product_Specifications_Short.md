# MindStacks — MVP Product Specification (Concise v2)

*Last updated: Sept 14, 2025*

## 1) One-liner
**MindStacks** is a gamified puzzle platform that captures **human problem-solving traces** (moves, hints, errors, paths) and publishes **anonymized, research-grade datasets** for AI/LLM teams and researchers.

---

## 2) Who & Why (short)
**Players**: students, casual puzzle fans, lifelong learners — fun practice + rewards  
**Data consumers**: AI/LLM teams & researchers — real human reasoning trajectories (not only final answers)

---

## 3) Problem → Solution
- **Problem**: Learning apps rarely capture *how* people solve; AI lacks high-quality human **process** data.  
- **Solution (MVP)**: Small set of puzzles with precise **step-level telemetry**, strict privacy, and daily **anonymized exports**.

---

## 4) MVP Scope
**Included**
- Sign up/login (13+), consent toggle for data sharing
- 3–4 puzzle categories via **Content APIs** (primary): Sudoku, Wordle-style, Crossword/Nonogram, Trivia
- Attempt lifecycle: start → events → submit → evaluate → score → badges
- Nightly batch **exports** (JSONL/Parquet) + simple **B2B downloads**
- Admin: upload/manage puzzles, view aggregates

**Excluded (post-MVP)**
- UGC puzzle builder, payments/marketplace, real-time data streams

---

## 5) Game Content Strategy
- **Primary: Content APIs (we render thin UI)** — fastest, full telemetry, deterministic server validation  
- **Optional: Hosted partner embed** (iframe + `postMessage` or tiny SDK) **only if** partner sends our event payloads; otherwise skip for MVP

---

## 6) Core UX
1. **Onboard**: age-gate (13+), consent toggle, short tutorial  
2. **Play**: choose puzzle & difficulty → minimal UI → hints available (cost points)  
3. **Submit & Debrief**: correctness, time, hints/mistakes, quick timeline  
4. **Progress**: XP, streaks, badges; daily leaderboard

---

## 7) Data Pipeline (end-to-end)
**Capture (client)** → emit `start | action | error | hint | backtrack | submit | eval` with `t_ms`, `delta`, `ui_state_hash` (buffer & flush every ~3s or 5 events)  
**Ingest & Normalize (API)** → append-only `attempt_events`; server timestamp; enum/schema checks  
**Validate & Summarize** → on submit, compare with server-held solution/solver; write `attempts` summary (duration, hints, mistakes, score, outcome)  
**Privacy & Anonymization** → pseudonymous `user_id`; no emails/IPs; opt-out respected; k-anonymity (k≥20) & optional DP noise on aggregates  
**Feature Engineering** → per attempt: `errors_per_min`, `time_to_first_hint`, `backtracks`, `avg_inter_event_ms`, simple strategy flags (systematic/greedy/trial-and-error)  
**Packaging** → daily `events.parquet`, `attempts.parquet`, `features.parquet` in S3 + `schema.json` + checksums  
**Delivery** → `/exports` lists bundles; clients download via **time-boxed signed URLs** or receive a webhook manifest (SLA: <24h after UTC midnight)

---

## 8) Minimal Data Model
users(id, email, created_at)
profiles(user_id, nickname?, country?, consent_data_share BOOL)
api_clients(id, name, api_key_hash, active)

puzzles(id, type, difficulty, initial_state JSONB, solution JSONB, source, version)
attempts(id, user_id, puzzle_id, started_at, submitted_at?, used_hints, mistakes, duration_ms, score, outcome)
attempt_events(id, attempt_id, t_ms_from_start, action_type, delta_payload JSONB, ui_state_hash, created_at)
exports(id, date, path, format, record_count, checksum, ready)
leaderboard_daily(date, user_id, points)

Indexes on `attempt_events(attempt_id, t_ms_from_start)` and `puzzles(type, difficulty)`.

---

## 9) API Surface (MVP)

**Base:** `https://api.mindstacks.app/v1`

- **POST** `/auth/signup` → `{ user_id }`  
- **POST** `/auth/login` → `{ token }` (JWT)  
- **GET** `/puzzles?type=&difficulty=&limit=&cursor=` → list (sanitized)  
- **POST** `/attempts` `{ puzzle_id }` → `{ attempt_id, ui_payload }`  
- **POST** `/attempts/:id/events` `{ events: [...] }` → `202`  
- **POST** `/attempts/:id/submit` `{ final_answer }` → `{ outcome, score, duration_ms }`  
- **POST** `/puzzles/:id/hints` `{ attempt_id }` → `{ hint_payload, cost }`  
- **GET** `/me/progress` → XP, streak, badges  
- **GET** `/leaderboard/daily?date=` → daily leaderboard  
- **GET** `/exports` (B2B, API key) → list + signed URLs

### Event (canonical)

```json
{
  "t_ms_from_start": 1530,
  "action_type": "action",
  "delta_payload": { "cell": "R5C7", "value": 3 },
  "ui_state_hash": "a1b2c3"
}
```

---

## 10) Scoring & Badges (simple)

**Score** = base(difficulty) + time bonus − (hint_cost × hints) − (mistake_penalty × mistakes) + first‑try bonus.
**Badges:** No‑Hints, Accuracy ≥95%, 7‑day streak, Speedster (p95 time), Strategist (low error rate).

---

## 11) Tech Stack

**Frontend:** Next.js (React + TS), Tailwind, React Query/Zustand, PostHog (analytics)  
**Backend:** AdonisJS 6 (Node/TS), PostgreSQL (Neon/Supabase), Redis (jobs), AWS S3 (exports), OpenTelemetry/Sentry (observability)  
**DevOps:** Docker, GitHub Actions (lint/test/migrate), Vercel (FE), Fly/Render (BE), secrets via platform

---

## 12) Metrics & Milestones

**Success (MVP):** D1 attempts ≥ 200; completion ≥ 55%; opt-in ≥ 70%; avg events/attempt ≥ 25; export SLA < 24h

**Timeline (8 weeks)**  
1. FE shell + auth + first puzzle (Sudoku), DB & events ingest  
2. Submit/eval + scoring/badges + analytics counters  
3. Add Wordle-style + Nonogram/Crossword; hints; leaderboards  
4. Nightly export + admin; privacy pass; load tests; pilot

---

## 13) Risks & Mitigations

- **PII leakage** → constrained inputs, client redaction, server filters  
- **Bot/low-quality data** → anomaly detection; minimum dwell thresholds; server-side validation  
- **Third-party availability** → cache puzzles; keep fallback generators for key types  
- **Scope creep** → limit to 3–4 puzzle types; defer UGC/payments

---

## 14) Appendix — Export Row (events, v1)

```json
{
  "export_date": "2025-09-14",
  "user_id": "u_3b9f…",
  "attempt_id": "a7c1…",
  "puzzle_id": "pz_001",
  "puzzle_type": "sudoku",
  "difficulty": "medium",
  "t_ms": 1530,
  "action": "action",
  "delta": { "cell": "R5C7", "value": 3 },
  "client": { "ver": "1.0.0", "device": "desktop" }
}
```
