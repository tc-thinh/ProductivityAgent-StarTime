from django.urls import re_path
from database_service import consumers

websocket_urlpatterns = [
    re_path(r'ws/conversation/(?P<conversationId>\d+)/$', consumers.ConversationUpdatesWebSocket.as_asgi()),
]
