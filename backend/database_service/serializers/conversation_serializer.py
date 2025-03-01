from rest_framework import serializers
from database_service.models import Conversation

class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = '__all__'
        