import os
import json
from uuid import uuid4
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional

app = FastAPI()

# --- CORS ---
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Файл атауы ---
POLLS_FILE = "polls.json"

# --- Моделдер ---
class PollOptionModel(BaseModel):
    label: str
    votes: int = 0

class PollModel(BaseModel):
    id: str
    question: str
    options: Dict[str, PollOptionModel]

class PollCreateRequest(BaseModel):
    question: str
    options: List[str]

# --- Файлдан оқу/жазу ---
def load_polls() -> Dict[str, PollModel]:
    if os.path.exists(POLLS_FILE):
        with open(POLLS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return {pid: PollModel(**poll) for pid, poll in data.items()}
    return {}

def save_polls():
    with open(POLLS_FILE, "w", encoding="utf-8") as f:
        json.dump({pid: poll.dict() for pid, poll in polls.items()}, f, ensure_ascii=False, indent=2)

# --- Жадыдағы база ---
polls: Dict[str, PollModel] = load_polls()

def get_latest_poll() -> Optional[PollModel]:
    if not polls:
        return None
    return list(polls.values())[-1]

# --- API ---
@app.get("/api/poll", response_model=PollModel)
async def get_poll_data():
    poll = get_latest_poll()
    if not poll:
        raise HTTPException(status_code=404, detail="No polls found")
    return poll

@app.post("/api/poll/vote/{option_key}", response_model=PollModel)
async def cast_vote(option_key: str):
    poll = get_latest_poll()
    if not poll:
        raise HTTPException(status_code=404, detail="No polls found")
    if option_key not in poll.options:
        raise HTTPException(status_code=404, detail="Option not found")
    poll.options[option_key].votes += 1
    save_polls()
    return poll

@app.post("/api/poll/create", response_model=PollModel)
async def create_poll(req: PollCreateRequest):
    poll_id = str(uuid4())
    options = {str(i): PollOptionModel(label=label) for i, label in enumerate(req.options)}
    poll = PollModel(id=poll_id, question=req.question, options=options)
    polls[poll_id] = poll
    save_polls()
    return poll