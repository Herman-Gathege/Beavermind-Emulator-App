import json
import os
from config import get_settings
import httpx

settings = get_settings()

DIMENSIONS = [
    "Active Listening",
    "Goal Alignment",
    "Question Quality",
    "Empathy & Rapport",
    "Solution Framing",
    "Accountability Setup",
    "Progress Tracking",
    "Obstacle Navigation",
    "Client Autonomy",
    "Feedback Delivery",
    "Next Steps Clarity",
    "Time Management",
]

def run_evaluation(transcript: str) -> dict:
    if not settings.OPENAI_API_KEY:
        return mock_evaluation()

    prompt = f"""
You are an expert coaching evaluator. Evaluate the following coaching call transcript against 12 dimensions.
Return a JSON object with this exact structure:
{{
  "overall_score": <number 1-5>,
  "summary": "<brief narrative summary>",
  "dimensions": [
    {{
      "dimension": "<dimension name>",
      "score": <number 1-5>,
      "feedback": "<brief feedback>",
      "evidence": "<quote from transcript>"
    }}
  ]
}}

The 12 dimensions are:
{', '.join(DIMENSIONS)}

Transcript:
{transcript[:8000]}
"""

    try:
        with httpx.Client(timeout=60.0) as client:
            resp = client.post(
                f"{settings.OPENAI_BASE_URL}/chat/completions",
                headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                json={
                    "model": settings.OPENAI_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "response_format": {"type": "json_object"}
                }
            )
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
            data = json.loads(content)
            data["dimensions"] = _enforce_dimensions(data.get("dimensions", []))
            return data
    except Exception:
        return mock_evaluation()

def _enforce_dimensions(dimensions):
    result = []
    for dim in DIMENSIONS:
        match = next((d for d in dimensions if d.get("dimension", "").lower() == dim.lower()), None)
        if match:
            result.append({
                "dimension": dim,
                "score": float(match.get("score", 3)),
                "feedback": match.get("feedback", ""),
                "evidence": match.get("evidence", "")
            })
        else:
            result.append({
                "dimension": dim,
                "score": 3.0,
                "feedback": "No specific evidence observed.",
                "evidence": ""
            })
    return result

def mock_evaluation() -> dict:
    import random
    scores = [round(random.uniform(2.5, 5.0), 1) for _ in DIMENSIONS]
    overall = round(sum(scores) / len(scores), 2)
    return {
        "overall_score": overall,
        "summary": "This is a mock evaluation result. Configure OPENAI_API_KEY for live AI evaluation.",
        "dimensions": [
            {
                "dimension": dim,
                "score": score,
                "feedback": "Mock feedback for demonstration purposes.",
                "evidence": ""
            }
            for dim, score in zip(DIMENSIONS, scores)
        ]
    }
