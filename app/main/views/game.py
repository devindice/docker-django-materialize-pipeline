from django.shortcuts import render

# Create your views here.

def home(request):
    return render(request, 'home.html', {})
    
def index(request):
    return render(request, 'index.html')
    
def game(request, room_name):
    return render(request, 'game.html', {
        'room_name': room_name
    })


#class Index(View):
#    def get(self, request):
#        return render(request, 'main/index.html')

#class Room(View):
#    def get(self, request, room_name):
#        return render(request, 'main/room.html', {'room_name': room_name})