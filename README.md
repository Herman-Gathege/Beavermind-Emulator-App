# Beavermind Emulator App

A time-boxed MVP emulator of a coaching-call evaluation workflow for the Beavermind AI Native Development Exercise.

## Core User Journey

1. **Find a call** — search coaches, clients, programs, and call types
2. **Open the call** — view call metadata and context
3. **Review transcript** — read the call transcript
4. **Run evaluation** — invoke AI evaluation against a 12-dimension rubric
5. **Review coach performance** — see dimension scores and narrative summary

## Technology Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Python + FastAPI + SQLAlchemy
- **Database**: Supabase (PostgreSQL)
- **AI**: Structured LLM evaluation (OpenAI-compatible)
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
│   └── 02-ux-ui-responsive-polish.md
│
└── docker-compose.yml       # Local Supabase
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose

### 1. Start Supabase (PostgreSQL)

```bash
docker compose up -d
```

Verify it's running:
```bash
docker compose ps
```

The database will be available at `localhost:54322`.

### 2. Start Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

API docs will be available at `http://localhost:8000/docs`.

### 3. Seed Test Data

```bash
cd backend
python -c "from seed import seed_data; from database import SessionLocal; seed_data(SessionLocal())"
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:54322/postgres` |
| `OPENAI_API_KEY` | OpenAI API key for live evaluation | *(empty = mock mode)* |
| `OPENAI_BASE_URL` | OpenAI-compatible base URL | `https://api.openai.com/v1` |
| `OPENAI_MODEL` | Model for evaluation | `gpt-4o-mini` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api` |

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

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/coaches?search=` | List/search coaches |
| GET | `/api/clients?search=` | List/search clients |
| GET | `/api/programs?coach_id=&client_id=` | List programs |
| GET | `/api/calls?coach_id=&client_id=&program_id=&type=` | List/search calls |
| GET | `/api/calls/{id}` | Get call detail |
| POST | `/api/evaluations?call_id=` | Run evaluation |
| GET | `/api/evaluations/{id}` | Get evaluation result |
| GET | `/api/dashboard/stats` | Dashboard statistics |

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

## Risks

- **Timebox**: 3 hours is tight; scope will be aggressively prioritized.
- **shadcn/ui setup**: If initialization stalls, fallback to raw Tailwind classes.
- **AI latency**: Synchronous calls may time out; fast model + generous timeout mitigations are in place.
- **LLM JSON parsing**: Malformed JSON from LLMs is handled with fallback mock evaluation.

## Milestones

- **Sprint 1 (Current)**: Foundation & UX/UI Polish — repository scaffold, architecture, data model, API design, responsive dashboard, purple/black/white theme, mobile/tablet/desktop validation.
- **Sprint 2**: Vertical Slice Implementation — end-to-end call search → evaluation → results flow, real charts, settings page, backend integration.

## Sprint 1 Status

Sprint 1 is **complete with known minor issues**. The dashboard is responsive and follows a consistent purple/black/white design system. All major viewports have been verified through code review. Pre-existing React hook lint warnings in `calls.tsx` and `call-detail.tsx` are non-blocking.

See `docs/02-ux-ui-responsive-polish.md` for full Sprint 1 documentation.

## License

MIT
