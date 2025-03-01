from rest_framework import serializers
from database_service.models import ToolCall

class ToolCallSerializer(serializers.ModelSerializer):
    class Meta:
        model = ToolCall
        fields = '__all__'
        