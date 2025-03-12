from django.db import models
from database_service.models.messages import Message

class ToolCall(models.Model):
    tc_id = models.AutoField(primary_key=True)
    tc_name = models.CharField(max_length=50)
    tc_arguments = models.JSONField(default=dict)
    m_id = models.ForeignKey(Message, on_delete=models.CASCADE)
    tc_result = models.JSONField(default=dict)

    def __str__(self):
        return self.tc_id + self.tc_name + self.tc_arguments
    