# Project Discovery

## Assessment Context

We are building a **time-boxed MVP emulator** of a coaching-call evaluation workflow for the Beavermind AI Native Development Exercise. The goal is not to ship a production system, but to demonstrate a complete software development lifecycle: discovery, planning, implementation, and validation within approximately three hours.

The MVP covers one core user journey:
1. **Find a call** → search coaches, clients, programs
2. **Open the call** → view call metadata
3. **Review transcript** → read call transcript
4. **Run evaluation** → invoke AI evaluation against a 12-dimension rubric
5. **Review coach performance** → see dimension scores and summary

Because the complete proprietary Beavermind 12-dimension rubric is unavailable, the MVP will define a **reasonable interpretation** of dimensions and document that assumption explicitly.

## Repository Findings

The repository was inspected on `2026-08-20`. Findings:

- **Git state**: Uninitialized working tree with no commits. Branch `main` has no history.
- **Frontend**: Empty `frontend/` directory with placeholders (`public/`, `src/`). No React, Vite, or UI framework setup.
- **Backend**: Empty `backend/` directory with placeholders (`app/`, `tests/`). No Python, FastAPI, or API structure.
- **Database**: No schema, migrations, or Supabase configuration present.
- **Configuration**: No `package.json`, `requirements.txt`, `.env`, `docker-compose.yml`, or deployment configuration.
- **Documentation**: Empty `docs/` directory. No README.
- **Tests**: No test files or frameworks configured.

**Conclusion**: The repository is a blank scaffold. Nothing can be reused. All foundation code must be created in this milestone.

## Existing Technology

No existing technology stack was discovered. The stack will be introduced from scratch according to the assessment direction:

- **Frontend**: React (Vite + TypeScript)
- **UI**: shadcn/ui + TailwindCSS
- **Frontend deployment**: Vercel-ready build output
- **Backend**: Python (FastAPI)
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI-compatible structured evaluation (integrated into Python backend)
- **Local dev**: Docker Compose for Supabase

## Proposed MVP Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐
│   Browser   │────▶│  Vite/React  │────▶│  FastAPI API   │
│  (Vercel)   │◀────│  shadcn/ui   │◀────│  /api/*        │
└─────────────┘     └──────────────┘     └───────┬────────┘
                                                  │
                                                  ▼
                                         ┌────────────────┐
                                         │   Supabase     │
                                         │  PostgreSQL    │
                                         └───────┬────────┘
                                                 │
                                                  ▼
                                         ┌────────────────┐
                                         │ AI Evaluation  │
                                         │ Service        │
                                         └────────────────┘
```

**Rationale**:
- Keep the frontend thin: it only renders data and calls the backend.
- Keep the backend responsible for business logic, data access, and AI orchestration.
- Use Supabase as the managed PostgreSQL provider; the backend connects via `psycopg` / SQLAlchemy.
- The AI service is a backend-internal function that returns structured JSON; credentials never leave the backend.

## Core User Journey

### 1. Find a call
User lands on a dashboard or search page. They can search by coach name, client name, program name, or call type (Sales, Kick-off, Coaching, Strategic Review). Results show a list of calls with coach, client, program, date, and type.

### 2. Open the call
User selects a call. The UI navigates to a call detail page showing metadata: who was on the call, when it occurred, the program context, and current evaluation status.

### 3. Review transcript
The call detail page renders the full transcript with speaker labels and timestamps. Transcript is read-only text from seed data.

### 4. Run evaluation
User clicks **Run Evaluation**. The frontend sends the call ID to the backend. The backend loads the transcript, constructs an AI prompt for the 12-dimension rubric, calls the AI provider, parses the structured response, and persists dimension scores. The UI shows a loading state and then redirects to results.

### 5. Review results
The results page displays an overall score, per-dimension scores, and a summary narrative. The user can review each dimension's feedback.

## Core Entities

### Coach
| Field | Type | Purpose |
|-------|------|---------|
| id | UUID | Primary key |
| name | text | Display name |
| specialty | text | Coaching focus area |
| bio | text | Short description |

### Client
| Field | Type | Purpose |
|-------|------|---------|
| id | UUID | Primary key |
| name | text | Display name |
| organization | text | Company or entity |

### Program
| Field | Type | Purpose |
|-------|------|---------|
| id | UUID | Primary key |
| name | text | Program name |
| coach_id | UUID | FK to Coach |
| client_id | UUID | FK to Client |

### Call
| Field | Type | Purpose |
|-------|------|---------|
| id | UUID | Primary key |
| coach_id | UUID | FK to Coach |
| client_id | UUID | FK to Client |
| program_id | UUID | FK to Program |
| type | enum | sales | kickoff | coaching | strategic_review |
| title | text | Short title |
| scheduled_at | timestamp | When the call occurred |
| transcript | text | Full call transcript |
| status | enum | pending | evaluated | failed |
| created_at | timestamp | Record creation time |

### Evaluation
| Field | Type | Purpose |
|-------|------|---------|
| id | UUID | Primary key |
| call_id | UUID | FK to Call |
| overall_score | numeric | Average of dimension scores |
| summary | text | AI-generated narrative summary |
| raw_response | jsonb | Full AI response for debugging |
| created_at | timestamp | When evaluation ran |

### DimensionScore
| Field | Type | Purpose |
|-------|------|---------|
| id | UUID | Primary key |
| evaluation_id | UUID | FK to Evaluation |
| dimension | text | Dimension name (e.g., "Active Listening") |
| score | numeric | 1-5 score |
| feedback | text | AI rationale for the score |
| evidence | text | Quote or observation from transcript |

## Proposed API

### Coaches
- `GET /api/coaches?search=` — list/search coaches
- `GET /api/coaches/{id}` — get coach detail

### Clients
- `GET /api/clients?search=` — list/search clients
- `GET /api/clients/{id}` — get client detail

### Programs
- `GET /api/programs?coach_id=&client_id=` — list programs, optionally filtered
- `GET /api/programs/{id}` — get program detail

### Calls
- `GET /api/calls?coach_id=&client_id=&program_id=&type=` — list/search/filter calls
- `GET /api/calls/{id}` — get call detail with transcript

### Evaluations
- `POST /api/evaluations` — run evaluation for a call (returns evaluation + dimension scores)
- `GET /api/evaluations/{id}` — get evaluation result
- `GET /api/evaluations/call/{call_id}` — get latest evaluation for a call

### Dashboard
- `GET /api/dashboard/stats` — aggregate counts (total calls, evaluated, pending, avg score)

## Sprint 1 Backlog

### Must Have
- [ ] Initialize git repository and push to GitHub
- [ ] Set up backend scaffold (FastAPI, SQLAlchemy, Supabase connection)
- [ ] Set up frontend scaffold (Vite, React, TypeScript, Tailwind, shadcn/ui)
- [ ] Define and migrate database schema (Coach, Client, Program, Call, Evaluation, DimensionScore)
- [ ] Seed test data (5 coaches, 10 clients, 8 programs, 20 calls with transcripts)
- [ ] Implement call search and list page (filter by coach/client/program/type)
- [ ] Implement call detail page with transcript display
- [ ] Implement evaluation runner (backend AI endpoint with structured output)
- [ ] Implement evaluation results page (dimension scores, overall score, summary)
- [ ] Docker Compose for local Supabase and services
- [ ] Environment variable examples and documentation

### Should Have
- [ ] Dashboard with call stats and recent evaluations
- [ ] Loading skeletons and error boundaries
- [ ] Basic responsive layout
- [ ] API pagination for call lists
- [ ] Unit tests for backend models and AI parsing

### Could Have
- [ ] Call type icons and color coding
- [ ] Export evaluation as PDF
- [ ] Historical evaluation comparison
- [ ] Real-time evaluation progress streaming
- [ ] Dark mode toggle

## Assumptions

1. **Transcripts are seeded test data**. We will not integrate with Fathom, Fireflies, or any real recording service for the MVP. Calls and transcripts will be hardcoded fixtures.
2. **The complete proprietary 12-dimension rubric is unavailable**. We will define a reasonable 12-dimension rubric (e.g., Active Listening, Goal Alignment, Question Quality, etc.) and document that this is an MVP interpretation.
3. **AI evaluation returns structured JSON**. The AI provider will be instructed to return JSON matching our schema. Parsing will be defensive.
4. **Frontend never exposes AI API credentials**. All AI calls happen in the Python backend. The frontend only sees evaluation results.
5. **Supabase is used as the managed database**. Local development will use Supabase via Docker. The backend connects via connection string.
6. **Call search is exact or substring match**. No full-text search engine (e.g., Elasticsearch) is required; SQL `ILIKE` is sufficient for MVP.
7. **Authentication is out of scope**. The MVP does not implement user login. All data is public within the app context.
8. **The evaluation is synchronous for MVP**. Streaming or async job queues are deferred. A synchronous HTTP call is acceptable for the three-hour window.

## Risks

1. **Three-hour timebox is tight**. If any component takes longer than expected, we may need to drop "Should Have" items or simplify the frontend.
2. **shadcn/ui setup complexity**. Initializing Tailwind, PostCSS, and shadcn/ui in a fresh Vite project can be error-prone. If it stalls, we will fall back to raw Tailwind utility classes.
3. **Supabase local Docker setup**. The Supabase Docker image is heavy. Startup time could eat into the window. We will pre-pull images where possible.
4. **AI API latency and cost**. If the AI provider is slow, the synchronous evaluation endpoint will time out. We will use a fast model (e.g., GPT-4o-mini) and set generous timeouts.
5. **Structured JSON parsing from LLMs**. LLMs occasionally return malformed JSON. We need robust parsing with fallbacks. A 3-hour assessment may not have time to perfect this, so we will implement basic validation and document the limitation.
6. **Transcript size**. Long transcripts may exceed model context windows. We will truncate or summarize transcripts if necessary and document this as a known limitation.

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-08-20 | Use FastAPI for backend | Minimal boilerplate, native async, automatic OpenAPI docs, Python-native for AI libraries |
| 2026-08-20 | Use Supabase for database | Assessment requirement; managed PostgreSQL; easy local Docker |
| 2026-08-20 | Use Vite + React + TypeScript | Industry standard, fast dev server, Vercel-friendly output |
| 2026-08-20 | Use shadcn/ui + TailwindCSS | Assessment requirement; Radix primitives + Tailwind gives accessible, fast UI |
| 2026-08-20 | Define own 12-dimension rubric | Proprietary rubric unavailable; MVP needs a concrete schema to build against |
| 2026-08-20 | Synchronous AI evaluation | Async queues add complexity; three-hour window favors a single vertical slice |
| 2026-08-20 | No authentication | Not specified in core journey; keeps scope tight |
| 2026-08-20 | Seed data instead of real integrations | Fathom/Fireflies are not available; seeded data ensures reproducible demo |

## Next Milestone

**Milestone 2: Vertical Slice Implementation**

1. Implement and verify Docker Compose (Supabase + backend + frontend).
2. Build backend database models and seed data.
3. Build backend API endpoints for calls, evaluations, and dashboard.
4. Build frontend pages: Call Search, Call Detail, Evaluation Runner, Evaluation Results.
5. Integrate AI evaluation service with structured output.
6. Run end-to-end validation: find a call → open it → review transcript → run evaluation → review results.
7. Deploy frontend to Vercel (optional if time permits).

The success criterion is a user being able to complete the entire core journey from a deployed or locally running application.
