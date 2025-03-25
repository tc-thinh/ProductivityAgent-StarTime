from django.db import models
from database_service.models.users import User

class Category(models.Model):
    cat_id = models.AutoField(primary_key=True)
    cat_color_id = models.CharField(max_length=10)
    cat_title = models.CharField(max_length=50, default="", blank=True)
    cat_description = models.TextField(default="", blank=True)
    cat_background = models.CharField(max_length=50)
    cat_foreground = models.CharField(max_length=50)
    cat_active = models.BooleanField(default=False)
    cat_examples = models.JSONField(default=list)
    cat_event_prefix = models.CharField(max_length=12, default="", blank=True)
    u_id = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.p_name
    