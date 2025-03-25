from rest_framework import serializers
from database_service.models import Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        exclude = ['u_id']
        