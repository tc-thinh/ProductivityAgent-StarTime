from django.urls import re_path
from database_service import consumers

websocket_urlpatterns = [
    re_path(r'ws/section/(?P<id>\d+)/$', consumers.SectionUpdatesWebSocket.as_asgi()),
]
