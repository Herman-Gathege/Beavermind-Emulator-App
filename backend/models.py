from sqlalchemy import Column, String, DateTime, Text, Enum as SQLEnum, Numeric, ForeignKey, UUID
from sqlalchemy.sql import func
import uuid
import enum

class CallType(str, enum.Enum):
    sales = "sales"
    kickoff = "kickoff"
    coaching = "coaching"
    strategic_review = "strategic_review"

class CallStatus(str, enum.Enum):
    pending = "pending"
    evaluated = "evaluated"
    failed = "failed"
