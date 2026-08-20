from sqlalchemy.orm import Session
from sqlalchemy import select
from models import Coach, Client, Program, Call, CallType, CallStatus
from datetime import datetime, timedelta
import uuid

def seed_data(db: Session):
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
    ]

    calls = []
    for i, program in enumerate(programs[:8]):
        call_type = list(CallType)[i % len(CallType)]
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
    db.commit()
