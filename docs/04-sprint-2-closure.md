# Sprint 2 Closure

## Sprint Objective

Connect the existing frontend to real backend and database data. This involved completing the backend API, fixing data-layer bugs, wiring frontend pages to live endpoints, adding charts, and validating the end-to-end data flow: Supabase → Python backend → API response → React frontend → rendered UI.

## Completed Work

### Backend Fixes

- Fixed relative imports in routers that failed when running `uvicorn main:app` directly.
- Changed list endpoint response models from single schema to `List[Schema]` to serialize arrays correctly.
- Added `search` query parameter to `GET /api/calls`.
- Added `total_coaches` to `DashboardStats` response.
- Added `GET /api/evaluations` list endpoint.
- Fixed `seed.py` imports (changed `models` to `sql_models`) and ensured tables are created before seeding.
- Imported `SQLEnum` in `sql_models.py`.
- Updated `DATABASE_URL` scheme from `postgresql://` to `postgresql+psycopg://` to match installed `psycopg[binary]` (psycopg3) driver.

### Database Setup

- Supabase PostgreSQL runs locally via Docker Compose on port `54322`.
- SQLAlchemy 2.0 with `Base.metadata.create_all(bind=engine)` handles schema creation.
- No migrations directory; schema is managed through ORM models.

### Seed Data

- `backend/seed.py` creates demo data:
  - 5 coaches
  - 10 clients
  - 10 programs
  - 10 calls (one per program, across all 4 call types)
  - 5 historical evaluations with 12 dimension scores each

### API Endpoints

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

### Frontend Integration

- Dashboard fetches stats, recent evaluations, and calls data from live endpoints.
- Calls page fetches `/api/calls` with search and type filters.
- Call detail fetches `/api/calls/{id}` and displays metadata, transcript, and evaluation results.
- Analytics page fetches `/api/calls` and `/api/evaluations` for chart data.
- Settings page remains a placeholder.

### Dashboard

- 4 stat cards: Total Calls, Evaluated, Avg Score, Coaches.
- Call Distribution by Type bar chart using Recharts.
- Recent Evaluations list showing call ID and score.
- Evaluation Score Distribution bar chart.
- Loading skeletons and error state with retry button.

### Calls

- Displays coach name, client name, program name, call type, date, and status.
- Search filters by call title (ILIKE).
- Type filter maps to `CallType` enum.
- Loading skeletons, empty state, and error state with retry.

### Call Detail

- Metadata cards for Coach, Client, and Program.
- Transcript displayed in read-only textarea.
- Evaluation results with overall score, progress bar, summary, and dimension scores.
- "Run Evaluation" button triggers live API call.
- Loading skeletons and error handling ("Call not found", connection error).

### Analytics

- Calls by Type pie chart.
- Evaluation Score Distribution bar chart.
- Coach Performance grouped bar chart (calls vs evaluated, with avg score tooltip).
- Loading and error states implemented.

### Charts

- Dashboard: bar charts for call distribution and score distribution.
- Analytics: pie chart for calls by type, bar chart for score distribution, grouped bar chart for coach performance.
- All charts powered by Recharts.

### Loading and Error Handling

- Dashboard: skeleton pulses rendered in `App.tsx`.
- Calls page: 5 skeleton rows during load.
- Call detail: skeleton states during load.
- Analytics: loading and error states.
- All API calls check `response.ok` and throw descriptive errors.
- Dashboard, Calls, and Call Detail show retry buttons on failure.
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

Verified:

1. Supabase is running and healthy.
2. Backend connects to Supabase and seeds data successfully.
3. Backend API returns correct JSON for all endpoints.
4. Frontend dev server proxies `/api` to `http://localhost:8000`.
5. Frontend build completes without TypeScript errors.
6. Dashboard, Calls, Call Detail, and Analytics pages fetch and display real data.

## End-to-End Data Flow

```
Supabase PostgreSQL
        │
        ▼
   FastAPI Backend
        │
        ▼
   API Endpoints (/api/*)
        │
        ▼
   React Frontend (Vite)
        │
        ▼
   UI (shadcn/ui + Recharts)
```

Data originates in Supabase PostgreSQL, is accessed by the FastAPI backend via SQLAlchemy, exposed through REST API endpoints, consumed by the React frontend, and rendered in the UI.

## Deferred Work

The following items were deliberately deferred to maintain the MVP time constraint:

- **Authentication**: No user login or authorization. All data remains public within the app context.
- **Automated tests**: No backend or frontend test suites have been written.
- **Settings**: The settings page remains a placeholder; full implementation is not in scope.
- **Bundle optimization**: Frontend build produces a large JS chunk. Code splitting was deferred.
- **Production CORS hardening**: CORS remains configured with `allow_origins=["*"]` for local development. Production restrictions are not applied.

These items are not abandoned; they are explicitly deprioritized for this sprint to deliver a connected, functional MVP.

## Sprint Outcome

Core Sprint 2 objectives completed.

## Sprint 3 Objective

Implement the live AI-assisted call evaluation workflow, allowing a user to select a call, run an evaluation against the defined 12 evaluation dimensions, persist the evaluation, and review the resulting scores and feedback.
