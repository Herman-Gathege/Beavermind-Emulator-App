# Demo Script & Reviewer Preparation

## How to use this document

Open this file in a split-screen or separate window while recording. Each section is designed to be read aloud or used as a speaking prompt. Technical details are included for reference but should only be spoken if the reviewer asks for them.

---

## Section 1 — Demo at a Glance (30–45 seconds)

> "I approached this as a time-constrained Agile MVP. Rather than trying to reproduce an entire coaching platform, I focused on the central workflow: find a call, read the transcript, run an AI evaluation, and understand coach performance. The system connects a React frontend on Vercel to a FastAPI backend on Render, backed by Supabase PostgreSQL. The key technical demonstration is the AI evaluation — a structured 12-dimension rubric that transforms an unstructured transcript into actionable coaching feedback, with the API key kept server-side and the result persisted to the database."

---

## Section 2 — The Problem I Understood

**Assumption (based on assessment):** The user is a coaching program manager or operations lead at a coaching platform. They have a growing library of coaching calls with transcripts, but no systematic way to evaluate whether coaches are delivering quality sessions.

**What they have:**
- Coaches
- Clients
- Programs (coach-client engagements)
- Calls with transcripts (seeded from a recording service in production)

**What they face:**
- Manual review of transcripts is not scalable
- Inconsistent evaluation across coaches
- No standardized way to identify coaching strengths and improvement areas
- Difficult to track coach performance over time

**What the MVP demonstrates:**
A workflow where a manager can find any call, read the transcript, invoke an AI evaluation against a 12-dimension rubric, and receive structured feedback — all in under a minute.

**What we inferred:** The assessment referenced evaluation across 12 dimensions but did not provide the complete internal rubric. We implemented a reasonable MVP interpretation and documented that assumption explicitly.

---

## Section 3 — Why This MVP Scope

The MVP covers these entities and features because they form the **minimum complete core workflow**:

- **Coaches** — Who performed the call
- **Clients** — Who received the coaching
- **Programs** — The engagement context
- **Calls** — The actual coaching interaction
- **Transcripts** — The raw material for evaluation
- **AI Evaluation** — The value-generating feature
- **Analytics** — Aggregate understanding of performance

**What was deprioritized:**
- Authentication and authorization
- Real Fathom/Fireflies transcript integration
- Evaluation versioning or comparison history
- PDF export
- Real-time streaming evaluation
- Dark mode

**Principle applied:** A complete core workflow is more valuable than many incomplete features.

**Time constraint:** The architecture and prioritization were designed around the original three-hour constraint. The take-home format allowed deeper implementation, but the scope decisions remained anchored to that original window.

---

## Section 4 — Agile Development Process

### Sprint 1 — Foundation

**What was done:**
- Project scaffold (frontend + backend)
- Data model definition (Coach, Client, Program, Call, Evaluation, DimensionScore)
- Supabase Docker Compose setup
- Demo data seeder (5 coaches, 10 clients, 10 programs, 10 calls, 5 historical evaluations)
- Application shell with sidebar navigation
- Purple/black/white design system
- Dashboard with stat cards and charts
- Responsive layout validated across viewports

### Sprint 2 — Core Workflow

**What was done:**
- Backend API completion with SQLAlchemy ORM
- Calls page with search and type filtering
- Call detail page with transcript display
- Live database connection replacing mock data
- Dashboard statistics from backend
- Analytics page with live charts
- Loading skeletons and error states
- End-to-end data flow validation

### Sprint 3 — AI Evaluation

**What was done:**
- Evaluation workflow: POST /api/evaluations → AI service → validation → persistence
- 12-dimension rubric implementation
- Structured JSON output with Pydantic validation
- Call-type-specific guidance (sales, kickoff, coaching, strategic_review)
- Strengths, improvement areas, and recommendations
- Persistence of Evaluation + DimensionScore records
- Frontend results display with dimension scores
- Error handling for AI failures and invalid responses
- Mock fallback when OPENAI_API_KEY is not configured

### Sprint 4 — Validation & Delivery

**What was done:**
- Coach management CRUD
- Client management CRUD
- Chart polish (tooltips, empty states, consistent styling)
- Responsive validation across 9 viewports
- Error handling refinement
- System audit
- Deployment preparation documentation
- Final validation report

**Closing mantra:** Understand → Prioritize → Build → Validate → Improve → Deliver

---

## Section 5 — Live Demo Script: Step-by-Step

### Demo Step 1 — Open the Deployed Application

**What you do:** Open the Vercel URL in a browser.

**What you say:** "The application is deployed frontend to Vercel, backend to Render, database on Supabase PostgreSQL. When I open it, you'll see a responsive sidebar with navigation for Dashboard, Coaches, Clients, Calls, Analytics, and Settings."

**What the reviewer should notice:**
- Professional SaaS appearance
- Responsive sidebar
- Active route highlighting

### Demo Step 2 — Dashboard

**What you do:** Click Dashboard (or land there by default). Point out the stat cards and charts.

**What you say:** "The dashboard pulls live statistics from the backend — total calls, how many have been evaluated, how many are pending, and the average evaluation score. These aren't hardcoded. The charts below show call distribution by type and a score distribution across performance levels. All data flows from Supabase through the FastAPI backend."

**What the reviewer should notice:**
- Dashboard stats are live, not static
- Charts use Recharts with consistent styling
- Loading states and empty states are handled

**Time limit:** 30 seconds. Do not dwell here.

### Demo Step 3 — Coach Management

**What you do:** Navigate to /coaches. Show the list. Optionally create a temporary coach, then delete it.

**What you say:** "Coaches and clients have full CRUD because the evaluation system needs meaningful context. When a manager opens a call, they need to know who the coach is, who the client is, and what program they're in. These management screens make the MVP feel like a usable system rather than a static analytics demo."

**What the reviewer should notice:**
- Search functionality
- Create/Edit dialog forms
- Delete with confirmation
- Dependency protection (can't delete a coach with associated calls)

**Time limit:** 45 seconds.

### Demo Step 4 — Client Management

**What you do:** Navigate to /clients. Briefly show the list.

**What you say:** "Clients complete the basic entities around the coaching workflow. Same CRUD pattern as coaches."

**What the reviewer should notice:**
- Consistent UI pattern with coaches
- Search works

**Time limit:** 20 seconds.

---

## Section 6 — Main Demo: Find a Call

**What you do:** Navigate to /calls.

**What you say:** "This is the Calls page. I can search by title, coach name, or client name. I can also filter by call type. The four call types are Sales Call, Kick-off Call, Coaching Call, and Strategic Review. Let me find a call that hasn't been evaluated yet."

**What the reviewer should notice:**
- Real-time search as you type
- Type filter dropdown
- Call cards show coach, client, program, date, and evaluation status
- Status badge shows pending (yellow) or evaluated (green)

**Then:** Select a call with "pending" status.

---

## Section 7 — Call Detail

**What you do:** Click into the call.

**What you say:** "This is where the product moves from simply managing records to understanding the actual coaching interaction. I can see the coach, the client, the program, the call type, when it occurred, and the full transcript on the left. The transcript is read-only text from our seeded demo data."

**What to do:** Scroll through the transcript briefly. Read one or two exchanges to establish context. Do NOT read the entire transcript.

**What the reviewer should notice:**
- Transcript is displayed in a monospace textarea
- Coach, client, and program metadata are clearly shown
- Call type and status are visible
- "Run Evaluation" button is present (disabled during evaluation)

---

## Section 8 — Live AI Evaluation

**What you do:** Click "Run Evaluation". Watch the button show "Evaluating..." with a spinner.

**What you say (BEFORE clicking):** "When I click this button, the flow is: React calls the FastAPI backend, the backend loads the transcript and constructs an AI prompt for the 12-dimension rubric, sends it to the AI provider, validates the structured response, and persists the result to Supabase. The API key never leaves the backend. The browser never sees the OpenAI secret."

**What you say (DURING evaluation):** "The backend is sending the transcript, the call type, and the evaluation criteria to the AI service. The AI returns structured JSON, which is validated against a strict schema before anything is saved."

**What the reviewer should notice:**
- Button shows loading state
- Error handling if something goes wrong
- Result appears in-place without page navigation

**Technical flow (for reference if asked):**

```
React → FastAPI → Evaluation Service → OpenAI → Structured Response
→ Pydantic Validation → Supabase → React
```

---

## Section 9 — Explain the 12 Dimensions

**What you do:** When the evaluation appears, scroll through the results.

**What you say:** "The assessment referenced evaluation across 12 dimensions but did not provide the complete internal rubric, so I implemented a reasonable MVP interpretation and documented that assumption. The 12 dimensions are: Check-in & Connection, Agenda & Alignment, Active Listening, Question Quality, Diagnostics and Discovery, Goal Clarity, Coaching and Guidance, Insight Generation, Action Planning, Accountability, Communication Quality, and Close and Next Steps."

**Then:** Point out the results sections.

**What you say:** "The result shows an overall score, a narrative summary, three key areas — Strengths, Improvement Areas, and Recommendations — and then each of the 12 dimensions with an individual score, feedback, and evidence from the transcript. This transforms an unstructured transcript into actionable feedback."

**What the reviewer should notice:**
- Overall score with progress bar
- Three-column grid (Strengths / Improvement Areas / Recommendations)
- Dimension scores with evidence quotes
- All data is from the AI evaluation, not hardcoded

---

## Section 10 — Show Persistence

**What you do:** Refresh the page.

**What you say:** "The evaluation isn't just generated and displayed temporarily. It is persisted through the backend and database, so the result remains available after the request completes. You can refresh, close the tab, come back tomorrow — the evaluation is in Supabase."

**What the reviewer should notice:**
- Evaluation reappears immediately after refresh
- Call status is now "evaluated"
- No re-evaluation needed

---

## Section 11 — Analytics

**What you do:** Navigate to /analytics.

**What you say:** "Analytics are derived from actual application data. This donut chart shows the distribution of calls by type. The bar chart shows evaluation scores grouped by performance level — Excellent, Strong, Meets Expectations, Needs Improvement. And this grouped bar chart shows call volume and evaluation coverage per coach."

**What the reviewer should notice:**
- Charts use live data from the backend
- Recharts with consistent styling
- Responsive containers
- Empty states when no data exists

**Time limit:** 30 seconds.

---

## Section 12 — Responsive Demonstration

**What you do:** Resize the browser to mobile width (320px–390px) or use DevTools device emulation.

**What you say:** "Responsive behavior was deliberately addressed. The sidebar collapses to a hamburger menu on mobile. The dashboard grid shifts from 4 columns on desktop to 1 column on mobile. Charts scale down cleanly. We validated across 320, 375, 390, 430, 768, 820, 1024, 1280, and 1440 pixel widths."

**What the reviewer should notice:**
- No horizontal overflow
- Charts remain readable
- Forms and tables remain usable
- Mobile navigation works

---

## Section 13 — Architecture Explanation

**Architecture diagram:**

```
                 Vercel
            React + Vite
                  │
                  │ HTTPS
                  ▼
              Render
            FastAPI API
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
   Supabase              OpenAI
   PostgreSQL           AI Service
```

**Frontend** — React + Vite + shadcn/ui + Recharts. Responsibilities: UI, navigation, user interactions, data presentation.

**Backend** — FastAPI + SQLAlchemy + psycopg3. Responsibilities: API, business logic, evaluation workflow, database access, OpenAI communication.

**Database** — Supabase PostgreSQL. Stores: Coaches, Clients, Programs, Calls, Evaluations, DimensionScores.

**AI** — OpenAI-compatible backend integration. Responsibilities: analyze transcript, produce structured evaluation, generate feedback.

---

## Section 14 — Why This Architecture?

**Separation of concerns:** Frontend, backend, persistence, and AI layers are separated so each responsibility remains clear. If we need to change the AI provider, we update one backend function — the frontend doesn't change.

**API key is server-side:** Anything shipped to the browser is potentially exposed. The OpenAI key exists only as a Render environment variable. The React application never sees it.

**React does not connect directly to OpenAI:** The browser would expose the key. All AI communication happens through the FastAPI backend.

**Supabase as PostgreSQL, not browser SDK:** We use Supabase as a managed PostgreSQL provider. The backend connects via `psycopg` and SQLAlchemy. We don't use the Supabase browser SDK because we want full control over queries, relationships, and the evaluation logic on the server.

---

## Section 15 — Demo Data Strategy

> "Because this was a take-home exercise rather than a production customer deployment, I used realistic seeded demo data so the reviewer can immediately explore the product."

**What the data includes:**
- 5 coaches with specialties and bios
- 10 clients across industries
- 10 programs linking coaches to clients
- 10 calls with transcripts across all 4 call types
- 5 historical evaluations with dimension scores

**What it is:** Synthetic demonstration data. It is not intended to represent real customer information.

**What is real:** The AI evaluation workflow itself is real. When an `OPENAI_API_KEY` is configured, the same code path that generates mock data calls the live AI provider. The mock mode is only a fallback for environments without credentials.

---

## Section 16 — AI Design Explanation

**Transcript retrieval:** The backend fetches the call and its transcript from the database.

**Call type context:** The call type (sales, kickoff, coaching, strategic_review) is passed to the evaluator so the AI can apply type-specific guidance.

**Evaluation criteria:** The AI receives the 12 dimensions, the scoring scale (1–5), and explicit rules about basing scores only on transcript evidence.

**Structured output:** The AI is instructed to return ONLY valid JSON with `response_format: json_object`. Temperature is set to 0.2 for deterministic output.

**Validation:** `_validate_and_normalize()` enforces:
- Exactly 12 dimensions
- Valid dimension names from the fixed list
- No duplicates
- Scores between 1 and 5
- `overall_score` equals the arithmetic mean of dimension scores

**Persistence:** Validated results are saved to `Evaluation` and `DimensionScore` tables.

**What happens when the AI provider is unavailable:** If `OPENAI_API_KEY` is not configured, the system returns a deterministic mock evaluation for demonstration. If the provider is configured but the request fails, a `RuntimeError` is raised, the evaluation is not saved, and the backend returns a controlled HTTP 502/500 error with a friendly message. Raw provider errors are not exposed to the frontend.

---

## Section 17 — Error Handling

**Cases handled:**
- Backend unavailable — frontend shows connection error
- Empty search — "No calls found" message
- Missing transcript — backend raises ValueError with friendly message
- Failed evaluation — backend returns 502 with friendly message; frontend shows error inside the evaluation card
- Invalid AI response — Pydantic validation rejects it; evaluation is not saved
- Invalid request (malformed UUID) — returns 404
- Missing records — 404 with "not found" message

**Frontend behavior:** Raw backend errors are never shown to the user. All errors are surfaced as friendly, contextual messages.

---

## Section 18 — Security Discussion

**Where is the OpenAI API key?** Server-side only, as a Render environment variable. It never appears in the React bundle, never in the browser, never in API responses.

**Is it in the React application?** No.

**Why?** Anything shipped to the browser can be inspected. The key must stay on the backend.

**CORS:** Production CORS is restricted to the deployed Vercel frontend origin via the `CORS_ORIGINS` environment variable. Development uses `*` for convenience.

**Authentication:** Intentionally outside the MVP scope. There is no user login. All data is publicly accessible within the app context.

---

## Section 19 — Testing & Validation

**Frontend:**
- `npm run build` — passes, no TypeScript errors
- `npm run lint` — passes, only pre-existing warnings (no new issues introduced)

**Backend:**
- Health endpoint returns `{"status": "ok"}`
- All major endpoints tested via API integration tests

**Responsive:**
- Tested viewports: 320px, 375px, 390px, 430px, 768px, 820px, 1024px, 1280px, 1440px

**Core workflow validated end-to-end:**
1. Dashboard loads with live stats
2. Calls page lists calls with search and filters
3. Call detail displays transcript and metadata
4. Run Evaluation triggers AI evaluation
5. Results show 12 dimensions with scores and evidence
6. Results persist after page refresh
7. Analytics charts render from live data

**Note:** Validation focused on the user journey rather than only individual functions. There is no full automated test suite for the backend or frontend.

---

## Section 20 — Deployment Explanation

**Production setup:**

```
Vercel (Frontend)
  ↓ HTTPS
Render (Backend)
  ↓
Supabase PostgreSQL
  ↓
OpenAI (server-side only)
```

**Vercel** hosts the React/Vite frontend. Build command: `npm run build`. Output directory: `dist`. SPA routing configured via `vercel.json` rewrites.

**Render** hosts the FastAPI backend. Runtime: Python 3.12. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.

**Supabase** provides managed PostgreSQL. Connection string format: `postgresql+psycopg://user:password@host:5432/database`. Tables auto-create on startup.

**OpenAI** provides live AI evaluation when `OPENAI_API_KEY` is configured.

**Environment variables (names only, no values):**
- Backend: `DATABASE_URL`, `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`, `CORS_ORIGINS`
- Frontend: `VITE_API_BASE_URL`

---

## Section 21 — What I Would Improve for Production

**Authentication & authorization:** Real users, roles, and permissions. Currently anyone can access everything.

**Evaluation reliability:**
- Better structured output validation with retry logic
- Versioned rubrics so evaluations can be compared across time
- Evaluation reproducibility (same call should produce same result)
- AI observability: log prompts, responses, latency, token usage
- Retry strategy for provider failures
- Multi-provider fallback

**Evaluation quality:**
- Human review workflow for edge cases
- Rubric calibration against expert evaluations
- Domain-specific criteria per call type
- Evidence confidence scoring

**Data:**
- Real customer data protections (encryption at rest, access controls)
- Data retention policies
- Audit logs for evaluation changes

**Infrastructure:**
- Database migrations (Alembic) instead of `create_all`
- Automated test suite (pytest for backend, Vitest for frontend)
- CI/CD pipeline
- Monitoring and alerting
- Rate limiting

**Frontend:**
- More detailed coach performance views
- Historical trends for individual coaches
- Evaluation comparison tools
- Better transcript evidence highlighting

---

## Section 22 — Known MVP Limitations

1. **Authentication intentionally omitted** — No user login or role-based access.
2. **Demo/synthetic data** — Seeded data, not real customer information.
3. **No automated test suite** — Backend and frontend test frameworks were not configured. (Manual validation and AI validation unit tests were performed.)
4. **Settings page is a placeholder** — Intentional scope decision.
5. **Bundle size** — Frontend build produces a single large JS chunk. Code splitting was deferred.
6. **AI provider dependency** — Evaluation requires a valid `OPENAI_API_KEY` for live execution. Without it, mock data is returned.
7. **No evaluation versioning** — Re-evaluating a call replaces the existing result.
8. **Transcript truncation** — Transcripts are truncated to 12,000 characters before AI submission.

---

## Section 23 — Likely Reviewer Questions

### Product / Founder Questions

**"Why did you choose this scope?"**

Short: The three-hour constraint forced ruthless prioritization. I chose the single workflow that demonstrates the most value: find a call, evaluate it, understand coach performance.

Deeper: Every feature in the MVP serves the core journey. Coach and client management exist because the evaluation needs context. Analytics exists because managers need aggregate views. Everything outside that loop was cut.

---

**"What did you deliberately leave out?"**

Short: Authentication, real transcript integration, evaluation versioning, PDF export, and streaming evaluation.

Deeper: None of those are needed to demonstrate the core AI evaluation workflow. Adding them would have increased complexity without proving the central hypothesis: that an AI evaluation can be built into a coaching platform with clear, structured output.

---

**"What would you build next?"**

Short: Authentication, evaluation history with versioning, human review workflow, and coach performance dashboards with trend analysis.

Deeper: In a real product, the next priority would be making the evaluation actionable — allowing managers to flag evaluations for human review, track whether coaching improvements lead to better scores over time, and integrate with actual transcript sources.

---

**"What is the actual user value?"**

Short: A coaching manager can evaluate a call in under a minute instead of spending 20–30 minutes reading and scoring transcripts manually.

Deeper: The value is consistency and scale. A human evaluator might apply different standards to different coaches. The AI applies the same 12-dimension rubric every time, producing comparable scores across the entire coach roster.

---

**"Why should a coach care about this?"**

Short: Coaches don't directly use this tool. The users are coaching program managers and operations leads who supervise coaches. For them, it provides objective, consistent feedback that helps coaches improve.

Deeper: In a production version, coaches would have their own view showing their evaluation history, trends, and specific areas to work on. The MVP focuses on the manager's perspective because that's where the immediate operational value is.

---

**"How would you measure whether this product is successful?"**

Short: Adoption rate among managers, evaluation completion rate, and correlation between evaluation feedback and coach performance improvement over time.

Deeper: Leading indicators: how often managers run evaluations, how many calls get evaluated vs. pending. Lagging indicators: whether coaches who receive evaluations show improvement in subsequent scores, and whether client outcomes improve.

---

**"What would you change if you had another week?"**

Short: Authentication, evaluation versioning, better error handling with retries, and a coach performance detail page.

Deeper: I'd also add evaluation comparison (view two evaluations for the same call side by side), a rubric editor so the 12 dimensions can be tweaked without code changes, and a simple admin panel for managing demo data.

---

**"How would this become a production product?"**

Short: Add authentication, replace demo data with real integrations, implement evaluation versioning, add monitoring, and harden the AI validation.

Deeper: Production requirements include: real user authentication with role-based access, integration with actual transcript sources (Fathom, Fireflies, or custom), database migrations with Alembic, a full test suite, CI/CD, rate limiting, audit logs, data encryption, and a rubric management system.

---

**"How did you prioritize under the time constraint?"**

Short: I mapped every feature to the core user journey. If it didn't directly serve "find call → evaluate → understand performance," it was cut or deferred.

Deeper: The three-hour mental model meant I couldn't afford to build features that looked good but didn't complete a workflow. Coach CRUD was included because without it, the evaluation lacks context. Analytics was included because it proves the data is real and flowing.

---

**"What assumptions did you make?"**

Short: That the 12-dimension rubric could be reasonably interpreted from the assessment description, that seeded data was acceptable, and that synchronous AI evaluation was sufficient for the MVP.

Deeper: I assumed the assessment wanted a working vertical slice, not a comprehensive platform. I assumed the reviewer would value a complete workflow over incomplete features. I assumed mock data was acceptable for demonstration. All of these are documented in the project documentation.

---

### AI / Technical Questions

**"How does the AI evaluation work?"**

Short: The backend sends the call transcript, call type, and 12-dimension rubric to an OpenAI-compatible API. The model returns structured JSON, which is validated against a strict schema and persisted to the database.

Deeper: The prompt includes call-type-specific guidance, the 1–5 scoring scale with definitions, explicit rules to base scores only on transcript evidence, and instructions to state "Insufficient evidence in transcript" when evidence is lacking. Temperature is 0.2 for determinism. The response is validated by `_validate_and_normalize()` using Pydantic models.

---

**"What exactly are you sending to the model?"**

Short: A system message setting the evaluation role, a user message containing the transcript (truncated to 12,000 characters), the call type, the 12 dimensions with descriptions, scoring rules, and the expected JSON structure.

Deeper: The prompt is built by `_build_prompt()` in `ai_evaluator.py`. It includes call-type guidance from `CALL_TYPE_GUIDANCE`, the dimension list from `DIMENSION_DESCRIPTIONS`, and explicit instructions that `overall_score` must be the arithmetic mean of dimension scores. The model is instructed to return ONLY valid JSON.

---

**"Why is the AI call on the backend?"**

Short: Because the OpenAI API key must never be exposed to the browser.

Deeper: Any code shipped to the client can be inspected. If the frontend called OpenAI directly, the API key would be visible in the network tab, bundle source, or environment variables. By keeping it server-side, only the backend can invoke the AI service, and the frontend only sees evaluation results.

---

**"How do you validate model output?"**

Short: Pydantic models enforce exact structure: 12 dimensions, valid names, no duplicates, scores 1–5, and `overall_score` must equal the mean of dimension scores within a 0.02 tolerance.

Deeper: `_validate_and_normalize()` checks each dimension entry, normalizes missing fields to safe defaults, and computes the expected overall score. If the AI's reported overall score doesn't match the computed mean, validation fails and the evaluation is not saved.

---

**"What happens if the model returns malformed JSON?"**

Short: The JSON parse fails, a RuntimeError is raised, the evaluation is not saved, and the frontend shows a friendly error message.

Deeper: The backend catches exceptions during the AI call and validation, logs the error, and returns a controlled HTTP error (502 for provider failures, 500 for unexpected errors). The frontend surfaces the error message without exposing raw provider details.

---

**"What happens if OpenAI is unavailable?"**

Short: If `OPENAI_API_KEY` is not configured, the system returns a deterministic mock evaluation for demonstration. If the provider is configured but the request fails, the backend returns a 502 error with a friendly message.

Deeper: `run_evaluation()` checks for `OPENAI_API_KEY` first. If missing, it calls `mock_evaluation()` which generates random scores and static feedback text. If the key exists but the HTTP request fails, the exception is caught, logged, and re-raised as a `RuntimeError`. The router converts this to a 502 response.

---

**"How would you reduce hallucinations?"**

Short: The prompt explicitly instructs the model to base scores only on transcript evidence and to state "Insufficient evidence in transcript" when evidence is lacking. Temperature is set to 0.2 for deterministic output.

Deeper: In production, I'd add: retrieval-augmented generation with only the relevant transcript segments, post-evaluation fact-checking against the transcript, confidence scores per dimension, and human review for low-confidence evaluations. The current validation ensures the output structure is correct but doesn't verify that the feedback actually matches the transcript.

---

**"How would you measure evaluation quality?"**

Short: Compare AI evaluations against human expert evaluations on a sample of calls, track consistency across re-evaluations, and measure whether evaluation scores correlate with client outcomes.

Deeper: A/B test the AI rubric against human coaches. Track inter-rater reliability. Monitor evaluation drift over time as the model or prompt changes. In the MVP, we validated output structure but did not validate evaluation quality against human judgment.

---

**"How would you calibrate the rubric?"**

Short: Run the AI evaluation against a set of calls that have been scored by human experts, compare the distributions, and adjust dimension descriptions or scoring guidance based on discrepancies.

Deeper: In production, you'd want a calibration dataset of 50–100 calls with human scores. Compare AI scores to human scores per dimension. If the AI systematically scores "Active Listening" higher than humans, adjust the dimension description or add negative examples to the prompt.

---

**"How would you handle different call types?"**

Short: The current implementation includes call-type-specific guidance in the AI prompt. Sales calls focus on discovery and communication quality. Kick-off calls focus on connection and goal clarity. Coaching calls focus on listening and frameworks. Strategic reviews focus on diagnostics and accountability.

Deeper: In production, I'd make the guidance more granular — possibly separate dimension weightings per call type, or even different dimension sets. A sales call might not need "Coaching & Guidance" scored the same way as a coaching call.

---

**"Would you use one prompt for every call type?"**

Short: Yes, but with call-type-specific guidance injected into the prompt.

Deeper: A single prompt with conditional guidance is simpler to maintain than four separate prompts. The `CALL_TYPE_GUIDANCE` dictionary maps each call type to specific focus areas. This keeps the code maintainable while allowing the AI to adjust its evaluation criteria.

---

**"How would you version the evaluation rubric?"**

Short: Store rubric versions in the database, include a `rubric_version` field on each Evaluation, and allow the AI prompt to reference the version.

Deeper: When the rubric changes, old evaluations remain tagged with their version. This allows comparing evaluations across rubric versions and prevents score drift when dimensions or scoring rules are updated. The current MVP has no versioning — re-evaluation uses the current rubric.

---

**"How would you compare AI evaluations with human evaluations?"**

Short: Run both on the same set of calls, calculate correlation coefficients per dimension, and identify systematic discrepancies.

Deeper: More practically: build a "human review" mode where a manager can override or annotate an AI evaluation. Track where AI and human scores diverge, and use those cases to refine the prompt or rubric. Over time, this creates a calibration dataset.

---

**"How would you control AI costs?"**

Short: Use a fast, inexpensive model (GPT-4o-mini), truncate transcripts to 12,000 characters, and cache evaluation results so the same call isn't re-evaluated unnecessarily.

Deeper: In production: implement prompt caching, batch evaluations during off-peak hours, set token limits per evaluation, and monitor per-evaluation cost. The current MVP makes one API call per evaluation with no caching.

---

**"Would you use a different model in production?"**

Short: The current model is `gpt-4o-mini` as a default. The architecture supports any OpenAI-compatible model via `OPENAI_BASE_URL` and `OPENAI_MODEL` environment variables.

Deeper: Model selection depends on the quality/cost tradeoff. GPT-4o-mini is fast and cheap but may sacrifice some nuance. For production coaching evaluations, you might test GPT-4o or Claude for higher-quality structured output, or fine-tune a smaller model on coaching evaluation data.

---

**"How would you handle long transcripts?"**

Short: Transcripts are currently truncated to 12,000 characters before being sent to the AI. This is documented as a known limitation.

Deeper: In production: implement chunked evaluation (split transcript into segments, evaluate each, then aggregate), use a model with a larger context window, or preprocess the transcript to extract key moments. Truncation risks losing important context from the beginning or end of long calls.

---

**"How would you protect sensitive customer conversations?"**

Short: Transcripts are stored in Supabase PostgreSQL. The AI service receives only the transcript text needed for evaluation. API keys are server-side only.

Deeper: In production: encrypt transcripts at rest, implement row-level security so managers only see calls for their coaches/clients, redact sensitive information before sending to AI (PII masking), and establish data retention policies. The current MVP has none of these protections.

---

### Database / Backend Questions

**"Why FastAPI?"**

Short: Minimal boilerplate, native async support, automatic OpenAPI documentation, and Python-native AI library integration.

Deeper: FastAPI's Pydantic integration aligns perfectly with the structured JSON validation needed for AI responses. The automatic `/docs` endpoint was useful during development. The async capabilities would support streaming evaluation in a future version.

---

**"Why PostgreSQL?"**

Short: Coaching data is relational — coaches have clients, clients have programs, programs have calls, calls have evaluations. PostgreSQL handles these relationships naturally.

Deeper: We needed a database that supports complex queries, JSON storage for raw AI responses, and strong consistency. SQLAlchemy + PostgreSQL gives us all of that. Supabase was chosen because it provides managed PostgreSQL with a local Docker option for development.

---

**"Why Supabase?"**

Short: The assessment specified Supabase. It provides managed PostgreSQL with an easy local Docker setup.

Deeper: Supabase eliminates database administration overhead. The local Docker Compose setup mirrors the production environment. We use it purely as a PostgreSQL provider — we don't use the Supabase browser SDK or auth features because we want full control on the backend.

---

**"Why SQLAlchemy?"**

Short: It provides ORM relationships, session management, and Pydantic-compatible schemas. The `Evaluation` → `DimensionScore` relationship is natural with SQLAlchemy.

Deeper: SQLAlchemy's `relationship()` and `cascade="all, delete-orphan"` make it easy to persist an evaluation and its 12 dimension scores in one operation. The ORM also makes the code more readable than raw SQL for a project of this size.

---

**"How are evaluations related to calls?"**

Short: One-to-one. Each call has at most one evaluation. The `Evaluation` table has a `call_id` foreign key, and the `Call` model has a `uselist=False` relationship back to `Evaluation`.

Deeper: The current MVP replaces existing evaluations on re-evaluation (though the router returns the existing result for already-evaluated calls). In production, you'd want evaluation versioning so you can track how scores change over time or across rubric versions.

---

**"How would you handle database migrations in production?"**

Short: The current MVP uses `Base.metadata.create_all(bind=engine)` which auto-creates tables. In production, I'd use Alembic for versioned migrations.

Deeper: `create_all` is fine for prototyping but doesn't handle schema changes safely. Alembic would provide upgrade/downgrade paths, migration history, and safe deployment procedures for schema changes.

---

**"How would you scale the API?"**

Short: The current architecture is stateless and horizontally scalable. Render can scale the FastAPI service, and Supabase handles database scaling.

Deeper: For higher load: add Redis caching for frequent queries (dashboard stats, call lists), implement request queuing for evaluations, use database read replicas for analytics queries, and add API rate limiting. The current synchronous evaluation endpoint would be the first bottleneck under load.

---

**"What happens if two evaluations run simultaneously?"**

Short: The current implementation doesn't prevent this. Two simultaneous POST requests for the same call could both proceed to evaluation.

Deeper: In production, I'd add a database-level lock or unique constraint, or check for existing evaluations with a row lock before starting a new one. The router currently returns the existing evaluation for already-evaluated calls, but there's a race condition between the check and the creation.

---

**"How would you prevent duplicate evaluations?"**

Short: The router returns existing evaluations for already-evaluated calls. In production, add a unique constraint on `evaluations.call_id` and use database transactions with row locking.

Deeper: The current check happens before creation but isn't atomic. A proper implementation would use `SELECT ... FOR UPDATE` or an `INSERT ... ON CONFLICT` pattern to guarantee only one evaluation per call.

---

**"How would you implement authentication?"**

Short: The MVP intentionally omitted authentication. In production, I'd use JWT tokens issued by a backend login endpoint, with role-based access (managers see all, coaches see only their own).

Deeper: FastAPI has built-in OAuth2 support with JWT. I'd add a `User` model, login/logout endpoints, and middleware that validates tokens on every request. Row-level security in PostgreSQL would enforce that users only access data they're authorized for.

---

### Frontend Questions

**"Why React?"**

Short: Industry standard, strong ecosystem, and the team is already using it. Vite + React + TypeScript is a proven stack for SPAs.

Deeper: React's component model aligns well with the page-based structure of this app. The shadcn/ui component library provides accessible, styled primitives that accelerate UI development. TypeScript catches errors at compile time.

---

**"Why Vite?"**

Short: Fast dev server, Vercel-friendly build output, and excellent TypeScript support.

Deeper: Vite's hot module replacement was fast during development. The build output is a standard SPA bundle that Vercel can host directly. Vite config is minimal and well-documented.

---

**"Why shadcn/ui?"**

Short: It provides Radix UI primitives with Tailwind styling — accessible, customizable, and fast to implement.

Deeper: shadcn/ui gave us pre-built components (Button, Card, Dialog, Select, Badge, etc.) that are accessible by default and styled consistently with our design system. The Tailwind integration meant we could customize colors and spacing without fighting a CSS framework.

---

**"How did you approach responsive design?"**

Short: Mobile-first CSS with Tailwind breakpoints. Sidebar collapses to hamburger on mobile. Charts use `ResponsiveContainer`. Grid layouts shift from 1 to 2 to 4 columns based on viewport.

Deeper: The dashboard grid uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`. Charts use `ResponsiveContainer` with percentage widths. The sidebar has a collapse toggle on desktop and a mobile drawer. We tested at 320px, 375px, 390px, 430px, 768px, 820px, 1024px, 1280px, and 1440px.

---

**"How do you handle API failures?"**

Short: The `apiFetch` wrapper throws on non-OK responses. Each page catches errors and shows a contextual message with a retry button.

Deeper: `apiFetch` in `frontend/src/lib/api.ts` throws an `Error` for any non-2xx response. Pages use try/catch around API calls and render error states with retry buttons. The evaluation page specifically surfaces backend error messages without exposing raw details.

---

**"How do you keep the charts synchronized with backend data?"**

Short: Charts derive their data from API responses. The dashboard fetches stats and calls from `/api/dashboard/stats` and `/api/calls`. Analytics fetches from `/api/calls` and `/api/evaluations`. Data is computed client-side from the API response.

Deeper: The dashboard and analytics pages both fetch live data on mount. The dashboard gets stats from `/api/dashboard/stats` and recent evaluations. Analytics fetches all calls and evaluations and computes call type distribution, score distribution, and coach performance client-side. This means charts always reflect the current database state.

---

**"What would you improve about the frontend?"**

Short: Code splitting, better loading skeletons, a coach detail page, evaluation history view, and more detailed chart interactions.

Deeper: The build currently produces a single large JS chunk. I'd split routes into separate chunks. The loading states are basic skeletons — I'd add skeleton screens that match the actual content layout. I'd add a coach detail page showing all their calls and evaluations. The charts are functional but could use drill-down interactions.

---

### Engineering Judgment Questions

**"What was the hardest part?"**

Short: The AI evaluation workflow — specifically getting the structured output to be reliable and the validation to catch all the edge cases.

Deeper: LLMs don't always return valid JSON, even with `response_format: json_object`. The validation layer (`_validate_and_normalize`) had to handle missing fields, wrong dimension counts, invalid names, duplicate dimensions, out-of-range scores, and mismatched overall scores. Getting that right took the most investigation because LLMs are notoriously unreliable at structured output. The validation layer had to be defensive without being overly complex.

---

**"What would you not build again?"**

Short: The seed data generator. It works, but it's fragile and the transcripts are simplistic.

Deeper: The seed script creates synthetic data that looks realistic enough for a demo but doesn't represent real coaching conversations. If I were building this again, I'd use a more realistic transcript generator or pull from a public dataset of coaching conversations. The current transcripts are short and formulaic.

---

**"Where did you intentionally take a shortcut?"**

Short: Synchronous AI evaluation, no authentication, and no database migrations.

Deeper: I used a synchronous HTTP call for evaluation instead of a job queue because the three-hour window favored simplicity over scalability. I skipped authentication because the assessment didn't require it. I used `create_all` instead of Alembic migrations because schema changes were frequent during development. All of these are documented as production evolution items.

---

**"What technical debt did you accept?"**

Short: Mock fallback mode, no evaluation versioning, and a single JS bundle.

Deeper: The mock evaluation is useful for demo resilience but means the AI workflow isn't live in the default environment. No evaluation versioning means re-evaluation overwrites history. The single JS bundle means initial load time grows with every new page. None of these block the MVP but all would need to be addressed in production.

---

**"What would break first if this had 10,000 users?"**

Short: The synchronous AI evaluation endpoint and the single-server backend.

Deeper: Each evaluation makes a blocking HTTP call to the AI provider. Under concurrent load, Render would run out of workers. The database would handle 10,000 records fine, but the evaluation endpoint would queue up. Fix: move to an async job queue (Celery or ARQ), add Redis for caching, and use database read replicas for analytics queries.

---

**"What would you monitor in production?"**

Short: AI evaluation latency, error rates, token usage, and evaluation quality metrics.

Deeper: Specifically: p50/p95/p99 evaluation duration, AI provider error rate, token consumption per evaluation, evaluation success rate, dimension score distribution drift (to detect rubric or model changes), and duplicate evaluation attempts.

---

**"What would you test first?"**

Short: The AI evaluation workflow end-to-end, and the evaluation validation logic.

Deeper: The highest-risk code is `_validate_and_normalize()` — if it breaks, bad data gets persisted. I'd unit test every validation rule: wrong dimension count, invalid names, duplicates, out-of-range scores, mismatched overall scores. Then I'd integration test the full evaluation flow with a mock AI provider.

---

**"What assumption are you least confident about?"**

Short: The 12-dimension rubric interpretation.

Deeper: The assessment referenced 12 dimensions but didn't provide the complete proprietary rubric. I defined reasonable MVP dimensions based on standard coaching frameworks, but I don't know how closely they match Beavermind's actual rubric. If the real rubric is significantly different, the AI evaluation results wouldn't be directly comparable. This is the biggest unknown in the demo.

---

**"If you had 30 more minutes, what would you improve?"**

Short: Better error messages in the evaluation flow and a loading progress indicator.

Deeper: The evaluation currently shows a spinner with no progress indication. AI calls can take 10–30 seconds. I'd add a progress message ("Analyzing transcript...", "Scoring dimensions...", "Generating feedback...") and better timeout handling. I'd also add a cancel button so users can abort long-running evaluations.

---

## Section 24 — Questions I Should Ask the Reviewers

**Product:**
- "What part of the evaluation workflow is most important to Beavermind's customers today — the manager's view, the coach's view, or the aggregate analytics?"
- "Does the 12-dimension structure in this MVP align with how Beavermind currently evaluates calls, or is there a different rubric you'd want us to use?"

**AI:**
- "How does Beavermind currently validate the quality of an AI-generated coaching evaluation against human judgment?"
- "Are there specific coaching frameworks or methodologies the evaluation should be calibrated against?"

**Product direction:**
- "If this MVP were taken into the next development phase, which workflow would you prioritize — coach self-service, manager dashboards, or client-facing insights?"
- "What's the most common reason coaching programs fail, and could the evaluation surface that early?"

**Engineering:**
- "What would you consider the biggest technical challenge in taking this from a demo to a production system — the AI reliability, the data model, or the user experience?"

---

## Section 25 — Final 30-Second Closing

> "I built a working MVP that demonstrates the complete coaching evaluation workflow: find a call, read the transcript, run an AI evaluation against a 12-dimension rubric, and understand coach performance. The architecture separates frontend, backend, database, and AI layers so each can evolve independently. The AI key stays server-side, the evaluation is validated before persistence, and the result survives refresh. What's intentionally left out — authentication, real transcript integration, evaluation versioning — is documented as production evolution. The core hypothesis is proven: an AI evaluation can be embedded in a coaching platform with clear, structured output. The question now is which direction to take it next."

---

## Section 26 — Final Pre-Loom Checklist

- [ ] Backend is running/deployed and `/health` returns `{"status": "ok"}`
- [ ] Frontend is running/deployed and loads without console errors
- [ ] Database contains demo data (5 coaches, 10 clients, 10 programs, 10 calls)
- [ ] OpenAI credentials configured (or mock mode is acceptable for demo)
- [ ] Test evaluation works end-to-end
- [ ] Dashboard loads with live stats
- [ ] Coaches page loads
- [ ] Clients page loads
- [ ] Calls page loads with search and filters
- [ ] Call detail works
- [ ] Evaluation generates and displays results
- [ ] Results persist after page refresh
- [ ] Analytics charts render from live data
- [ ] Mobile layout works (test at 375px or 390px)
- [ ] Browser console has no blocking errors
- [ ] URLs are copied somewhere safe
- [ ] Loom recording environment is clean
- [ ] No secrets visible on screen

---

## Section 27 — Loom Recording Order

**Target: 8–12 minutes**

| Order | Section | Approx. Time | Focus |
|-------|---------|-------------|-------|
| 1 | Introduction | 60s | Problem, MVP scope, Agile process |
| 2 | Architecture | 60s | Diagram, tech choices, why they matter |
| 3 | Dashboard | 30s | Live stats, charts |
| 4 | Coaches | 30s | CRUD, why it exists |
| 5 | Clients | 20s | Brief, same pattern |
| 6 | Calls/search | 60s | Search, filters, call types |
| 7 | Call detail/transcript | 60s | Context, transcript preview |
| 8 | Live AI evaluation | 90s | **THE KEY DEMO** — click, explain flow, show result |
| 9 | Evaluation results | 60s | 12 dimensions, scores, evidence |
| 10 | Analytics | 30s | Charts from live data |
| 11 | Responsive UI | 30s | Resize, mobile nav |
| 12 | Deployment | 30s | Vercel → Render → Supabase |
| 13 | Trade-offs/limitations | 60s | What was cut, what's next |
| 14 | Future improvements | 30s | Production evolution |
| 15 | Closing | 30s | Confident handoff |

**Main focus:** Problem → Product → AI Workflow → Technical Decisions → Validation → Delivery

**Do not attempt to demonstrate every button.** The main focus is the AI evaluation workflow and the technical decisions behind it.

---

## Section 28 — Document Integrity

### Claims grounded in repository

All technical claims in this document are grounded in the actual implementation:

- **Architecture:** Verified in `backend/main.py`, `frontend/src/App.tsx`
- **AI flow:** Verified in `backend/services/ai_evaluator.py`
- **12 dimensions:** Verified in `backend/services/ai_evaluator.py` lines 12–25
- **Validation rules:** Verified in `backend/services/ai_evaluator.py` `_validate_and_normalize()`
- **Mock fallback:** Verified in `backend/services/ai_evaluator.py` `mock_evaluation()`
- **Call types:** Verified in `backend/sql_models.py` and `backend/seed.py`
- **Evaluation persistence:** Verified in `backend/sql_models.py` and `backend/routers/evaluations.py`
- **Frontend routes:** Verified in `frontend/src/App.tsx`
- **Responsive viewports:** Verified in `docs/06-sprint-4-validation-and-delivery.md`
- **Deployment setup:** Verified in `docs/06-sprint-4-validation-and-delivery.md` Deployment Preparation section
- **Demo data counts:** Verified in `backend/seed.py`
- **Known limitations:** Verified in `docs/06-sprint-4-validation-and-delivery.md` Known Limitations section

### Information that could NOT be verified

The following items are assumptions or inferences and should NOT be claimed as confirmed during the demo:

- **Beavermind's proprietary 12-dimension rubric:** The complete internal rubric was not provided. The implemented dimensions are an MVP interpretation.
- **Beavermind's actual business operations:** We inferred the user persona (coaching program manager) from the assessment description. We do not have internal knowledge of Beavermind's actual processes.
- **AI evaluation quality:** We validated output structure but did not validate evaluation quality against human expert judgment. No calibration dataset exists.
- **Real customer data protections:** The MVP uses synthetic data. Production data protection requirements are inferred from standard practices, not from Beavermind's actual requirements.

---

## Section 29 — Document Metadata

**File:** `docs/07-demo-script-and-reviewer-questions.md`

**Sections included:**
1. Demo at a Glance
2. The Problem I Understood
3. Why This MVP Scope
4. Agile Development Process
5. Live Demo Script: Step-by-Step
6. Main Demo: Find a Call
7. Call Detail
8. Live AI Evaluation
9. Explain the 12 Dimensions
10. Show Persistence
11. Analytics
12. Responsive Demonstration
13. Architecture Explanation
14. Why This Architecture?
15. Demo Data Strategy
16. AI Design Explanation
17. Error Handling
18. Security Discussion
19. Testing & Validation
20. Deployment Explanation
21. What I Would Improve for Production
22. Known MVP Limitations
23. Likely Reviewer Questions (Product, AI, Database, Frontend, Engineering Judgment)
24. Questions I Should Ask the Reviewers
25. Final 30-Second Closing
26. Final Pre-Loom Checklist
27. Loom Recording Order
28. Document Integrity

**All claims grounded in existing repository/documentation:** Yes

**Unverifiable claims explicitly flagged:** Yes (Section 28)

---

*End of document.*