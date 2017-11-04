from django.db import models

from django.contrib.auth.models import User

# Create your models here.
class Login(models.Model):
    user =  models.ForeignKey(User, null=True, blank=True)
    password = models.CharField(max_length=128, null=False, blank=False)

    def __str__(self):
        """this sets the default return for this object"""
        return self.description