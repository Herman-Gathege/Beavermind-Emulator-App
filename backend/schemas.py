from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from models import CallType, CallStatus

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
    created_at: datetime
    dimension_scores: List[DimensionScore] = []

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_calls: int
    evaluated: int
    pending: int
    avg_score: Optional[float]
