# MindStacks

> **Class draft README** — explanatory, not the final product doc.  
> Code is not live yet; this file communicates intent and how the MVP will be used in class.

---

## 1. Project Overview
**MindStacks** is a gamified puzzle platform. Players solve short logic/word/number puzzles, and the app records **how** they solve (moves, hints, errors, timing). With explicit consent, those traces are turned into **anonymized datasets** that are useful for AI/ML research.  
**Value:** fun, rewarding practice for players; rare, process-level human reasoning data for researchers.

---

## 2. Installation Instructions
This repo is in the planning stage for class submission.

1) Clone the repo.  
2) Open the `/docs/` folder for the **MVP Product Spec** and diagrams (as they’re added).  
3) No runtime required yet.

> When code lands (Milestone 1), prerequisites will be **Node 20+** and (optionally) **PostgreSQL**. We’ll add simple `npm run dev` commands for local web/API.

---

## 3. Usage Guide
**What the MVP will do (at a glance):**
- Choose a puzzle → make moves (we log steps) → optional hints (cost points) → submit → quick debrief (time, mistakes).
- Clear privacy controls: age 13+ and a visible data-sharing toggle. You can play without sharing.
- With consent, anonymized events appear in a small daily export used for classroom demos.

**Class demo plan:** a 2–3 minute play session, a look at the anonymized event rows, and how that becomes a tiny training dataset.

---

## 4. Configuration
(Will be introduced once code is added.)
- `DATA_SHARE_DEFAULT` (default `false`) — initial state of the consent toggle.  
- `EXPORT_FORMAT` (`jsonl` or `parquet`) — classroom export format.  
Sample `.env.example` files will be provided. No secrets or PII are committed.

---

## 5. Contributing Guidelines
- Use GitHub Issues for tasks; one focused PR per change.  
- Branch names: `feat/...`, `fix/...`, `docs/...`; short descriptive commits.  
- Keep PRs small (~≤300 lines) and include a 1–2 sentence summary.  
- Stick to MVP scope (3–4 puzzle types, nightly export). Bigger ideas → backlog.

---

## 6. License
**MIT (placeholder)** for classroom use. Final licensing will be decided before any external data sharing.

---

**Links**
- MVP Product Spec (Concise v2): see class Canvas.
- Questions: open an issue with the `question` label.
