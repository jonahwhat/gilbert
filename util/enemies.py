import random
import uuid


# send enemy update socket from server, this would trigger an attack animation and also damage gilbert at the same time
# TODO
# function that takes gilbert's level and creates an enemy
def spawn_enemy(gilbert_level):

    rat = {
    "name": "Rat",
    "description": "a giant rat! medium attack speed",
    "emoji": "🐀",
    "level": 1,
    "health": 5,
    "damage_to_gilbert": 1,
    "seconds_til_attack": 5, 
    "attack_seconds": 5,
    "item_drops": {"health_potion" : 1},
    "gold_drop": 10,
    "xp_drop": random.randint(1, 3),
    "id": str(uuid.uuid4()),
    "top": random.randint(1, 75),
    "left": random.randint(1, 80),
    "alive": True,
    }

    spider = {
    "name": "Spider",
    "description": "a giant spider! slow attack speed",
    "emoji": "🕷",
    "level": 1,
    "health": 7,
    "damage_to_gilbert": 3,
    "seconds_til_attack": 2, 
    "attack_seconds": 7,
    "item_drops": {"health_potion" : 1},
    "gold_drop": 25,
    "xp_drop": random.randint(5, 10),
    "id": str(uuid.uuid4()),
    "top": random.randint(1, 75),
    "left": random.randint(1, 80),
    "alive": True,
    }

    mouse = {
    "name": "Mouse",
    "description": "a baby mouse, fast attack speed!",
    "emoji": "🐁",
    "level": 1,
    "health": 2,
    "damage_to_gilbert": 1,
    "seconds_til_attack": 1, 
    "attack_seconds": 2,
    "item_drops": {"health_potion" : 1},
    "gold_drop": 12,
    "xp_drop": random.randint(2, 6),
    "id": str(uuid.uuid4()),
    "top": random.randint(1, 75),
    "left": random.randint(1, 80),
    "alive": True,
    }

    snake = {
    "name": "Snake",
    "description": "a garden snake, medium attack speed!",
    "emoji": "🐍",
    "level": 1,
    "health": 6,
    "damage_to_gilbert": 2,
    "seconds_til_attack": 3, 
    "attack_seconds": 7,
    "item_drops": {"health_potion" : 1},
    "gold_drop": random.randint(10, 20),
    "xp_drop": random.randint(10, 12),
    "id": str(uuid.uuid4()),
    "top": random.randint(1, 75),
    "left": random.randint(1, 80),
    "alive": True,
    }

    if random.randint(0,1):
        return rat
    elif random.randint(0,1):
        return mouse
    elif random.randint(0,1):
        return snake
    else:
        return spider
    