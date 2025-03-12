from django.db import models

class UserInfo(models.Model):
    i_id = models.AutoField(primary_key=True)
    i_name = models.CharField(max_length=50)
    i_description = models.CharField(max_length=200)
    i_value = models.IntegerField()
    i_embeddings = models.BinaryField()

    def __str__(self):
        return self.i_name + " - " + self.i_description + " - " + str(self.i_value)
