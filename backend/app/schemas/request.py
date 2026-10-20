from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class Platform(str, Enum):
    linkedin = "linkedin"
    medium = "medium"
    substack = "substack"


class Tone(str, Enum):
    technical = "technical"
    storytelling = "storytelling"
    casual = "casual"
    eli5 = "eli5"


class GenerateRequest(BaseModel):
    platform: Platform
    topic: str
    context: str = ""
    tone: Tone = Tone.technical
    include_hashtags: bool = True
    include_code: bool = True
    tags: list[str] = Field(default_factory=list)
    code_notes: str = ""
    refinement: Optional[str] = None
