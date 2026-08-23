# Sprint 2 — Backend & Data Integration

## Objective

I connected the existing frontend to real application data. This meant completing the backend API, fixing data-layer bugs, wiring frontend pages to live endpoints, adding charts, and validating the end-to-end flow: Supabase → Python backend → API response → React frontend → rendered UI.

## What I Found in the Backend

I found that the backend already had a FastAPI scaffold with SQLAlchemy models, Pydantic schemas, routers, a seed script, and an AI evaluation service. But it had several issues that prevented it from working end-to-end:

- **Framework**: FastAPI with uvicorn. Entry point is `backend/main.py`.
- **Database**: SQLAlchemy 2.0 with psycopg3 URLs. Local PostgreSQL provided by Supabase Docker image on port `54322`.
- **Models**: `Coach`, `Client`, `Program`, `Call`, `Evaluation`, `DimensionScore` defined in `sql_models.py`.
- **Schemas**: Pydantic schemas in `schemas.py`.
- **Routers**: `coaches`, `clients`, `programs`, `calls`, `evaluations`, `dashboard`.
- **Config**: `pydantic-settings` with `.env` support.
- **CORS**: Configured with `allow_origins=["*"]` for local development.
- **Seed script**: `seed.py` existed but had import issues and minimal data.

The issues I ran into:

1. Router imports used relative imports (`..database`) that fail when running `uvicorn main:app` directly.
2. Several list endpoints returned `response_model=SingleSchema` instead of `List[SingleSchema]`.
3. `calls` router was missing the `search` query parameter.
4. `dashboard/stats` did not include `total_coaches`.
5. `evaluations` router was missing a `GET /evaluations` list endpoint.
6. `seed.py` imported from `models` instead of `sql_models`, and did not create tables before seeding.
7. `sql_models.py` used `SQLEnum` without importing it.
8. `DATABASE_URL` in `.env.example` used `postgresql://` which requires psycopg2, but only psycopg3 (`psycopg[binary]`) was installed.

## What I Fixed

### Backend Fixes

- Fixed relative imports in routers to absolute imports so `uvicorn main:app` works correctly.
- Changed list endpoint response models from `Schema` to `List[Schema]` so FastAPI serializes arrays correctly.
- Added `search` param to `GET /api/calls` so the frontend search input actually works.
- Added `total_coaches` to `DashboardStats` so the dashboard coaches card shows real data instead of `"—"`.
- Added `GET /api/evaluations` list endpoint so the dashboard can populate "Recent Evaluations".
- Fixed `seed.py` imports (changed `models` to `sql_models`) and ensured tables are created before seeding.
- Imported `SQLEnum` in `sql_models.py`.
- Updated `DATABASE_URL` scheme from `postgresql://` to `postgresql+psycopg://` to match the installed psycopg3 driver.

### Database Setup

- Supabase PostgreSQL runs locally via Docker Compose on port `54322`.
- SQLAlchemy 2.0 with `Base.metadata.create_all(bind=engine)` handles schema creation.
- No migrations directory yet; schema is managed through ORM models.

### Seed Data

I updated `backend/seed.py` to create demo data:

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

## Frontend Integration

### Dashboard (`frontend/src/components/dashboard.tsx`)

- Receives `stats`, `recentEvaluations`, and `calls` from `App.tsx`.
- Displays 4 stat cards: Total Calls, Evaluated, Avg Score, Coaches.
- **Call Distribution by Type** bar chart using Recharts.
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
# built successfully
```

### End-to-End Data Flow

I verified:

1. Supabase is running and healthy.
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
