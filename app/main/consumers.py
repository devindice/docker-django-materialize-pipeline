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
                'players': {},
                'judge': None,
            }
            count = 0
            timeout = 0
            while timeout < 300:
                gameRooms[self.room_group_name]['timer'] += 1
                print(gameRooms.get(self.room_group_name))
                if gameRooms.get(self.room_group_name).get('players'):
                    players = 0
                    for player in gameRooms.get(self.room_group_name).get('players').keys():
                        if gameRooms.get(self.room_group_name).get('players').get(player).get('state') == 'active':
                            players += 1
                            timeout = 0
                    if players == 0:
                        timeout += 1
                        
                    print("Timeout: %s" % timeout)
                        
                else:
                    print('no players')
                    timeout += 1
                    print("Timeout: %s" % timeout)
                await asyncio.sleep(1)
                # Broadcast to the group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'json',
                        'message': gameRooms.get(self.room_group_name)
                    }
                )
            print("Game Ended")
    
        
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
        gameRooms[self.room_group_name]['players'][self.player]['state'] = 'offline'
    
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        if message.get('player'):
            print("Getting Player Info")
            self.player = message.get('player').get('name')
            gameRooms[self.room_group_name]['players'][self.player] = message.get('player')
            print(gameRooms.get(self.room_group_name).get('players'))
            print(self.player)

            # Reply to the user connecting
            await self.send(text_data=json.dumps({
                'message': {'message': "Player Connected: %s" % self.player}
            }))

        #await self.channel_layer.group_send(
        #    self.room_group_name,
        #    {
        #        'type': 'json',
        #        'message': message
        #    }
        #)
        
    async def json(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))