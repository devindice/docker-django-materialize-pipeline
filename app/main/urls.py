from django.urls import path
from main import views

urlpatterns = [
    #path('', Index.as_view(), name='index'),
    path('', views.index, name='index'),
    path('<str:room_name>/', views.room, name='room'),
    path('home', views.home, name='home'),
]