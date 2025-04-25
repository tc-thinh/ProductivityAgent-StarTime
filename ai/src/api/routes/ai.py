import fastapi
from src.agents.utilities.time_calculation_agent import TimeCalculationAgent


router = fastapi.APIRouter(prefix="/ai", tags=["ai"])

@router.get("/healthcheck", response_model=bool)
async def healthcheck() -> bool:
    """
    Healthcheck endpoint to verify if the AI service is running.

    Returns:
        bool: Always returns True.
    """
    return True

@router.get("/time_calculation_agent", response_model=str)
async def time_calculation_agent(prompt: str) -> str:
    """
    Endpoint to get the time calculation agent.

    Returns:
        str: The time calculation agent.
    """
    agent = TimeCalculationAgent()
    result = await agent.process(prompt)
    return result
