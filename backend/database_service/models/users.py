import uuid
from django.db import models

class User(models.Model):  
    u_id = models.UUIDField(default=uuid.uuid4, primary_key=True)  
    u_email = models.EmailField(unique=True)  
    u_google_auth = models.JSONField(default=dict)  

    def __str__(self):
        return f"{self.u_id}"
