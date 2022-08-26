from django.urls import re_path
from .consumers import WSconsumer

websocket_urlpatterns = [
    re_path(r'ws/status/(?P<room_name>\w+)/$', WSconsumer.as_asgi())
    ]