from django.db import models
from django.utils import timezone

class Conversation(models.Model):
    c_id = models.AutoField(primary_key=True)
    c_name = models.CharField(max_length=50, default="Untitled")
    c_deleted = models.BooleanField(default=False)
    c_created_at = models.DateTimeField(default=timezone.now)
    c_messages = models.JSONField(default=list)

    def __str__(self):
        return self.c_name
    