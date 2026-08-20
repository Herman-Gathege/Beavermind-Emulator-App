# Beavermind Emulator Backend

Python 3.11+ backend service built with FastAPI.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

## Endpoints

- `GET /api/coaches`
- `GET /api/clients`
- `GET /api/programs`
- `GET /api/calls`
- `POST /api/evaluations?call_id=<uuid>`
- `GET /api/dashboard/stats`
