from pydantic import BaseModel, Field

class Category(BaseModel):
    cat_id: int = Field(..., title="Category ID")
