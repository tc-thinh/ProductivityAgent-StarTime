from rest_framework import serializers
from database_service.models import Conversation

class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        exclude = ['u_id']
        
class ConversationHeaderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        exclude = ['u_id', 'c_messages']
