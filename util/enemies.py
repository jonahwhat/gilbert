import math
import random
import uuid


# send enemy update socket from server, this would trigger an attack animation and also damage gilbert at the same time
# function that takes gilbert's level and creates an enemy
def spawn_enemy(gilbert_level):

    amount_of_enemies = get_enemy_count(gilbert_level)
    enemy_dict = {}

    # random bonus enemy
    if random.randint(1,7) == 1:
        enemy = create_bonus(gilbert_level)
        enemy_dict[enemy["id"]] = enemy
        return enemy_dict
    
    
    # from level 1 to 5
    if gilbert_level >= 0:
        
        if random.randint(0,2):
            amount_of_enemies = max(1,min(amount_of_enemies, 8))
            for i in range(amount_of_enemies):
                mouse = create_mouse(gilbert_level)
                enemy_dict[mouse["id"]] = mouse


        else:
            amount_of_enemies = max(min(amount_of_enemies - 3, 5),1)
            for i in range(amount_of_enemies):
                rat = create_rat(gilbert_level)
                enemy_dict[rat["id"]] = rat

    if gilbert_level >= 5:
        # small chance to use the previous enemy batch, or generate a new one with different enemies
        if random.randint(0,6):
            # set enemies to zero
            enemy_dict = {}
        else:
            return enemy_dict

        # new enemy generation
        if random.randint(0,2):
            amount_of_enemies = max(1,min(amount_of_enemies - 2, 7))
            for i in range(amount_of_enemies):
                enemy = create_spider(gilbert_level)
                enemy_dict[enemy["id"]] = enemy

        elif random.randint(0,1):
            amount_of_enemies = max(1,min(amount_of_enemies + 2, 10))
            for i in range(amount_of_enemies):
                enemy = create_bat(gilbert_level)
                enemy_dict[enemy["id"]] = enemy

        else:
            amount_of_enemies = max(1,min(amount_of_enemies - 5, 5))
            for i in range(amount_of_enemies):
                enemy = create_snake(gilbert_level)
                enemy_dict[enemy["id"]] = enemy


    if gilbert_level >= 10:
        # small chance to use the previous enemy batch, or generate a new one with different enemies
        if random.randint(0,7):
            enemy_dict = {}
        else:
            return enemy_dict
        

        # new enemy generation
        if random.randint(1,4) == 1:
            amount_of_enemies = max(1,min(amount_of_enemies - 2, 7))
            for i in range(amount_of_enemies):
                enemy = create_shrimp(gilbert_level)
                enemy_dict[enemy["id"]] = enemy

        elif random.randint(1,4) == 1:
            amount_of_enemies = max(1,min(amount_of_enemies - 3, 5))
            for i in range(amount_of_enemies):
                enemy = create_jellyfish(gilbert_level)
                enemy_dict[enemy["id"]] = enemy

        elif random.randint(1,3) == 1:
            amount_of_enemies = max(1,min(amount_of_enemies - 5, 12))
            for i in range(amount_of_enemies):
                enemy = create_puffer(gilbert_level)
                enemy_dict[enemy["id"]] = enemy

        else:
            amount_of_enemies = max(1,min(amount_of_enemies - 10, 3))
            for i in range(amount_of_enemies):
                enemy = create_shark(gilbert_level)
                enemy_dict[enemy["id"]] = enemy
        

    return enemy_dict


# early game enemy, medium attack speed, deals more damage to gilbert
def create_rat(level):

    level_multiplier = get_level_multiplier(level)

    rat = {
    "name": "Rat",
    "description": "a giant rat! slow attack speed but strong!",
    "emoji": "🐀",
    "level": 3,
    "health": min(5,math.floor(4 * level_multiplier)),
    "damage_to_gilbert": 2,
    "seconds_til_attack": random.randint(5, 7), 
    "attack_seconds": 5,
    "item_drops": {"health_potion" : 1},
    "gold_drop": math.floor(5 * level_multiplier),
    "xp_drop": min(math.floor(random.randint(2, 6) * level_multiplier), 10),
    "health_drop": random.randint(0,2),
    "id": str(uuid.uuid4()),
    "top": random.randint(1, 75),
    "left": random.randint(1, 80),
    "alive": True,
    "attack_speed": 4,
    }

    return rat

# early game enemy, fast attack speed but very weak
def create_mouse(level):
    level_multiplier = get_level_multiplier(level)

    mouse = {
    "name": "Mouse",
    "description": "a baby mouse, fast attack speed!",
    "emoji": "🐁",
    "level": 1,
    "health": min(3,math.floor(1 * level_multiplier)),
    "damage_to_gilbert": 1,
    "seconds_til_attack": random.randint(2, 5), 
    "attack_seconds": 2,
    "item_drops": {"health_potion" : 1},
    "gold_drop": math.floor(2 * level_multiplier),
    "xp_drop":  min(math.floor(random.randint(1, 3) * level_multiplier), 5),
    "id": str(uuid.uuid4()),
    "top": random.randint(1, 75),
    "left": random.randint(1, 80),
    "alive": True,
    "attack_speed": 6,
    }

    return mouse

# bonus enemy intended as a breather
def create_bonus(level):
    level_multiplier = get_level_multiplier(level)

    treasure_bag = {
    "name": "Possessed Crown",
    "type": "bonus",
    "description": "a floating crown worth tons of gold!",
    "emoji": "👑",
    "level": 1,
    "health": 1,
    "damage_to_gilbert": 0,
    "seconds_til_attack": 1000, 
    "attack_seconds": 20,
    "item_drops": {"health_potion" : 1},
    "gold_drop": math.floor(12 * level_multiplier),
    "id": str(uuid.uuid4()),
    "top": random.randint(1, 75),
    "left": random.randint(1, 80),
    "alive": True,
    }

    health = {
    "name": "Broken Heart",
    "type": "bonus",
    "description": "a haunted heart full of health!",
    "emoji": "💔",
    "level": 1,
    "health": 1,
    "damage_to_gilbert": 0,
    "seconds_til_attack": 1000, 
    "attack_seconds": 20,
    "item_drops": {"health_potion" : 1},
    "health_drop": math.floor(level_multiplier) + 5,
    "id": str(uuid.uuid4()),
    "top": random.randint(1, 75),
    "left": random.randint(1, 80),
    "alive": True,
    }

    xp = {
    "name": "Shooting Star",
    "type": "bonus",
    "description": "a bright ray of stardust bursting with xp!",
    "emoji": "💫",
    "level": 1,
    "health": 1,
    "damage_to_gilbert": 0,
    "seconds_til_attack": 1000, 
    "attack_seconds": 20,
    "item_drops": {"health_potion" : 1},
    "xp_drop": math.floor(level_multiplier * 3) + 5,
    "id": str(uuid.uuid4()),
    "top": random.randint(1, 75),
    "left": random.randint(1, 80),
    "alive": True,
    }


    return [treasure_bag, health, xp][random.randint(0,2)]



# mid game enemy, fast attack speed but stronger
def create_spider(level):
    level_multiplier = get_level_multiplier(level)

    enemy = {
    "name": "Spider",
    "description": "a giant spider, fast and strong!",
    "emoji": "🕷️",
    "level": 5,
    "health": min(10,math.floor(2.5 * level_multiplier)),
    "damage_to_gilbert": 2,
    "seconds_til_attack": random.randint(2, 5), 
    "attack_seconds": 3,
    "item_drops": {"health_potion" : 1},
    "gold_drop": math.floor(2 * level_multiplier),
    "xp_drop":  math.floor(random.randint(3, 5) * level_multiplier),
    "id": str(uuid.uuid4()),
    "top": random.randint(1, 75),
    "left": random.randint(1, 80),
    "alive": True,
    "attack_speed": 5,
    }

    return enemy

# mid game enemy, strong and slow
def create_snake(level):
    level_multiplier = get_level_multiplier(level)

    enemy = {
    "name": "Snake",
    "description": "a garden snake, very strong but very slow!",
    "emoji": "🐍",
    "level": 8,
    "health": min(15,math.floor(3 * level_multiplier)),
    "damage_to_gilbert": 8,
    "seconds_til_attack": random.randint(10, 20), 
    "attack_seconds": 10,
    "item_drops": {"health_potion" : 1},
    "gold_drop": math.floor(5 * level_multiplier),
    "xp_drop":  math.floor(random.randint(4, 5) * level_multiplier),
    "health_drop": math.floor(level_multiplier),
    "id": str(uuid.uuid4()),
    "top": random.randint(1, 75),
    "left": random.randint(1, 80),
    "alive": True,
    "animation": "button-medium",
    "attack_speed": 2,
    }

    return enemy

# mid game enemy, very fast attack but weak
def create_bat(level):
    level_multiplier = get_level_multiplier(level)

    enemy = {
    "name": "Bat",
    "description": "a bat, very fast!",
    "emoji": "🦇",
    "level": 5,
    "health": 1,
    "damage_to_gilbert": 1,
    "seconds_til_attack": 2, 
    "attack_seconds": 1,
    "item_drops": {"health_potion" : 1},
    "gold_drop": math.floor(3 * level_multiplier),
    "xp_drop":  math.floor(1 * level_multiplier),
    "id": str(uuid.uuid4()),
    "top": random.randint(1, 75),
    "left": random.randint(1, 80),
    "alive": True,
    "attack_speed": 7,
    }

    return enemy


def create_shrimp(level):
    level_multiplier = get_level_multiplier(level)

    enemy = {
    "name": "Shrimp",
    "description": "a shrimp, extremely fast!",
    "emoji": "🦐",
    "level": 7,
    "health": 1,
    "damage_to_gilbert": 1,
    "seconds_til_attack": 0, 
    "attack_seconds": 0,
    "item_drops": {"health_potion" : 1},
    "gold_drop": math.floor(1 * level_multiplier),
    "xp_drop":  math.floor(1 * level_multiplier),
    "id": str(uuid.uuid4()),
    "top": random.randint(1, 75),
    "left": random.randint(1, 80),
    "alive": True,
    "animation": "button-medium",
    "attack_speed": 10,
    }

    return enemy


def create_shark(level):
    level_multiplier = get_level_multiplier(level)

    enemy = {
    "name": "Shark",
    "description": "a shark, extremely strong bite!",
    "emoji": "🦈",
    "level": 20,
    "health": min(math.floor(3 * level_multiplier), 12),
    "damage_to_gilbert": 10,
    "seconds_til_attack": 2, 
    "attack_seconds": 6,
    "item_drops": {"health_potion" : 1},
    "gold_drop": math.floor(5 * level_multiplier),
    "xp_drop":  math.floor(3 * level_multiplier),
    "health_drop": math.floor(level_multiplier) + 3,
    "id": str(uuid.uuid4()),
    "top": random.randint(1, 75),
    "left": random.randint(1, 80),
    "alive": True,
    "animation": "button-slow",
    "attack_speed": 4,
    }

    return enemy


def create_jellyfish(level):
    level_multiplier = get_level_multiplier(level)

    enemy = {
    "name": "Jellyfish",
    "description": "a majestic jellyfish!",
    "emoji": "🪼",
    "level": 11,
    "health": 3,
    "damage_to_gilbert": 6,
    "seconds_til_attack": 10, 
    "attack_seconds": 3,
    "item_drops": {"health_potion" : 1},
    "gold_drop": math.floor(2 * level_multiplier),
    "xp_drop":  math.floor(3 * level_multiplier),
    "id": str(uuid.uuid4()),
    "top": random.randint(1, 75),
    "left": random.randint(1, 80),
    "alive": True,
    "animation": "button-dodge-slow",
    "attack_speed": 5,
    }

    return enemy


def create_puffer(level):
    level_multiplier = get_level_multiplier(level)

    enemy = {
    "name": "Pufferfish",
    "description": "a spiky pufferfish! fast attack!",
    "emoji": "🐡",
    "level": 14,
    "health": 5,
    "damage_to_gilbert": 3,
    "seconds_til_attack": 5, 
    "attack_seconds": 1,
    "item_drops": {"health_potion" : 1},
    "gold_drop": math.floor(2 * level_multiplier),
    "xp_drop":  math.floor(3 * level_multiplier),
    "id": str(uuid.uuid4()),
    "top": random.randint(1, 75),
    "left": random.randint(1, 80),
    "alive": True,
    "attack_speed": 7,
    }

    return enemy

# given an int representing gilbert's level, return a float for scaling enemy health/dmg/whatnot
def get_level_multiplier(level):
    mult = (((level) / 10) ** 1.001 * 1.1 + 1).real
    level_mult = max(mult, 1.0)

    return level_mult


# given an int representing gilbert's level, return an integer representing the amount of enemies to spawn
def get_enemy_count(level):
    mult = (((level) / 10) ** 1.001 * 1.1 + 1).real + .5
    amount_of_enemies = max(math.floor(max(mult, 1.0)) + random.randint(-1,math.floor(mult)), 1)

    if amount_of_enemies <= 1:
        return 1

    return amount_of_enemies


if __name__ == '__main__':

    print("level 1: ", get_enemy_count(1))
    print("level 2: ", get_enemy_count(2))
    print("level 3: ", get_enemy_count(3))
    print("level 4: ", get_enemy_count(4))
    print("level 5: ", get_enemy_count(5))
    print("level 6: ", get_enemy_count(6))
    print("level 7: ", get_enemy_count(7))
    print("level 8: ", get_enemy_count(8))
    print("level 9: ", get_enemy_count(9))
    print("level 10: ", get_enemy_count(10))
    print("level 15: ", get_enemy_count(15))
    print("level 25: ", get_enemy_count(25))
    print("level 50: ", get_enemy_count(50))
    print("level 100: ", get_enemy_count(100))

    # print("level 1: ", get_level_multiplier(1))
    # print("level 2: ", get_level_multiplier(2))
    # print("level 3: ", get_level_multiplier(3))
    # print("level 4: ", get_level_multiplier(4))
    # print("level 5: ", get_level_multiplier(5))
    # print("level 6: ", get_level_multiplier(6))
    # print("level 7: ", get_level_multiplier(7))
    # print("level 10: ", get_level_multiplier(10))
    # print("level 15: ", get_level_multiplier(15))
    # print("level 25: ", get_level_multiplier(25))
    # print("level 50: ", get_level_multiplier(50))
    # print("level 100: ", get_level_multiplier(100))

    # print(spawn_enemy(2))