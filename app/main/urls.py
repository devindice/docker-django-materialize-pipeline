from django.urls import path
from main import views

siteName = "Site Name"

urlpatterns = [
    path('', views.home, name='home'),
    path('home', views.home, name='home'),
]