import fastapi


router = fastapi.APIRouter(prefix="/ai", tags=["ai"])


@router.get("/healthcheck", response_model=bool)
async def healthcheck() -> bool:
    """
    Healthcheck endpoint to verify if the AI service is running.

    Returns:
        bool: Always returns True.
    """
    return True
