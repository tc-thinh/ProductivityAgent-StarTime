import fastapi
from fastapi import HTTPException, BackgroundTasks
import httpx
from src.config.manager import settings
from loguru import logger

from src.agents.utilities.time_calculation_agent import TimeCalculationAgent
from src.agents.calendar.calendar_orchestrator import CalendarOrchestrator
from src.models.response_models.ai import ConversationHeader
from src.models.payload_models.ai import ConversationRequestBody


router = fastapi.APIRouter(prefix="/ai", tags=["ai"])

@router.get("/healthcheck", response_model=bool)
async def healthcheck() -> bool:
    """
    Healthcheck endpoint to verify if the AI service is running.

    Returns:
        bool: Always returns True.
    """
    logger.info("Healthcheck endpoint called")
    return True

@router.get("/time_calculation_agent", response_model=str)
async def time_calculation_agent(prompt: str) -> str:
    """
    Endpoint to get the time calculation agent.

    Returns:
        str: The time calculation agent.
    """
    logger.info(f"Time calculation agent called with prompt: '{prompt[:50]}...'")
    agent = TimeCalculationAgent()
    try:
        result = await agent.process(prompt)
        logger.info("Time calculation agent processing successful")
        return result
    except Exception as e:
        logger.exception("Error during time calculation agent processing") 
        raise HTTPException(status_code=500, detail="Error processing time calculation request")

@router.post("/request", response_model=ConversationHeader)
async def new_conversation(
    payload: ConversationRequestBody,
    background_tasks: BackgroundTasks # Inject BackgroundTasks
):
    """
    Creates a new conversation by calling the database service.
    """
    logger.info(f"Received new conversation request for u_id: {payload.u_id}")

    c_id = None
    database_service_url = f"{settings.DATABASE_SERVICE}/conversations/"
    request_body = {"token": payload.u_id}

    async with httpx.AsyncClient() as client:
        try:
            logger.info(f"Sending POST request to {database_service_url} with data: {request_body}")
            response = await client.post(
                database_service_url,
                json=request_body
            )
            response.raise_for_status() 

            response_data = response.json() 
            logger.info(f"Received successful response from database service: Status={response.status_code}, Data={response_data}")

            c_id = response_data.get("c_id")
            if not c_id:
                 logger.error(f"Database service response did not contain 'c_id'. Response: {response_data}")
                 raise HTTPException(status_code=500, detail="Internal server error: Failed to retrieve conversation ID from database service.")

            logger.info(f"Successfully created conversation with c_id: {c_id}")

            agent = CalendarOrchestrator(
                user_id=payload.u_id,
                timezone=payload.ianaTimezone,
                google_refresh_token=payload.google_refresh_token
            )
            background_tasks.add_task(agent.process, prompt=payload.userPrompt)

        except httpx.RequestError as exc:
            logger.error(f"HTTP RequestError occurred while requesting {exc.request.url!r}: {exc}")
            raise HTTPException(status_code=503, detail=f"Database service unavailable: {exc}")
        except httpx.HTTPStatusError as exc:
            logger.error(f"HTTP StatusError response {exc.response.status_code} while requesting {exc.request.url!r}.")
            try:
                error_details = exc.response.json()
                logger.error(f"Database service error response body: {error_details}")
            except Exception: 
                error_details = exc.response.text
                logger.error(f"Database service error response text: {error_details}")

            raise HTTPException(status_code=exc.response.status_code, detail=f"Error from database service: {error_details}")
        except Exception as exc:
            logger.exception("An unexpected error occurred during new conversation creation.") # Logs the full traceback
            raise HTTPException(status_code=500, detail="An internal server error occurred.")

    return ConversationHeader(c_id=c_id)
