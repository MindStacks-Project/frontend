# MindStacks

MindStacks is a retro-styled puzzle arcade that captures real problem-solving sessions to build better, more trustworthy AI. Players can experiment with Sudoku, Wordle, and Sokoban boards, review their performance, and optionally share anonymized telemetry that powers research-ready datasets and AI copilots.

---

## Overview
- Next.js 15 (App Router) frontend written in TypeScript and Tailwind CSS.
- Firebase Authentication (email/password + Google) with Firestore for future session data.
- Genkit-powered Gemini flows that generate context-aware hints and validate submitted solutions.
- Research-first instrumentation: anonymized telemetry, consent-aware exports, and developer tooling for validating privacy guarantees.
- Responsive design optimized for desktop and tablet puzzle play with a retro aesthetic.

---

## Tech Stack
- **Framework:** Next.js 15, React 19, App Router.
- **Styling:** Tailwind CSS 4, shadcn/ui component primitives, custom retro theming.
- **Auth & Data:** Firebase Auth + Firestore singletons, secure token hand-offs to the API tier.
- **AI Tooling:** Google Genkit with Gemini 2.5 for hinting and solution validation flows.
- **Testing:** `tsx --test`, Vitest-compatible assertions via Node’s built-in test runner.

---

## Prerequisites
- Node.js **20.x or newer** (preferably via [`nvm`](https://github.com/nvm-sh/nvm) or `asdf`).
- npm **10+** (bundled with modern Node releases).
- Firebase project credentials and a Gemini API key (see environment variables below).

---

## Local Setup
1. Clone the repo and install dependencies:
   ```bash
   git clone https://github.com/<org>/mindstacks.git
   cd mindstacks/frontend
   npm install
   ```
2. Copy `.env.local` (or create one) and populate the required values listed in the next section.
3. Start the web app:
   ```bash
   npm run dev
   ```
   The development server uses Turbopack and runs on [http://localhost:3000](http://localhost:3000).

For a production build, run `npm run build` followed by `npm run start`.

---

## Environment Variables
Create a `.env.local` file in the project root with:

| Name | Purpose |
| ---- | ------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase project web API key. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain from the Firebase console. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase web app ID. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | (Optional) Storage bucket used by Firestore/Storage rules. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID for Firebase web clients. |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | (Optional) Analytics measurement ID. |
| `NEXT_PUBLIC_API_BASE` | Optional override for the API origin when testing against a remote backend. |
| `GEMINI_API_KEY` | Google Gemini key used by Genkit to generate hints and validate solutions. |

Never commit the `.env.local` file—these secrets stay local or in your deployment platform’s secret manager.

---

## Development Workflow
- `npm run dev` — Start the Next.js dev server with Turbopack.
- `npm run build` — Production build (also validates that AI flows compile).
- `npm run start` — Serve the production build locally.
- `npm run typecheck` — Run TypeScript with `--noEmit` for CI-friendly safety.

---

## Running Tests
The project uses Node’s native test runner via `tsx`. Unit tests live in `src/lib/__tests__`.

```bash
npm test
```

Add `--watch` to re-run relevant suites while you iterate:

```bash
npm test -- --watch
```

---

## Additional Resources
- Product blueprint and UX notes live in `docs/blueprint.md`.
- Telemetry anonymization utilities and cohorts sit in `src/lib/telemetry.*`.
- AI flows for hints and validation are defined in `src/ai/flows/`.

---

## License
MIT (see `LICENSE.txt`). Final terms may change before external data sharing.
