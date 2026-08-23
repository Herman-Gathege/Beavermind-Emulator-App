import json
import logging
import os
from typing import Any
from pydantic import BaseModel
from config import get_settings
import httpx

logger = logging.getLogger(__name__)
settings = get_settings()

DIMENSIONS = [
    "Check-in & Connection",
    "Agenda & Alignment",
    "Active Listening",
    "Question Quality",
    "Diagnostics / Discovery",
    "Goal Clarity",
    "Coaching & Guidance",
    "Insight Generation",
    "Action Planning",
    "Accountability",
    "Communication Quality",
    "Close & Next Steps",
]

DIMENSION_DESCRIPTIONS = {
    "Check-in & Connection": "How well the coach established rapport and checked in on the client's wellbeing.",
    "Agenda & Alignment": "Whether the coach confirmed or co-created an agenda and aligned on the session purpose.",
    "Active Listening": "Evidence of attentive listening, paraphrasing, summarizing, and avoiding interruptions.",
    "Question Quality": "Use of open, powerful, thought-provoking questions versus closed or leading questions.",
    "Diagnostics / Discovery": "Depth of exploration into root causes, assumptions, and underlying patterns.",
    "Goal Clarity": "Clarity, specificity, and measurability of goals discussed or refined during the call.",
    "Coaching & Guidance": "Quality of coaching frameworks, models, or guidance provided.",
    "Insight Generation": "Facilitation of client-generated insights, reframes, or new perspectives.",
    "Action Planning": "Concrete, realistic next steps or experiments agreed upon.",
    "Accountability": "Clear commitments, ownership, and follow-up structures established.",
    "Communication Quality": "Clarity, tone, pacing, and adaptability of the coach's communication.",
    "Close & Next Steps": "Effective session close, recap, and alignment on what happens next.",
}

CALL_TYPE_GUIDANCE = {
    "sales": "Focus on discovery, understanding client needs, communication quality, alignment, and clear next steps.",
    "kickoff": "Focus on connection, alignment, goal clarity, expectations, and next steps.",
    "coaching": "Focus on listening, diagnostics, coaching frameworks, insight generation, accountability, and action planning.",
    "strategic_review": "Focus on diagnostics, progress assessment, strategic thinking, accountability, and action planning.",
}


class DimensionSchema(BaseModel):
    dimension: str
    score: float
    feedback: str
    evidence: str


class EvaluationSchema(BaseModel):
    overall_score: float
    summary: str
    strengths: list[str]
    improvement_areas: list[str]
    recommendations: list[str]
    dimensions: list[DimensionSchema]


def run_evaluation(transcript: str, call_type: str = "coaching") -> dict:
    if not transcript or not transcript.strip():
        raise ValueError("Transcript is empty and cannot be evaluated.")

    if not settings.OPENAI_API_KEY:
        logger.info("OPENAI_API_KEY not configured; returning mock evaluation.")
        return mock_evaluation(call_type)

    prompt = _build_prompt(transcript, call_type)

    try:
        with httpx.Client(timeout=120.0) as client:
            resp = client.post(
                f"{settings.OPENAI_BASE_URL}/chat/completions",
                headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                json={
                    "model": settings.OPENAI_MODEL,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are an expert coaching-call evaluator. Return ONLY valid JSON. Do not include markdown fences, prose, or explanations outside the JSON object.",
                        },
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.2,
                    "response_format": {"type": "json_object"},
                },
            )
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
            data = json.loads(content)
            validated = _validate_and_normalize(data)
            return validated.model_dump()
    except Exception as exc:
        logger.error("AI evaluation failed: %s", exc, exc_info=True)
        raise RuntimeError(f"AI evaluation failed: {exc}") from exc


def _build_prompt(transcript: str, call_type: str) -> str:
    guidance = CALL_TYPE_GUIDANCE.get(call_type, CALL_TYPE_GUIDANCE["coaching"])
    dim_list = "\n".join(
        f"{i+1}. {name} — {desc}" for i, (name, desc) in enumerate(DIMENSION_DESCRIPTIONS.items())
    )
    return f"""Evaluate this coaching conversation transcript against the 12 dimensions below.

Call type: {call_type}
Evaluation guidance for this call type: {guidance}

Scoring scale:
1 = Poor
2 = Needs Improvement
3 = Meets Expectations
4 = Strong
5 = Excellent

Rules:
- Base every score ONLY on evidence present in the transcript.
- If there is insufficient evidence for a dimension, set score to 1-2 and state "Insufficient evidence in transcript."
- Do NOT invent quotes or events.
- The overall_score MUST be the arithmetic mean of the 12 dimension scores, rounded to 2 decimal places.

Return a JSON object with exactly this structure:
{{
  "overall_score": <number>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<key strength 1>", "<key strength 2>", "<key strength 3>"],
  "improvement_areas": ["<area 1>", "<area 2>"],
  "recommendations": ["<recommendation 1>", "<recommendation 2>"],
  "dimensions": [
    {{
      "dimension": "<dimension name>",
      "score": <number 1-5>,
      "feedback": "<brief coaching feedback>",
      "evidence": "<transcript quote or 'Insufficient evidence in transcript.'>"
    }}
  ]
}}

The 12 dimensions (use these exact names):
{dim_list}

Transcript (truncated to 12000 chars):
{transcript[:12000]}
"""


def _validate_and_normalize(data: dict[str, Any]) -> EvaluationSchema:
    if not isinstance(data, dict):
        raise ValueError("AI returned non-dict JSON.")

    raw_dimensions = data.get("dimensions")
    if not isinstance(raw_dimensions, list) or len(raw_dimensions) != 12:
        raise ValueError(f"Expected exactly 12 dimensions, got {len(raw_dimensions) if isinstance(raw_dimensions, list) else 'non-list'}.")

    normalized_dims: list[DimensionSchema] = []
    seen_names: set[str] = set()
    scores: list[float] = []

    for raw in raw_dimensions:
        if not isinstance(raw, dict):
            raise ValueError("Dimension entry is not a dict.")
        dim_name = raw.get("dimension")
        if not dim_name or dim_name not in DIMENSIONS:
            raise ValueError(f"Invalid dimension name: {dim_name}")
        if dim_name in seen_names:
            raise ValueError(f"Duplicate dimension: {dim_name}")
        seen_names.add(dim_name)

        score = float(raw.get("score", 3))
        if not (1 <= score <= 5):
            raise ValueError(f"Score out of range for {dim_name}: {score}")
        scores.append(score)

        normalized_dims.append(
            DimensionSchema(
                dimension=dim_name,
                score=score,
                feedback=str(raw.get("feedback", "")).strip() or "No feedback provided.",
                evidence=str(raw.get("evidence", "")).strip() or "Insufficient evidence in transcript.",
            )
        )

    overall = float(data.get("overall_score", 0))
    expected_overall = round(sum(scores) / len(scores), 2)
    if abs(overall - expected_overall) > 0.02:
        raise ValueError(
            f"overall_score {overall} does not match dimension average {expected_overall}."
        )

    return EvaluationSchema(
        overall_score=expected_overall,
        summary=str(data.get("summary", "")).strip() or "No summary provided.",
        strengths=[str(s).strip() for s in data.get("strengths", []) if str(s).strip()] or ["No specific strengths identified."],
        improvement_areas=[str(s).strip() for s in data.get("improvement_areas", []) if str(s).strip()] or ["No specific improvement areas identified."],
        recommendations=[str(s).strip() for s in data.get("recommendations", []) if str(s).strip()] or ["No specific recommendations provided."],
        dimensions=normalized_dims,
    )


def mock_evaluation(call_type: str = "coaching") -> dict:
    import random

    scores = [round(random.uniform(2.5, 5.0), 1) for _ in DIMENSIONS]
    overall = round(sum(scores) / len(scores), 2)
    return {
        "overall_score": overall,
        "summary": "This is a mock evaluation result. Configure OPENAI_API_KEY for live AI evaluation.",
        "strengths": [
            "Demonstrated consistent engagement throughout the call.",
            "Built good rapport with the client.",
        ],
        "improvement_areas": [
            "Could strengthen closing and next-step clarity.",
            "More structured agenda setting would improve outcomes.",
        ],
        "recommendations": [
            "Use a brief agenda check-in at the start of each session.",
            "Assign one concrete action item before closing.",
        ],
        "dimensions": [
            {
                "dimension": dim,
                "score": score,
                "feedback": "Mock feedback for demonstration purposes.",
                "evidence": "",
            }
            for dim, score in zip(DIMENSIONS, scores)
        ],
    }
