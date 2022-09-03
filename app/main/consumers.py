import json
from time import sleep
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import asyncio
import random
from copy import deepcopy as copy

global gameRooms
gameRooms = {}

# Define Card Placeholder
intList = []
for i in range(1, 151): 
    intList.append({'id':i, 'cardTitle': i, 'cardDescription': 'Description'})
playerDeckMaster = copy(intList)
dealerDeckMaster = copy(intList)

class WSconsumer(AsyncWebsocketConsumer):
    async def startServer(self):
        #print(self)
        #print(self.channel_layer)
        if self.room_group_name not in gameRooms.keys():
            playerDeck = copy(playerDeckMaster)
            dealerDeck = copy(dealerDeckMaster)
            random.shuffle(playerDeck)
            random.shuffle(dealerDeck)
            
            gameRooms[self.room_group_name] = {
                'mode': 'play',
                'judgeCard': None,
                'timer': 0,
                'roundCards': None,
                'winner': None,
                'players': {},
                'judge': None,
                'playerDeck': playerDeck,
                'dealerDeck': dealerDeck
            }
            count = 0
            timeout = 0
            print(f"New Game: {self.room_group_name}")
            while timeout < 300:
                gameRooms[self.room_group_name]['timer'] += 1
                if gameRooms.get(self.room_group_name).get('players'):
                    players = 0
                    playerStats = ""
                    # Track Active Players
                    for player in gameRooms.get(self.room_group_name).get('players').keys():
                        if gameRooms.get(self.room_group_name).get('players').get(player).get('status') != 'offline':
                            players += 1
                            timeout = 0
                            # Broadcast data to individual users
                            channel_name = gameRooms.get(self.room_group_name).get('players').get(player).get('channel')
                            channel_layer = get_channel_layer()
                            cards = json.dumps(gameRooms.get(self.room_group_name).get('players').get(player).get('cards'))
                            print(f"Sending cards to {player}")
                            print(cards)
                           #await self.send(text_data=json.dumps({
                            await channel_layer.send(channel_name, {
                                'type': 'json',
                                'message': {'cards': cards}
                            })

                    # Tracking All players if one is active
                    if players != 0:
                        # Broadcast sanitized data to the group
                        players = copy(gameRooms.get(self.room_group_name).get('players'))
                        timer = gameRooms.get(self.room_group_name).get('timer')
                        for player in players:
                            del players[player]['cards']
                            del players[player]['channel']

                        await self.channel_layer.group_send(
                            self.room_group_name,
                            {
                                'type': 'json',
                                'message': 
                                    {
                                        'timer': timer, 
                                        'players': players,
                                        'playerDeckConsumed': len(gameRooms.get(self.room_group_name).get('playerDeck')) / len(playerDeckMaster),
                                        'dealerDeckConsumed': len(gameRooms.get(self.room_group_name).get('dealerDeck')) / len(dealerDeckMaster)
                                    }
                            }
                        )

                            
                    else:
                        timeout += 1
                        print(f"{self.room_group_name} has no players, Timeout: {timeout}")
                else:
                    timeout += 1
                    print(f"{self.room_group_name} has no players, Timeout: {timeout}")
                   
                # Loop wait
                await asyncio.sleep(1)
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
        #await self.send(text_data=json.dumps({
        #    'message': {'message': "Welcome! You have joined the room"}
        #}))
        
        # Broadcast to the group
        #await self.channel_layer.group_send(
        #    self.room_group_name,
        #    {
        #        'type': 'json',
        #        'message': {'message': "A new user has joined"}
        #    }
        #)
        
        # Run the startServer Function 
        asyncio.ensure_future(self.startServer())
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        gameRooms[self.room_group_name]['players'][self.player]['status'] = 'offline'
    
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        if message.get('playerConnection'):
            self.player = message.get('playerConnection').get('name')
            print(f"A player is trying to join as {self.player}")

            # Check if user is new
            if gameRooms.get(self.room_group_name).get('players').get(self.player) == None:
                print(f"New player: {self.player}")
                gameRooms[self.room_group_name]['players'][self.player] = {'score': 0, 'cards': [], 'status': 'new', 'channel': self.channel_name}
            # User Exists
            else:
                print("An existing user is attempting to join")
                # Existing user is Offline
                if gameRooms.get(self.room_group_name).get('players').get(self.player).get('status') == 'offline':
                    print(f'The existing user {self.player} is offline and is rejoining')
                    gameRooms[self.room_group_name]['players'][self.player]['channel'] = self.channel_name
                # Someone is trying to join as an active user
                else:
                    print(f'Someone is trying to join as {self.player} who is still active')
                
            
            # Set player status for receiving message
            gameRooms[self.room_group_name]['players'][self.player]['status'] = 'active'
            
            # Check player Cards, bring up if needed
            serverCards = len(gameRooms.get(self.room_group_name).get('players').get(self.player).get('cards'))
            print(f"{self.player} has {serverCards} cards.")
            print(f"Giving {self.player} {10 - serverCards} cards")
            
            # Send cards
            cards = []
            for i in range(0,10 - serverCards):
                cards.append(gameRooms.get(self.room_group_name).get('playerDeck').pop(0))
            gameRooms[self.room_group_name]['players'][self.player]['cards'] += cards
            # Reply to the user
            #await self.send(text_data=json.dumps({
            #    'message': {'cards': gameRooms.get(self.room_group_name).get('players').get(self.player).get('cards')}
            #}))
            
            
            print(gameRooms.get(self.room_group_name).get('players').get(self.player))



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