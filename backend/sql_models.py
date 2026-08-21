from sqlalchemy import Column, String, DateTime, Text, Numeric, ForeignKey, UUID, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from database import Base
from models import CallType, CallStatus

class Coach(Base):
    __tablename__ = "coaches"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    specialty = Column(String, nullable=False)
    bio = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    programs = relationship("Program", back_populates="coach")
    calls = relationship("Call", back_populates="coach")

class Client(Base):
    __tablename__ = "clients"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    organization = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    programs = relationship("Program", back_populates="client")
    calls = relationship("Call", back_populates="client")

class Program(Base):
    __tablename__ = "programs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    coach_id = Column(UUID(as_uuid=True), ForeignKey("coaches.id"), nullable=False)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    coach = relationship("Coach", back_populates="programs")
    client = relationship("Client", back_populates="programs")
    calls = relationship("Call", back_populates="program")

class Call(Base):
    __tablename__ = "calls"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    coach_id = Column(UUID(as_uuid=True), ForeignKey("coaches.id"), nullable=False)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False)
    program_id = Column(UUID(as_uuid=True), ForeignKey("programs.id"), nullable=False)
    type = Column(SQLEnum(CallType), nullable=False)
    title = Column(String, nullable=False)
    scheduled_at = Column(DateTime(timezone=True), server_default=func.now())
    transcript = Column(Text)
    status = Column(SQLEnum(CallStatus), default=CallStatus.pending)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    coach = relationship("Coach", back_populates="calls")
    client = relationship("Client", back_populates="calls")
    program = relationship("Program", back_populates="calls")
    evaluation = relationship("Evaluation", back_populates="call", uselist=False)

class Evaluation(Base):
    __tablename__ = "evaluations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    call_id = Column(UUID(as_uuid=True), ForeignKey("calls.id"), nullable=False)
    overall_score = Column(Numeric(3, 2))
    summary = Column(Text)
    strengths = Column(Text)
    improvement_areas = Column(Text)
    recommendations = Column(Text)
    raw_response = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    call = relationship("Call", back_populates="evaluation")
    dimension_scores = relationship("DimensionScore", back_populates="evaluation", cascade="all, delete-orphan")

class DimensionScore(Base):
    __tablename__ = "dimension_scores"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evaluation_id = Column(UUID(as_uuid=True), ForeignKey("evaluations.id"), nullable=False)
    dimension = Column(String, nullable=False)
    score = Column(Numeric(3, 2), nullable=False)
    feedback = Column(Text)
    evidence = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    evaluation = relationship("Evaluation", back_populates="dimension_scores")
