# Final Demo Journal

## Opening

I built this MVP as my response to the Beavermind AI Native Development Exercise. I received an ambiguous product brief and spent my first hour reducing it to a manageable vertical slice: find a call, understand the conversation, evaluate the coach, and provide useful structured feedback. I deliberately avoided trying to reproduce an entire production platform. Instead, I focused on the one workflow that proves whether an AI evaluation can be embedded in a coaching tool with clear, structured output.

The system connects a React frontend on Vercel to a FastAPI backend on Render, backed by Supabase PostgreSQL. The key technical demonstration is the AI evaluation — a structured 12-dimension rubric that transforms an unstructured transcript into actionable coaching feedback, with the API key kept server-side and the result persisted to the database.

## What I Built

A time-constrained MVP emulator of a coaching-call evaluation workflow. The application lets a coaching program manager:

1. Search for calls across coaches, clients, programs, and call types
2. Open any call to view its metadata and full transcript
3. Run an AI evaluation against a 12-dimension rubric
4. Review structured results including an overall score, per-dimension scores, strengths, improvement areas, recommendations, and supporting evidence
5. View aggregate analytics across the call library

I also added Coach and Client management pages with full CRUD because the evaluation system needs meaningful context. Without knowing who the coach and client are, the evaluation scores have no anchor.

The demo uses realistic seeded data — 5 coaches, 10 clients, 10 programs, 10 calls with transcripts, and 5 historical evaluations — so a reviewer can explore the product immediately without setting up a database.

## My Development Journey

### Sprint 1 — Building the Foundation

I started by scaffolding the project. I set up the React frontend with Vite, TypeScript, TailwindCSS, and shadcn/ui. I set up the FastAPI backend with SQLAlchemy and a Supabase PostgreSQL connection. I defined the data model — Coach, Client, Program, Call, Evaluation, DimensionScore — and wrote a seed script to populate demo data.

Once the foundation was in place, I built the application shell: sidebar navigation, dashboard with stat cards, call search and list, call detail with transcript display, and the evaluation runner. I was happy with the data flowing, but the UI still looked like a development prototype. I spent the rest of Sprint 1 tightening spacing, fixing responsive behavior, and applying the purple/black/white color palette. I validated mobile, tablet, and desktop layouts across viewports from 320px to 1920px.

### Sprint 2 — Connecting the Core Workflow

Sprint 2 was about connecting the frontend to real backend data. I found that the existing backend scaffold had several bugs: relative imports that failed when running `uvicorn main:app`, list endpoints returning single schemas instead of arrays, missing search parameters, and a database driver mismatch.

I fixed each issue methodically. I corrected the imports, fixed the response models, added the missing endpoints, updated the database URL scheme to match psycopg3, and fixed the seed script. Then I wired the frontend pages to live endpoints: the dashboard pulls stats from `/api/dashboard/stats`, the calls page fetches `/api/calls` with search and type filters, call detail displays coach/client/program metadata and transcripts, and analytics renders charts with Recharts.

By the end of Sprint 2, I could complete the core journey end-to-end: find a call, open it, read the transcript, and see real data on every page. The evaluation runner existed but still used a basic mock. I was ready to make it genuinely AI-powered.

### Sprint 3 — Implementing AI Evaluation

Sprint 3 was the most critical and the most challenging. I needed to turn the mock evaluation into a real AI workflow.

I redesigned the 12-dimension rubric around coaching-specific criteria: Check-in & Connection, Agenda & Alignment, Active Listening, Question Quality, Diagnostics / Discovery, Goal Clarity, Coaching & Guidance, Insight Generation, Action Planning, Accountability, Communication Quality, and Close & Next Steps. I added call-type-specific guidance so the AI knows whether it's evaluating a sales call, kick-off, coaching session, or strategic review.

I built a structured prompt that sends the transcript (truncated to 12,000 characters), the call type, the 12 dimensions with descriptions, and explicit scoring rules to an OpenAI-compatible API. The model returns JSON, which I validate with a strict Pydantic schema: exactly 12 dimensions, valid names, no duplicates, scores between 1 and 5, and `overall_score` must equal the arithmetic mean of dimension scores.

I added `strengths`, `improvement_areas`, and `recommendations` to the output so the result is actionable, not just numerical. On the frontend, I updated the evaluation display to a three-column grid with distinct colors for each section.

One issue I ran into was that LLMs don't always return valid JSON even with `response_format: json_object`. The validation layer (`_validate_and_normalize`) had to handle missing fields, wrong dimension counts, invalid names, duplicate dimensions, out-of-range scores, and mismatched overall scores. I made it defensive without being overly complex.

### Sprint 4 — Final Polish & Delivery

With the core workflow working, I spent Sprint 4 on polish and management functionality. I cleaned up the charts across the Dashboard and Analytics pages — better tooltips, consistent spacing, descriptive labels, donut chart for call types, and a reusable chart utilities module. I added Coach and Client management pages with full CRUD and dependency protection, so a user can create, edit, and delete coaches and clients without breaking existing data.

I then ran a full system audit: tested every API endpoint, verified database integrity, confirmed frontend routes work, validated responsive behavior across nine viewports, and checked that the build passes with no TypeScript errors. I documented the deployment architecture — Vercel for the frontend, Render for the backend, Supabase for PostgreSQL — and prepared environment variable configurations.

At this point the MVP is ready for demonstration.

## Architecture

### System Architecture

```
Vercel (Frontend)
    ↓ HTTPS
Render (Backend — FastAPI)
    ↓
Supabase PostgreSQL
    ↓
OpenAI-compatible AI Service (server-side only)
```

### Frontend

React + Vite + TypeScript + shadcn/ui + Recharts. The frontend handles UI, navigation, user interactions, and data presentation. It never connects directly to the database or the AI service. It calls the FastAPI backend for everything.

### Backend

FastAPI + SQLAlchemy + psycopg3. The backend handles API routing, business logic, the evaluation workflow, database access, and OpenAI communication. The AI API key lives here as an environment variable and never leaves the backend.

### Database

Supabase PostgreSQL. Stores Coaches, Clients, Programs, Calls, Evaluations, and DimensionScores. The backend connects via SQLAlchemy ORM. I use Supabase as a managed PostgreSQL provider — not the Supabase browser SDK — because I want full control over queries and relationships on the server.

### AI Service

OpenAI-compatible backend integration. Responsibilities: analyze transcript, produce structured evaluation, generate feedback. The API key is server-side only. The frontend never sees it.

### Request Flow

When a user clicks "Run Evaluation":

1. React sends the call ID to `POST /api/evaluations?call_id=...`
2. The backend validates the call UUID and loads the transcript
3. The evaluation service sends the transcript, call type, and 12-dimension rubric to the AI provider
4. The model returns structured JSON
5. Pydantic validation enforces the schema
6. The validated result is persisted to Supabase
7. The frontend receives the result and displays scores, feedback, and evidence

## Live Demo Flow

I walk through the application in this order:

1. **Dashboard** — Show live stat cards (Total Calls, Evaluated, Avg Score, Coaches) and charts. Point out that the data is real, not hardcoded.
2. **Coaches** — Navigate to `/coaches`. Show the search, create a temporary coach, then delete it. Explain that coach management exists because evaluations need context.
3. **Clients** — Navigate to `/clients`. Briefly show the list and search. Same CRUD pattern as coaches.
4. **Calls** — Navigate to `/calls`. Search by title or filter by type. Show the call cards with coach, client, program, date, and evaluation status.
5. **Call Detail** — Open a pending call. Show the metadata cards and scroll through the transcript briefly to establish context.
6. **Transcript** — Point out that the transcript is realistic seeded data. Read one or two exchanges.
7. **Run Evaluation** — Click the button. Explain the backend flow: React → FastAPI → AI service → structured JSON → validation → database.
8. **Evaluation Results** — Show the overall score, three-column grid (Strengths, Improvement Areas, Recommendations), and the 12 dimension scores with evidence.
9. **Persistence** — Refresh the page to show the evaluation survives.
10. **Analytics** — Navigate to `/analytics`. Show the donut chart, score distribution bar chart, and coach performance grouped bar chart.
11. **Responsive** — Resize to mobile width to show the sidebar collapsing, grids stacking, and charts scaling.

## Live AI Demonstration

When `OPENAI_API_KEY` is configured on the backend, clicking "Run Evaluation" sends the transcript to the live AI provider. The backend constructs a prompt with the call type, the 12 dimensions, scoring rules, and the truncated transcript. The model returns structured JSON at temperature 0.2, which is validated before anything is saved.

Without a configured API key, the system returns a deterministic mock evaluation for demonstration. The mock mode is intentional — it ensures the demo never breaks due to missing credentials.

I do not show API keys or environment variable values during the demo. The configuration is handled entirely in the deployment platform.

## Validation

I validated the system at multiple levels:

- **Frontend build**: `npm run build` passes with no TypeScript errors.
- **Lint**: `npm run lint` passes with only pre-existing warnings.
- **Backend health**: `GET /health` returns `{"status": "ok"}`.
- **API endpoints**: All endpoints tested via curl and integration tests.
- **End-to-end data flow**: Verified Supabase → FastAPI → React → Recharts.
- **Responsive behavior**: Tested across 320px, 375px, 390px, 430px, 768px, 820px, 1024px, 1280px, and 1440px.
- **Evaluation workflow**: Valid AI output accepted, invalid output rejected, provider failures handled gracefully.
- **Persistence**: Evaluations survive page refresh.

## Known Limitations

I want to be honest about what remains outside the MVP:

1. **Authentication intentionally omitted** — No user login or role-based access.
2. **Demo/synthetic data** — Seeded data, not real customer information.
3. **No automated test suite** — Backend and frontend test frameworks were not configured.
4. **Settings page is a placeholder** — Intentional scope decision.
5. **Bundle size** — Frontend build produces a single large JS chunk. Code splitting was deferred.
6. **AI provider dependency** — Evaluation requires a valid `OPENAI_API_KEY` for live execution. Without it, mock data is returned.
7. **No evaluation versioning** — Re-evaluating a call replaces the existing result.
8. **Transcript truncation** — Transcripts are truncated to 12,000 characters before AI submission.

## What I Would Build Next

If this MVP moved into a next development phase, my priorities would be:

1. **Authentication and authorization** — Real users, roles, and permissions. Managers see all; coaches see only their own.
2. **Evaluation versioning** — Track evaluation history so re-evaluations don't overwrite previous results.
3. **Human review workflow** — Allow managers to flag, annotate, or override AI evaluations.
4. **Real transcript integration** — Connect to actual recording services instead of seeded data.
5. **Coach performance dashboards** — Historical trends, comparison views, and actionable insights for individual coaches.
6. **Better error handling** — Retry logic for AI failures, progress indicators for long evaluations, cancel button for in-flight requests.
7. **Database migrations** — Replace `create_all` with Alembic for safe schema evolution.
8. **Automated tests** — Backend unit tests, frontend component tests, and end-to-end integration tests.
9. **Rubric editor** — Allow the 12 dimensions and scoring rules to be edited without code changes.
10. **Evaluation comparison** — Side-by-side view of two evaluations for the same call.

## Reviewer Questions

### From Ruben Davoli, Founder & CEO

**"Why this MVP scope?"**

I mapped every feature to the core user journey. If it didn't directly serve "find call → evaluate → understand performance," I cut or deferred it. Coach and client management exist because the evaluation needs context. Analytics exists because managers need aggregate views. Everything outside that loop was cut.

**"What did you deliberately leave out?"**

Authentication, real transcript integration, evaluation versioning, PDF export, and streaming evaluation. None of those are needed to demonstrate the core AI evaluation workflow. Adding them would have increased complexity without proving the central hypothesis.

**"What would you build next?"**

Authentication, evaluation history with versioning, human review workflow, and coach performance dashboards with trend analysis.

**"What is the actual user value?"**

A coaching manager can evaluate a call in under a minute instead of spending 20–30 minutes reading and scoring transcripts manually. The value is consistency and scale — the AI applies the same 12-dimension rubric every time.

**"How would you measure whether this product is successful?"**

Adoption rate among managers, evaluation completion rate, and correlation between evaluation feedback and coach performance improvement over time.

**"What would you change if you had another week?"**

Authentication, evaluation versioning, better error handling with retries, and a coach performance detail page.

**"How would this become a production product?"**

Add authentication, replace demo data with real integrations, implement evaluation versioning, add monitoring, and harden the AI validation.

**"How did you prioritize under the time constraint?"**

I focused on the single workflow that demonstrates the most value. Coach CRUD was included because without it, the evaluation lacks context. Analytics was included because it proves the data is real and flowing.

**"What assumptions did you make?"**

That the 12-dimension rubric could be reasonably interpreted from the assessment description, that seeded data was acceptable, and that synchronous AI evaluation was sufficient for the MVP.

### From Luke Cala, Head of AI Solutions

**"How does the AI evaluation work?"**

The backend sends the call transcript, call type, and 12-dimension rubric to an OpenAI-compatible API. The model returns structured JSON, which is validated against a strict schema and persisted to the database.

**"What exactly are you sending to the model?"**

A system message setting the evaluation role, a user message containing the transcript (truncated to 12,000 characters), the call type, the 12 dimensions with descriptions, scoring rules, and the expected JSON structure.

**"Why is the AI call on the backend?"**

Because the OpenAI API key must never be exposed to the browser. Anything shipped to the client can be inspected. By keeping it server-side, only the backend can invoke the AI service.

**"How do you validate model output?"**

Pydantic models enforce exact structure: 12 dimensions, valid names, no duplicates, scores 1–5, and `overall_score` must equal the mean of dimension scores within a 0.02 tolerance.

**"What happens if the model returns malformed JSON?"**

The JSON parse fails, a RuntimeError is raised, the evaluation is not saved, and the frontend shows a friendly error message.

**"What happens if OpenAI is unavailable?"**

If `OPENAI_API_KEY` is not configured, the system returns a deterministic mock evaluation for demonstration. If the provider is configured but the request fails, the backend returns a 502 error with a friendly message.

**"How would you reduce hallucinations?"**

The prompt explicitly instructs the model to base scores only on transcript evidence and to state "Insufficient evidence in transcript" when evidence is lacking. Temperature is set to 0.2 for deterministic output.

**"How would you measure evaluation quality?"**

Compare AI evaluations against human expert evaluations on a sample of calls, track consistency across re-evaluations, and measure whether evaluation scores correlate with client outcomes.

**"How would you calibrate the rubric?"**

Run the AI evaluation against a set of calls that have been scored by human experts, compare the distributions, and adjust dimension descriptions or scoring guidance based on discrepancies.

**"How would you handle different call types?"**

The current implementation includes call-type-specific guidance in the AI prompt. Sales calls focus on discovery and communication quality. Kick-off calls focus on connection and goal clarity. Coaching calls focus on listening and frameworks. Strategic reviews focus on diagnostics and accountability.

**"How would you control AI costs?"**

Use a fast, inexpensive model, truncate transcripts to 12,000 characters, and cache evaluation results so the same call isn't re-evaluated unnecessarily.

**"What was the hardest part?"**

Getting the structured output to be reliable and the validation to catch all the edge cases. LLMs don't always return valid JSON, even with `response_format: json_object`. The validation layer had to be defensive without being overly complex.
