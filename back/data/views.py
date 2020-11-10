from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Data
import json

# Create your views here.
@csrf_exempt
def index(request):
    if request.method == 'GET':
        all_data = [data for data in Data.objects.all().values()]
        return JsonResponse(all_data, safe=False)
    else:
        return HttpResponse('this is infovis Project team A')
