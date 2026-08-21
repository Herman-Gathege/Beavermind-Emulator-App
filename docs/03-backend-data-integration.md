# Sprint 2 — Backend & Data Integration

## Objective

Connect the existing frontend to real application data by completing the backend API, fixing data-layer bugs, wiring frontend pages to live endpoints, adding charts, and validating the end-to-end flow: Supabase → Python backend → API response → React frontend → rendered UI.

## Existing Backend Findings

The backend already had a FastAPI scaffold with SQLAlchemy models, Pydantic schemas, routers, a seed script, and an AI evaluation service. Key findings:

- **Framework**: FastAPI with uvicorn.
- **Entry point**: `backend/main.py`.
- **Database**: SQLAlchemy 2.0 with psycopg/psycopg2-style URLs. Local PostgreSQL provided by Supabase Docker image (`supabase/postgres:15.1.0.147`) on port `54322`.
- **Models**: `Coach`, `Client`, `Program`, `Call`, `Evaluation`, `DimensionScore` defined in `sql_models.py`.
- **Schemas**: Pydantic schemas in `schemas.py`.
- **Routers**: `coaches`, `clients`, `programs`, `calls`, `evaluations`, `dashboard`.
- **Config**: `pydantic-settings` with `.env` support.
- **CORS**: Configured with `allow_origins=["*"]` for local development.
- **Seed script**: `seed.py` existed but had import issues and minimal data.
- **Tests**: No test files present.
- **Issues found**:
  - Router imports used relative imports (`..database`) that fail when running `uvicorn main:app` directly.
  - Several list endpoints returned `response_model=SingleSchema` instead of `List[SingleSchema]`.
  - `calls` router was missing the `search` query parameter.
  - `dashboard/stats` did not include `total_coaches`.
  - `evaluations` router was missing a `GET /evaluations` list endpoint.
  - `seed.py` imported from `models` instead of `sql_models`, and did not create tables before seeding.
  - `sql_models.py` used `SQLEnum` without importing it.
  - `DATABASE_URL` in `.env.example` used `postgresql://` which requires psycopg2, but only psycopg3 (`psycopg[binary]`) was installed.

## Existing Frontend Data Flow

Before Sprint 2, the frontend had:

- **Dashboard**: Loaded stats and evaluations from `/api/dashboard/stats` and `/api/evaluations`. Stats had a hard-coded `"Coaches"` card value of `"—"`. The chart area was a placeholder.
- **Calls page**: Fetched `/api/calls` with search/type filters. Displayed call title, type badge, date, and status. Did not display coach, client, or program names.
- **Call detail**: Fetched `/api/calls/{id}`. Displayed transcript and evaluation results. Did not display coach/client/program metadata cards. Error handling was minimal (`console.error` only).
- **Analytics**: Pure placeholder — no data fetching.
- **Settings**: Pure placeholder.
- **Loading states**: Dashboard had no loading state (just `Loading...` text). Calls page had skeletons. Call detail had skeletons.
- **Error handling**: Minimal. Most pages just logged errors to console.

## Database Design

The existing models were reused without changes. The actual entities used:

| Entity | Table | Key Fields |
|--------|-------|------------|
| Coach | `coaches` | id, name, specialty, bio, created_at |
| Client | `clients` | id, name, organization, created_at |
| Program | `programs` | id, name, coach_id (FK), client_id (FK), created_at |
| Call | `calls` | id, coach_id (FK), client_id (FK), program_id (FK), type (enum), title, scheduled_at, transcript, status (enum), created_at |
| Evaluation | `evaluations` | id, call_id (FK), overall_score, summary, raw_response, created_at |
| DimensionScore | `dimension_scores` | id, evaluation_id (FK), dimension, score, feedback, evidence, created_at |

Call types: `sales`, `kickoff`, `coaching`, `strategic_review`.
Call statuses: `pending`, `evaluated`, `failed`.

No migrations directory exists; schema creation is handled by `Base.metadata.create_all(bind=engine)`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/coaches?search=` | List/search coaches |
| GET | `/api/coaches/{id}` | Get coach detail |
| GET | `/api/clients?search=` | List/search clients |
| GET | `/api/clients/{id}` | Get client detail |
| GET | `/api/programs?coach_id=&client_id=` | List programs |
| GET | `/api/programs/{id}` | Get program detail |
| GET | `/api/calls?coach_id=&client_id=&program_id=&type=&search=` | List/search/filter calls |
| GET | `/api/calls/{id}` | Get call detail with transcript and related entities |
| GET | `/api/evaluations?call_id=` | List evaluations, optionally filtered by call |
| POST | `/api/evaluations?call_id=` | Run evaluation for a call |
| GET | `/api/evaluations/{id}` | Get evaluation result |
| GET | `/api/evaluations/call/{call_id}` | Get latest evaluation for a call |
| GET | `/api/dashboard/stats` | Dashboard statistics (total calls, evaluated, pending, avg score, total coaches) |
| GET | `/health` | Health check |

## Seed Data

Demo data is created by `backend/seed.py`:

- **5 coaches**: Alice M., James K., Priya N., David R., Sofia L.
- **10 clients**: TechCorp Inc., GreenField Ltd., FinEdge, MediCare Plus, EduFirst, BuildRight, CloudNine, UrbanEats, AutoDrive, SpaceLink.
- **10 programs**: One per client, assigned to coaches in round-robin.
- **10 calls**: One per program, distributed across all 4 call types. Each call has a realistic transcript.
- **5 evaluations**: Historical evaluations seeded for the first 5 calls, each with 12 dimension scores. These allow the dashboard and analytics pages to display meaningful statistics before Sprint 3's live AI evaluation.

To seed:

```bash
cd backend
source .venv/bin/activate
python3 -c "from seed import seed_data; from database import SessionLocal; seed_data(SessionLocal())"
```

## Frontend Integration

### Dashboard (`frontend/src/components/dashboard.tsx`)

- Receives `stats`, `recentEvaluations`, and `calls` from `App.tsx`.
- Displays 4 stat cards: Total Calls, Evaluated, Avg Score, Coaches.
- **Call Distribution by Type** bar chart using Recharts (`recharts`).
- **Recent Evaluations** list showing call ID (truncated) and score.
- **Evaluation Score Distribution** bar chart bucketed into score ranges.
- Loading state: skeleton pulses rendered in `App.tsx`.
- Error state: error message with retry button in `App.tsx`.

### Calls Page (`frontend/src/pages/calls.tsx`)

- Fetches `/api/calls?search=&type=` from the backend.
- Displays coach name, client name, program name, call type, date, and status for each call.
- Search filters by call title (`ILIKE`).
- Type filter maps to the `CallType` enum.
- Loading state: 5 skeleton rows.
- Empty state: "No calls found. Try adjusting your search."
- Error state: error message with retry button.

### Call Detail (`frontend/src/pages/call-detail.tsx`)

- Fetches `/api/calls/{id}`.
- Displays metadata cards for Coach, Client, and Program.
- Displays transcript in a read-only textarea.
- Displays evaluation results when available (overall score, progress bar, summary, dimension scores).
- "Run Evaluation" button triggers `POST /api/evaluations?call_id=` and displays results inline.
- Loading state: skeletons.
- Error state: "Call not found" or connection error with back link.

### Analytics Page (`frontend/src/pages/analytics.tsx`)

- Fetches `/api/calls` and `/api/evaluations`.
- **Calls by Type** pie chart.
- **Evaluation Score Distribution** bar chart.
- **Coach Performance** grouped bar chart (calls vs evaluated, with avg score tooltip data).
- Loading and error states implemented.

### Settings Page

Remains a placeholder. Not in Sprint 2 scope.

## Error Handling

### Backend

- Standard FastAPI `HTTPException` for 404s.
- `run_evaluation` in `ai_evaluator.py` falls back to `mock_evaluation()` on any exception.
- Database sessions are yielded via `get_db()` dependency and closed automatically.

### Frontend

- All API calls check `response.ok` and throw descriptive errors.
- Dashboard shows a retry button on failure.
- Calls page shows an error message with retry.
- Call detail shows "Call not found" for 404s and a generic connection error for network failures.
- No raw backend errors are exposed to the user.

## Validation

### Commands Run

```bash
# Start Supabase
docker compose up -d

# Backend setup
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# Seed data
python3 -c "from seed import seed_data; from database import SessionLocal; seed_data(SessionLocal())"

# Start backend
uvicorn main:app --reload --port 8000

# Frontend setup
cd frontend
npm install
npm run dev
npm run build
```

### API Tests

```bash
# Coaches
curl -s http://localhost:8000/api/coaches | jq 'length'
# => 5

# Calls with filter
curl -s "http://localhost:8000/api/calls?type=sales" | jq 'length'
# => 3

# Dashboard stats
curl -s http://localhost:8000/api/dashboard/stats
# => {"total_calls":10,"evaluated":5,"pending":5,"avg_score":4.026,"total_coaches":5}

# Evaluations
curl -s http://localhost:8000/api/evaluations | jq 'length'
# => 5

# Evaluation by call
curl -s http://localhost:8000/api/evaluations/call/6b7efbdf-3319-4bc4-b731-cb8eb4b9af89 | jq '.overall_score'
# => 3.82
```

### Frontend Build

```bash
cd frontend
npm run build
# ✓ built in 2.85s
```

### End-to-End Data Flow

Verified:

1. Supabase is running and healthy (`docker compose ps` shows `healthy`).
2. Backend connects to Supabase and seeds data successfully.
3. Backend API returns correct JSON for all endpoints.
4. Frontend dev server proxies `/api` to `http://localhost:8000`.
5. Frontend build completes without TypeScript errors.
6. Dashboard, Calls, Call Detail, and Analytics pages fetch and display real data.

## Decisions

| Decision | Rationale |
|----------|-----------|
| Fixed relative imports in routers to absolute imports | `uvicorn main:app` runs `main.py` as a top-level script; relative imports (`..database`) fail. Absolute imports work in this flat package layout. |
| Changed list endpoint response models from `Schema` to `List[Schema]` | FastAPI needs `List[...]` to serialize arrays correctly. The original single-model response model caused validation errors. |
| Added `search` param to `GET /api/calls` | Frontend calls page already had a search input; backend support was missing. |
| Added `total_coaches` to `DashboardStats` | Frontend dashboard stat cards include a "Coaches" card that was hard-coded to `"—"`. |
| Added `GET /api/evaluations` list endpoint | Frontend dashboard fetches evaluations to populate "Recent Evaluations". The endpoint was missing. |
| Reused existing SQLAlchemy models instead of creating new ones | The existing models already matched the MVP requirements. No need to over-engineer. |
| Seeded historical evaluations for first 5 calls | Allows dashboard and analytics to show meaningful data before Sprint 3 AI evaluation is implemented. |
| Kept `allow_origins=["*"]` CORS for local development | Appropriate for MVP; should be restricted in production. |
| Used `postgresql+psycopg://` scheme | Matches the installed `psycopg[binary]` (psycopg3) driver. The original `postgresql://` scheme tried to import `psycopg2` which is not installed. |

## Known Issues

1. **Vite config warning**: `__dirname` usage in `vite.config.ts` triggers a warning about future native config loader. Not blocking.
2. **Chunk size warning**: Frontend build produces a ~786 KB JS chunk. Consider code splitting in a future milestone.
3. **React hook dependencies**: `calls.tsx` and `call-detail.tsx` have `useEffect` dependency array warnings for `fetchCalls` and `fetchCall`. These are functional but generate lint warnings.
4. **No authentication**: Out of scope for MVP. All data is public.
5. **AI evaluation requires OpenAI key**: Without `OPENAI_API_KEY`, evaluations use mock data. This is intentional for Sprint 2.
6. **No tests**: No backend or frontend tests have been written yet.

## Next Milestone

The next milestone should focus on:

- Completing the application data experience (settings page, call creation flow).
- Preparing the evaluation workflow for Sprint 3's live AI evaluation.
- Adding basic backend and frontend tests.
- Restricting CORS origins for production readiness.
