# Sprint 3 — AI Evaluation

## 1. Sprint Objective

Turn the existing Sprint 2 evaluation mechanism into a genuine AI-assisted coaching-call evaluation workflow. The reviewer must be able to complete: SELECT CALL → RUN EVALUATION → RECEIVE STRUCTURED EVALUATION → REVIEW RESULTS. This is the most important vertical slice of the MVP.

## 2. Existing Evaluation Implementation

Before Sprint 3, the backend already had:

- `backend/services/ai_evaluator.py` — an AI evaluation service with 12 dimensions, OpenAI integration via `httpx`, structured JSON output (`response_format: json_object`), and a `mock_evaluation()` fallback when `OPENAI_API_KEY` is missing.
- `backend/routers/evaluations.py` — a `POST /api/evaluations?call_id=<id>` endpoint that called `run_evaluation(call.transcript or "")` and persisted `Evaluation` + `DimensionScore` records.
- `backend/sql_models.py` — `Evaluation` and `DimensionScore` SQLAlchemy models.
- `backend/schemas.py` — Pydantic schemas for evaluation responses.
- `frontend/src/pages/call-detail.tsx` — Call Detail page with a "Run Evaluation" button and basic evaluation result display.

The existing dimensions were: Active Listening, Goal Alignment, Question Quality, Empathy & Rapport, Solution Framing, Accountability Setup, Progress Tracking, Obstacle Navigation, Client Autonomy, Feedback Delivery, Next Steps Clarity, Time Management.

## 3. Changes Implemented

### Backend

- **`backend/services/ai_evaluator.py`**:
  - Replaced dimension list with 12 coaching-specific dimensions: Check-in & Connection, Agenda & Alignment, Active Listening, Question Quality, Diagnostics / Discovery, Goal Clarity, Coaching & Guidance, Insight Generation, Action Planning, Accountability, Communication Quality, Close & Next Steps.
  - Added call type context (`call_type` parameter) with guidance strings for sales, kickoff, coaching, and strategic_review calls.
  - Added Pydantic validation models (`DimensionSchema`, `EvaluationSchema`) with `_validate_and_normalize()` that enforces:
    - Exactly 12 dimensions
    - Valid dimension names from the fixed list
    - No duplicate dimensions
    - Scores between 1 and 5
    - `overall_score` must equal the arithmetic mean of the 12 dimension scores (rounded to 2 decimals)
    - Required fields present
  - Improved prompt with explicit evidence requirements, scoring scale definitions, call type guidance, and instructions to state "Insufficient evidence in transcript." when evidence is lacking.
  - Added `strengths`, `improvement_areas`, and `recommendations` to the AI output structure.
  - Better error handling: AI failures raise `RuntimeError` instead of silently returning mock data. Mock data is only returned when `OPENAI_API_KEY` is not configured.
  - Logging added for failures.

- **`backend/sql_models.py`**:
  - Added nullable `Text` columns to `Evaluation`: `strengths`, `improvement_areas`, `recommendations`.

- **`backend/schemas.py`**:
  - Added `strengths`, `improvement_areas`, `recommendations` (optional `List[str]`) to `Evaluation` schema.
  - Added `field_validator` to parse JSON strings from the database into Python lists.
  - Added `json` import and `field_validator` import.

- **`backend/routers/evaluations.py`**:
  - `POST /api/evaluations` now passes `call_type=call.type.value` to `run_evaluation()`.
  - Added UUID validation for `call_id` query parameter — invalid UUIDs return 404 instead of 500.
  - Controlled error responses: AI/provider failures return HTTP 502 with a friendly message; unexpected errors return HTTP 500 with a friendly message. Raw provider errors are not exposed.
  - Saves `strengths`, `improvement_areas`, `recommendations` as JSON strings.

- **`backend/seed.py`**:
  - Updated seeded evaluations to include `strengths`, `improvement_areas`, `recommendations` as JSON strings.
  - Added `json` import.

### Frontend

- **`frontend/src/pages/call-detail.tsx`**:
  - Updated `Evaluation` interface to include `strengths`, `improvement_areas`, `recommendations`.
  - Added `evalError` state to capture and display backend error messages.
  - Enhanced evaluation result UI with three-column grid showing Strengths (green), Improvement Areas (amber), and Recommendations (blue).
  - Error state shows a friendly destructive-styled alert instead of silently failing.
  - `runEvaluation` now surfaces `err.message` from the backend response.

## 4. AI Architecture

```
User clicks "Run Evaluation"
        ↓
POST /api/evaluations?call_id=<id>
        ↓
Evaluation Router validates call UUID and existence
        ↓
Evaluation Service (run_evaluation)
        ↓
AI Provider (OpenAI API via httpx)
  - System message: evaluation role
  - User message: transcript + call type + 12 dimensions + scoring rules
  - response_format: json_object
        ↓
Structured AI Result (JSON)
        ↓
Pydantic Validation (_validate_and_normalize)
  - Exactly 12 dimensions
  - Valid names, no duplicates, scores 1-5
  - overall_score = mean(dimension scores)
  - Required fields present
        ↓
Database (Evaluation + DimensionScore)
```

## 5. MVP Evaluation Rubric

This rubric is an MVP interpretation based on the assessment requirements and is not presented as Beavermind's proprietary internal rubric.

The 12 evaluation dimensions are:

1. **Check-in & Connection** — How well the coach established rapport and checked in on the client's wellbeing.
2. **Agenda & Alignment** — Whether the coach confirmed or co-created an agenda and aligned on the session purpose.
3. **Active Listening** — Evidence of attentive listening, paraphrasing, summarizing, and avoiding interruptions.
4. **Question Quality** — Use of open, powerful, thought-provoking questions versus closed or leading questions.
5. **Diagnostics / Discovery** — Depth of exploration into root causes, assumptions, and underlying patterns.
6. **Goal Clarity** — Clarity, specificity, and measurability of goals discussed or refined during the call.
7. **Coaching & Guidance** — Quality of coaching frameworks, models, or guidance provided.
8. **Insight Generation** — Facilitation of client-generated insights, reframes, or new perspectives.
9. **Action Planning** — Concrete, realistic next steps or experiments agreed upon.
10. **Accountability** — Clear commitments, ownership, and follow-up structures established.
11. **Communication Quality** — Clarity, tone, pacing, and adaptability of the coach's communication.
12. **Close & Next Steps** — Effective session close, recap, and alignment on what happens next.

## 6. Scoring Model

- Each dimension is scored on a **1–5 scale**:
  - 1 = Poor
  - 2 = Needs Improvement
  - 3 = Meets Expectations
  - 4 = Strong
  - 5 = Excellent
- **Overall score** = arithmetic mean of the 12 dimension scores, rounded to 2 decimal places.
- No weighting is applied in the MVP. The AI is instructed to calculate the mean explicitly.

## 7. AI Prompt Strategy

The evaluation prompt is sent as a single user message with a system instruction to return ONLY valid JSON. The prompt includes:

- Call type context (sales, kickoff, coaching, strategic_review)
- Guidance specific to that call type
- The 1–5 scoring scale with definitions
- The 12 dimensions with descriptions
- Rules:
  - Base scores only on transcript evidence
  - State "Insufficient evidence in transcript." when evidence is lacking
  - Do not invent quotes or events
  - overall_score must be the arithmetic mean of dimension scores
- Transcript (truncated to 12,000 characters to stay within token limits)

Temperature is set to 0.2 for deterministic, consistent output. `response_format: {"type": "json_object"}` is used to enforce structured JSON from the model.

## 8. Structured Output

The AI is required to return:

```json
{
  "overall_score": 3.94,
  "summary": "Overall assessment...",
  "strengths": ["...", "...", "..."],
  "improvement_areas": ["...", "..."],
  "recommendations": ["...", "..."],
  "dimensions": [
    {
      "dimension": "Active Listening",
      "score": 4,
      "feedback": "The coach demonstrated...",
      "evidence": "Transcript evidence..."
    }
  ]
}
```

- Exactly 12 dimension objects are required.
- Dimension names must match the fixed 12-dimension list.
- Scores must be numbers between 1 and 5.
- `overall_score` is validated to equal the mean of the dimension scores.

## 9. Validation

Validation is performed by `_validate_and_normalize()` in `ai_evaluator.py` using Pydantic models:

- **Dimension count**: Must be exactly 12.
- **Dimension names**: Must be one of the 12 predefined names (case-sensitive match).
- **No duplicates**: Each dimension name may appear only once.
- **Score range**: Each score must be between 1 and 5 (inclusive).
- **Overall score consistency**: `overall_score` must equal `round(mean(dimension_scores), 2)` within a tolerance of 0.02.
- **Required fields**: `dimension`, `score`, `feedback`, `evidence` must be present in each dimension object.
- **Type safety**: All inputs are type-checked before processing.

If validation fails, a `ValueError` is raised, the evaluation is not saved, and the backend returns a controlled error to the frontend.

## 10. Persistence

Evaluation results are persisted using the existing SQLAlchemy models:

- **`Evaluation`** table stores:
  - `overall_score` (Numeric 3,2)
  - `summary` (Text)
  - `strengths` (Text, JSON array)
  - `improvement_areas` (Text, JSON array)
  - `recommendations` (Text, JSON array)
  - `raw_response` (Text, dimension data string)
  - `call_id` (foreign key)

- **`DimensionScore`** table stores one row per dimension:
  - `dimension` (String)
  - `score` (Numeric 3,2)
  - `feedback` (Text)
  - `evidence` (Text)
  - `evaluation_id` (foreign key)

The frontend Pydantic schema (`schemas.py`) uses `field_validator` to parse the JSON string columns back into Python `List[str]` for `strengths`, `improvement_areas`, and `recommendations`.

Existing seeded evaluations are fully compatible with the new schema because the new columns are nullable.

## 11. UI

The Call Detail page evaluation section was enhanced but not redesigned:

- **Overall Score**: Large numeric score with a progress bar.
- **Summary**: Brief narrative below the score.
- **Strengths / Improvement Areas / Recommendations**: Three-column grid on desktop, stacked on mobile. Each column uses a distinct color (green, amber, blue) for quick scanning.
- **Dimension Scores**: Each dimension shows its name, score, feedback, and transcript evidence (when available).
- **Run Evaluation button**: Shows "Evaluating..." with a spinner while the request is in flight. Button is disabled during evaluation to prevent duplicate submissions.
- **Error handling**: If evaluation fails, a friendly error message is displayed inside the evaluation card. Raw backend errors are not shown.

## 12. Testing

Tests were performed after implementation:

### Backend Unit Tests
- **Valid AI output validation**: Passed — 12 dimensions, correct scores, valid overall_score.
- **Invalid overall score**: Passed — caught mismatch between overall_score and dimension mean.
- **Wrong dimension count**: Passed — caught when fewer than 12 dimensions provided.
- **Score out of range**: Passed — caught score of 6.0.

### API Integration Tests
- **Successful evaluation**: Passed — POST returns 200 with 12 dimensions, all scores 1–5.
- **Duplicate evaluation**: Passed — second POST for same call returns existing evaluation with same ID.
- **Invalid call ID**: Passed — malformed UUID returns 404.
- **Existing evaluations**: Passed — seeded evaluations still load via GET /api/evaluations.
- **Call detail**: Passed — call status updates to `evaluated` after evaluation.
- **Evaluation for call**: Passed — GET /api/evaluations/call/{id} returns the evaluation.

### Frontend Tests
- **Build**: Passed — `npm run build` succeeds.
- **Lint**: Passed — only pre-existing warnings (no new issues introduced).

## 13. Known Limitations

- **Mock fallback**: When `OPENAI_API_KEY` is not configured, the system returns deterministic mock data. This is intentional for the MVP but means the AI workflow is not live in the default environment.
- **Transcript truncation**: Transcripts are truncated to 12,000 characters before being sent to the AI. Very long calls may lose context.
- **No evaluation versioning**: Re-evaluating a call replaces the existing evaluation (the existing behavior is preserved: once a call is marked `evaluated`, subsequent POSTs return the existing result).
- **No streaming**: The evaluation is a single synchronous request. Long transcripts may take 10–30 seconds.
- **Single AI provider**: Only OpenAI-compatible APIs are supported via `OPENAI_BASE_URL`. No multi-provider fallback.
- **No authentication**: Anyone with access to the API can evaluate calls.

## 14. Sprint 3 Definition of Done

Sprint 3 is complete. A reviewer can perform the full workflow:

1. Find a Call ✓
2. Open Call Detail ✓
3. Read Transcript ✓
4. Run Evaluation ✓
5. Receive Structured Result ✓
6. Review 12 Dimensions ✓
7. Understand Strengths ✓
8. Understand Improvement Areas ✓
9. See Supporting Evidence ✓

And:
- Evaluation is persisted ✓
- Refreshing the page does not lose the result ✓
- Existing historical evaluations still work ✓
- Dashboard still works ✓
- Analytics still works ✓
- Existing responsive UI still works ✓
- Invalid AI output is rejected ✓
- AI/provider failures are handled gracefully ✓
- Frontend builds successfully ✓
- Backend APIs work ✓

## 15. Sprint 4 Focus

Sprint 4 should focus on:

- End-to-end validation with a real AI provider
- Enhanced error handling and retry logic
- UI polish (loading skeletons, better empty states)
- Deployment configuration
- Final documentation
- Performance optimization for long transcripts
- Evaluation history / versioning if needed
- Authentication and authorization
