from django.db import models

from django import forms

# Create your models here.
class LoginForm(forms.Form):
    username =  forms.CharField(label="Username")
    password = forms.CharField(max_length=128, null=False, blank=False)

    def __str__(self):
        """this sets the default return for this object"""
        return self.description