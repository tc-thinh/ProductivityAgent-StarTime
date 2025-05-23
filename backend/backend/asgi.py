import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
import django
django.setup()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from django.contrib.staticfiles.handlers import ASGIStaticFilesHandler
import database_service.routing

application = ProtocolTypeRouter({
    "http": ASGIStaticFilesHandler(
        get_asgi_application()
    ),
    "websocket": AuthMiddlewareStack(
        URLRouter(database_service.routing.websocket_urlpatterns)
    ),
})
