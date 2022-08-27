from django.urls import path
from main import views

urlpatterns = [
    #path('', Index.as_view(), name='index'),
    path('', views.index, name='index'),
    path('game/<str:room_name>/', views.game, name='game'),
    path('home', views.home, name='home'),
]