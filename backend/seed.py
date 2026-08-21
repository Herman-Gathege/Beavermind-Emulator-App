from sqlalchemy.orm import Session
from sqlalchemy import select
from sql_models import Coach, Client, Program, Call, Evaluation, DimensionScore
from models import CallType, CallStatus
from database import Base, engine
from datetime import datetime, timedelta
import uuid
import random

def seed_data(db: Session):
    Base.metadata.create_all(bind=engine)
    if db.execute(select(Coach)).first():
        return

    coaches = [
        Coach(name="Alice M.", specialty="Executive Coaching", bio="15 years in leadership development."),
        Coach(name="James K.", specialty="Sales Performance", bio="Former VP of Sales turned coach."),
        Coach(name="Priya N.", specialty="Career Transitions", bio="Specializes in mid-career pivots."),
        Coach(name="David R.", specialty="Team Dynamics", bio="Agile and scaling team expert."),
        Coach(name="Sofia L.", specialty="Startup Strategy", bio="Helped 30+ startups find product-market fit."),
    ]
    db.add_all(coaches)
    db.flush()

    clients = [
        Client(name="TechCorp Inc.", organization="Technology"),
        Client(name="GreenField Ltd.", organization="Agriculture"),
        Client(name="FinEdge", organization="Financial Services"),
        Client(name="MediCare Plus", organization="Healthcare"),
        Client(name="EduFirst", organization="Education"),
        Client(name="BuildRight", organization="Construction"),
        Client(name="CloudNine", organization="SaaS"),
        Client(name="UrbanEats", organization="Food & Beverage"),
        Client(name="AutoDrive", organization="Automotive"),
        Client(name="SpaceLink", organization="Aerospace"),
    ]
    db.add_all(clients)
    db.flush()

    programs = []
    for i, client in enumerate(clients):
        coach = coaches[i % len(coaches)]
        programs.append(Program(name=f"Growth Program {i+1}", coach_id=coach.id, client_id=client.id))
    db.add_all(programs)
    db.flush()

    transcripts = [
        "Coach: Let's start with your main goal for this quarter.\nClient: I want to increase my team's velocity by 20%.\nCoach: What obstacles do you foresee?\nClient: Legacy code and onboarding time.\nCoach: How will you measure progress?\nClient: Weekly burndown charts and retrospective notes.",
        "Coach: What does success look like at the end of this engagement?\nClient: A clear go-to-market strategy.\nCoach: Who are your key stakeholders?\nClient: Marketing, sales, and product.\nCoach: Let's map their priorities.",
        "Coach: How are you feeling about the recent pivot?\nClient: Nervous but excited.\nCoach: What would make you feel more confident?\nClient: A clearer roadmap and faster feedback loops.\nCoach: Let's identify three experiments you can run this month.",
        "Coach: Walk me through your last sales call.\nClient: The prospect seemed interested but hesitant on pricing.\nCoach: How did you handle the objection?\nClient: I offered a tiered pricing model.\nCoach: Did you ask about their budget timeline?\nClient: Not yet, that's a good point.",
        "Coach: What's the biggest challenge your team faces right now?\nClient: Communication silos between engineering and design.\nCoach: Have you tried any sync mechanisms?\nClient: We have a weekly standup but it's not enough.\nCoach: Let's explore async documentation practices.",
        "Coach: How did the product launch go?\nClient: We hit 80% of our targets.\nCoach: What accounted for the gap?\nClient: Onboarding friction for new users.\nCoach: What's your plan to address that?\nClient: We're building a guided tutorial flow.",
        "Coach: Tell me about your leadership style.\nClient: I'd say I'm democratic but sometimes I need to be more directive.\nCoach: Can you give an example?\nClient: Last quarter I let the team debate too long on a deadline.\nCoach: How might you balance inclusion with decisiveness?\nClient: I could set a timer for debates and then decide.",
        "Coach: What's your vision for the next 12 months?\nClient: I want to double revenue while keeping the team under 50.\nCoach: What's your current burn rate?\nClient: About $180k/month.\nCoach: What's your runway?\nClient: 14 months if we stay flat.",
        "Coach: How do you currently handle customer feedback?\nClient: We collect it in a spreadsheet and review monthly.\nCoach: What's the lag time between feedback and action?\nClient: Usually 2-3 weeks.\nCoach: Could a real-time dashboard help?\nClient: Definitely, we're missing quick wins.",
        "Coach: Describe your ideal coaching engagement.\nClient: Someone who can challenge my assumptions and keep me accountable.\nCoach: What's one assumption you're holding onto?\nClient: That we need to hire more before we can scale.\nCoach: What if you optimized current capacity first?\nClient: That's uncomfortable but probably right.",
    ]

    call_types = list(CallType)
    calls = []
    for i, program in enumerate(programs):
        call_type = call_types[i % len(call_types)]
        scheduled = datetime.utcnow() - timedelta(days=30 - i*3)
        calls.append(Call(
            coach_id=program.coach_id,
            client_id=program.client_id,
            program_id=program.id,
            type=call_type,
            title=f"{call_type.value.title()} - {program.name}",
            scheduled_at=scheduled,
            transcript=transcripts[i % len(transcripts)],
            status=CallStatus.pending
        ))
    db.add_all(calls)
    db.flush()

    # Seed evaluations for the first 5 calls
    dim_names = [
        "Active Listening", "Goal Alignment", "Question Quality", "Empathy & Rapport",
        "Solution Framing", "Accountability Setup", "Progress Tracking", "Obstacle Navigation",
        "Client Autonomy", "Feedback Delivery", "Next Steps Clarity", "Time Management"
    ]

    for i, call in enumerate(calls[:5]):
        scores = [round(random.uniform(3.0, 5.0), 1) for _ in dim_names]
        overall = round(sum(scores) / len(scores), 2)
        evaluation = Evaluation(
            call_id=call.id,
            overall_score=overall,
            summary=f"Historical evaluation for call {i+1}. Strong performance across most dimensions with room for improvement in time management and obstacle navigation.",
            raw_response=""
        )
        db.add(evaluation)
        db.flush()
        for j, dim in enumerate(dim_names):
            score = DimensionScore(
                evaluation_id=evaluation.id,
                dimension=dim,
                score=scores[j],
                feedback=f"Demonstrated {dim.lower()} capabilities with minor opportunities for growth.",
                evidence=""
            )
            db.add(score)
        call.status = CallStatus.evaluated

    db.commit()
