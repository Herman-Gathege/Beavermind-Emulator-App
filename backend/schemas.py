from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, List, Any
from uuid import UUID
from models import CallType, CallStatus
import json

class CoachBase(BaseModel):
    name: str
    specialty: str
    bio: Optional[str] = None

class Coach(CoachBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class ClientBase(BaseModel):
    name: str
    organization: Optional[str] = None

class Client(ClientBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class ProgramBase(BaseModel):
    name: str
    coach_id: UUID
    client_id: UUID

class Program(ProgramBase):
    id: UUID
    created_at: datetime
    coach: Coach
    client: Client

    class Config:
        from_attributes = True

class CallBase(BaseModel):
    coach_id: UUID
    client_id: UUID
    program_id: UUID
    type: CallType
    title: str
    transcript: Optional[str] = None
    status: CallStatus = CallStatus.pending

class Call(CallBase):
    id: UUID
    scheduled_at: datetime
    created_at: datetime
    coach: Coach
    client: Client
    program: Program

    class Config:
        from_attributes = True

class DimensionScoreBase(BaseModel):
    dimension: str
    score: float
    feedback: Optional[str] = None
    evidence: Optional[str] = None

class DimensionScore(DimensionScoreBase):
    id: UUID
    evaluation_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class EvaluationBase(BaseModel):
    call_id: UUID

class Evaluation(EvaluationBase):
    id: UUID
    overall_score: Optional[float]
    summary: Optional[str]
    strengths: Optional[List[str]] = []
    improvement_areas: Optional[List[str]] = []
    recommendations: Optional[List[str]] = []
    created_at: datetime
    dimension_scores: List[DimensionScore] = []

    @field_validator("strengths", "improvement_areas", "recommendations", mode="before")
    @classmethod
    def parse_json_list(cls, v: Any) -> List[str]:
        if v is None:
            return []
        if isinstance(v, list):
            return [str(item) for item in v]
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return []
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return [str(item) for item in parsed]
            except json.JSONDecodeError:
                return [v]
        return []

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_calls: int
    evaluated: int
    pending: int
    avg_score: Optional[float]
    total_coaches: int
