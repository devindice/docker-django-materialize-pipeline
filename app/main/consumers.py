import json
from time import sleep
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
import asyncio
import random
from copy import deepcopy as copy

global gameRooms
gameRooms = {}

class WSconsumer(AsyncWebsocketConsumer):
    async def startServer(self):
        if self.room_group_name not in gameRooms.keys():
            intList = []
            for i in range(1, 101): 
                intList.append({'id':i, 'cardTitle': i, 'cardDescription': 'Description'})
            playerDeck = intList
            dealerDeck = intList
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
                'playerDeck': intList,
                'dealerDeck': intList
            }
            count = 0
            timeout = 0
            print(f"New Game: {self.room_group_name}")
            while timeout < 300:
                gameRooms[self.room_group_name]['timer'] += 1
                if gameRooms.get(self.room_group_name).get('players'):
                    players = 0
                    playerStats = ""
                    for player in gameRooms.get(self.room_group_name).get('players').keys():
                        if gameRooms.get(self.room_group_name).get('players').get(player).get('status') != 'offline':
                            #playerStats += f" {player}({gameRooms.get(self.room_group_name).get('players').get(player).get('score')})"
                            players += 1
                            timeout = 0

                    if players != 0:
                        # Print Room Details
                        mode = gameRooms.get(self.room_group_name).get('mode')
                        timer = gameRooms.get(self.room_group_name).get('timer')
                        roundCards = gameRooms.get(self.room_group_name).get('roundCards')
                        players = ""
                        for player in gameRooms.get(self.room_group_name).get('players').keys():
                            score = gameRooms.get(self.room_group_name).get('players').get(player).get('score')
                            players += f"{player}({score}) "
                        #print(f"{self.room_group_name}: Mode: {mode}; Timer: {timer}; Players: {players}")
                    else:
                        timeout += 1
                        print(f"{self.room_group_name} has no players, Timeout: {timeout}")

                else:
                    timeout += 1
                    print(f"{self.room_group_name} has no players, Timeout: {timeout}")
                await asyncio.sleep(1)
                # Broadcast sanitized data to the group
                message = copy(gameRooms.get(self.room_group_name))
                del message['playerDeck']
                del message['dealerDeck']
                for player in message.get('players'):
                    del message['players'][player]['cards']
                print(message)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'json',
                        'message': message
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
        if message.get('player'):
            self.player = message.get('player').get('name')
            self.cards = message.get('player').get('cards')
            
            #Dont do this
            #print(f"{self.player} cards")
            # add cards if needed
            
            # Instead, send the player their cards every time
            
            # Check if user type = new
            # Check if user exists, add if not, else reject new user
            if gameRooms.get(self.room_group_name).get('players').get(self.player) == None:
                print(f"New player: {self.player}")
                gameRooms[self.room_group_name]['players'][self.player] = {'score': 0, 'cards': [], 'status': 'new'}
            
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
            await self.send(text_data=json.dumps({
                'message': {'cards': gameRooms.get(self.room_group_name).get('players').get(self.player).get('cards')}
            }))
            
            
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