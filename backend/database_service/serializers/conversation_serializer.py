from rest_framework import serializers
from database_service.models import Conversation

class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        exclude = ['u_id', 'c_rawmessages']
        
class ConversationHeaderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        exclude = ['u_id', 'c_messages', 'c_rawmessages']

class ConversationSearchSerializer(serializers.ModelSerializer):
    headline = serializers.CharField(read_only=True)

    class Meta:
        model = Conversation
        fields = [
            'c_id',
            'c_name',
            'c_created_at',
            'headline',
        ]
        read_only_fields = ['headline']
    