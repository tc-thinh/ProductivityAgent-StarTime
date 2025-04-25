from pydantic import BaseModel


class ConversationHeader(BaseModel):
    c_id: int
