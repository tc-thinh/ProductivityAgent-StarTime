from django.shortcuts import render
from django.http import HttpResponse
from .prompts import prompts

# Create your views here.
def home(request):
    return HttpResponse("Hello, this is the AGENT SERVICE for the StarTime project!")
