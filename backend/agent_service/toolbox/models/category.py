from pydantic import BaseModel, Field

class AgentCategory(BaseModel):
    cat_id: int = Field(..., title="Category ID")
