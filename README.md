# Beavermind Emulator App

A time-boxed MVP emulator of a coaching-call evaluation workflow for the Beavermind AI Native Development Exercise.

## Core User Journey

1. **Find a call** — search coaches, clients, programs, and call types
2. **Open the call** — view call metadata and context
3. **Review transcript** — read the call transcript
4. **Run evaluation** — invoke AI evaluation against a 12-dimension rubric
5. **Review coach performance** — see dimension scores and narrative summary

## Technology Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui + Recharts
- **Backend**: Python + FastAPI + SQLAlchemy
- **Database**: Supabase (PostgreSQL) via Docker Compose
- **AI**: Structured LLM evaluation (OpenAI-compatible, with mock fallback)
- **Deployment**: Vercel-ready frontend output

## Repository Structure

```
├── backend/
│   ├── main.py              # FastAPI app entrypoint
│   ├── config.py            # Settings via pydantic-settings
│   ├── database.py          # SQLAlchemy engine + session
│   ├── sql_models.py        # ORM models (Coach, Client, Program, Call, Evaluation, DimensionScore)
│   ├── schemas.py           # Pydantic schemas
│   ├── seed.py              # Test data seeder
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Backend env vars
│   ├── routers/             # API routers
│   │   ├── coaches.py
│   │   ├── clients.py
│   │   ├── programs.py
│   │   ├── calls.py
│   │   ├── evaluations.py
│   │   └── dashboard.py
│   └── services/
│       └── ai_evaluator.py  # AI evaluation service (with mock fallback)
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.js
│   ├── index.html
│   ├── .env.example
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── App.css
│       ├── components/
│       │   ├── ui/           # shadcn/ui components
│       │   ├── app-sidebar.tsx
│       │   ├── dashboard.tsx
│       │   └── site-header.tsx
│       ├── pages/
│       │   ├── calls.tsx
│       │   ├── call-detail.tsx
│       │   ├── analytics.tsx
│       │   └── settings.tsx
│       └── lib/
│           └── utils.ts
│
├── docs/
│   ├── 01-project-discovery.md
│   ├── 02-ux-ui-responsive-polish.md
│   └── 03-backend-data-integration.md
│
└── docker-compose.yml       # Local Supabase
```

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Docker & Docker Compose

### Start the Entire System

**Option A — Start everything manually:**

```bash
# 1. Start Supabase (PostgreSQL)
docker compose up -d

# 2. Start Backend (in a new terminal)
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python3 -c "from seed import seed_data; from database import SessionLocal; seed_data(SessionLocal())"
uvicorn main:app --reload --port 8000

# 3. Start Frontend (in a new terminal)
cd frontend
npm install
npm run dev
```

**Option B — Start database + backend only (for API testing):**

```bash
docker compose up -d
cd backend
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

### Verify

```bash
# Check database is running
docker compose ps

# Check backend health
curl http://localhost:8000/health

# Check frontend
# Open http://localhost:5173 (or the port shown in terminal)
```

### Seed Test Data

```bash
cd backend
source .venv/bin/activate
python3 -c "from seed import seed_data; from database import SessionLocal; seed_data(SessionLocal())"
```

This creates:
- 5 coaches
- 10 clients
- 10 programs
- 10 calls (one per program, across all 4 call types)
- 5 historical evaluations with 12 dimension scores each

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+psycopg://postgres:postgres@localhost:54322/postgres` |
| `OPENAI_API_KEY` | OpenAI API key for live evaluation | *(empty = mock mode)* |
| `OPENAI_BASE_URL` | OpenAI-compatible base URL | `https://api.openai.com/v1` |
| `OPENAI_MODEL` | Model for evaluation | `gpt-4o-mini` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `/api` (proxied to `http://localhost:8000`) |

> **Note**: The Vite dev server proxies `/api` requests to the backend. In production, set `VITE_API_BASE_URL` to the deployed backend URL.

## Development Commands

### Frontend

```bash
cd frontend

npm run dev        # Start dev server (Vite)
npm run build      # TypeScript check + production build
npm run lint       # Run Oxlint
npm run preview    # Preview production build locally
```

### Backend

```bash
cd backend

uvicorn main:app --reload --port 8000  # Start dev server
```

### Database

```bash
# Start Supabase
docker compose up -d

# Stop Supabase
docker compose down

# View logs
docker compose logs -f db
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
| GET | `/api/calls/{id}` | Get call detail with transcript |
| GET | `/api/evaluations?call_id=` | List evaluations |
| POST | `/api/evaluations?call_id=` | Run evaluation for a call |
| GET | `/api/evaluations/{id}` | Get evaluation result |
| GET | `/api/evaluations/call/{call_id}` | Get latest evaluation for a call |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/health` | Health check |

Interactive API docs: `http://localhost:8000/docs`

## Call Types

- `sales`
- `kickoff`
- `coaching`
- `strategic_review`

## 12 Evaluation Dimensions (MVP Interpretation)

1. Active Listening
2. Goal Alignment
3. Question Quality
4. Empathy & Rapport
5. Solution Framing
6. Accountability Setup
7. Progress Tracking
8. Obstacle Navigation
9. Client Autonomy
10. Feedback Delivery
11. Next Steps Clarity
12. Time Management

> **Note**: The complete proprietary Beavermind 12-dimension rubric is unavailable. These dimensions are a reasonable MVP interpretation and will be refined if the proprietary rubric is shared.

## Assumptions

- Transcripts are seeded test data; no real Fathom/Fireflies integration for MVP.
- AI evaluation returns structured JSON.
- Frontend never exposes AI API credentials.
- Authentication is out of scope for MVP.
- Evaluation is synchronous for the three-hour window.
- CORS allows all origins for local development.

## Risks

- **Timebox**: 3 hours is tight; scope will be aggressively prioritized.
- **shadcn/ui setup**: If initialization stalls, fallback to raw Tailwind classes.
- **AI latency**: Synchronous calls may time out; fast model + generous timeout mitigations are in place.
- **LLM JSON parsing**: Malformed JSON from LLMs is handled with fallback mock evaluation.

## Milestones

- **Sprint 1 (Complete)**: Foundation & UX/UI Polish — repository scaffold, architecture, data model, API design, responsive dashboard, purple/black/white theme, mobile/tablet/desktop validation.
- **Sprint 2 (Current)**: Backend & Data Integration — fixed backend bugs, connected frontend to live API, real charts, loading/error states, end-to-end validation.
- **Sprint 3 (Next)**: AI Evaluation & Advanced Features — live AI evaluation, settings implementation, testing, deployment.

## Sprint 2 Status

Sprint 2 is **complete**. The frontend is now connected to the backend via real API endpoints. Dashboard statistics, call lists, call details, and analytics charts all use live data from Supabase. Loading skeletons, error states, and retry buttons are implemented. The end-to-end data flow has been validated.

See `docs/03-backend-data-integration.md` for full Sprint 2 documentation.

## Sprint 1 Status

Sprint 1 is **complete with known minor issues**. The dashboard is responsive and follows a consistent purple/black/white design system. All major viewports have been verified through code review. Pre-existing React hook lint warnings in `calls.tsx` and `call-detail.tsx` are non-blocking.

See `docs/02-ux-ui-responsive-polish.md` for full Sprint 1 documentation.

## License

MIT
