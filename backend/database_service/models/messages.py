from django.db import models
from database_service.models.conversations import Conversation

class Message(models.Model):
    m_id = models.AutoField(primary_key=True)
    c_id = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    m_role = models.CharField(max_length=50)
    m_content = models.TextField()

    m_raw = models.TextField()
    m_created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.m_role + " - " + self.m_content
