import fastapi

from src.api.routes.ai import router as ai_router


router = fastapi.APIRouter()

router.include_router(router=ai_router)
