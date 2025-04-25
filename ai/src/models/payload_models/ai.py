from pydantic import BaseModel
from typing import List


class ConversationRequestBody(BaseModel):
    u_id: str
    userPrompt: str
    images: List[str]
    ianaTimezone: str
    google_refresh_token: str
