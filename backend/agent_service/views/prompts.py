from django.http import HttpResponse

def prompts(request):
    return HttpResponse("This is the prompts processing module for the Agent Service!")
