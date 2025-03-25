from django.db import models
from django.utils import timezone
from database_service.models.users import User

class Conversation(models.Model):
    c_id = models.AutoField(primary_key=True)
    u_id = models.ForeignKey(User, on_delete=models.CASCADE)
    c_name = models.CharField(max_length=50, default="Untitled")
    c_deleted = models.BooleanField(default=False)
    c_created_at = models.DateTimeField(default=timezone.now)
    c_messages = models.JSONField(default=list)

    def __str__(self):
        return self.c_name
    