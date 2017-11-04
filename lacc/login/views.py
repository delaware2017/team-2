from django.shortcuts import render
from django.http import HttpResponse
from django import forms

def ShowLogin(request, name):
	print("name: " + name)
	return render(request, "login/login.html")

