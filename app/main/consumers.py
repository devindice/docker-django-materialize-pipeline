import json
from time import sleep
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
import asyncio

global gameRooms
gameRooms = {}

class WSconsumer(AsyncWebsocketConsumer):
    async def async_foo(self):
        if self.room_group_name not in gameRooms.keys():
            gameRooms[self.room_group_name] = {
                'type': 'json',
                'mode': None,
                'judgeCard': None,
                'timer': 0,
                'roundCards': None,
                'winner': None,
                'players': None,
                'judge': None,
            }
            count = 0
            while True:
                gameRooms[self.room_group_name]['timer'] += 1
                print("Room: %s; Timer: %s" % (self.room_group_name, gameRooms.get(self.room_group_name).get('timer')))
                await asyncio.sleep(1)
                # Broadcast to the group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'json',
                        'message': gameRooms.get(self.room_group_name)
                    }
                )
    
        
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'room_%s' % self.room_name

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        #await self.test()
        
        # Reply to the user connecting
        await self.send(text_data=json.dumps({
            'message': {'message': "Welcome! You have joined the room"}
        }))
        
        # Broadcast to the group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'json',
                'message': {'message': "A new user has joined"}
            }
        )
    
        asyncio.ensure_future(self.async_foo())
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'json',
                'message': message
            }
        )
        
    async def json(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))