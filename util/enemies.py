import copy
import math
import random
import uuid


# send enemy update socket from server, this would trigger an attack animation and also damage gilbert at the same time
# function that takes gilbert's level and creates an enemy

# todo: can definitely refactor this into a "create_enemy" function and pass in needed values instead of having a function for each enemy
# would have defaults and would override them whenever passed in a value
# BOSS: if level is exactly x, send boss and pause enemies
def spawn_enemy(gilbert_level, luck, enemies_defeated):

    amount_of_enemies = get_enemy_count(gilbert_level)
    enemy_dict = {}

    # random bonus enemy
    if random.randint(1,50) <= (luck + 3):
        enemy = create_bonus(gilbert_level)
        enemy_dict[enemy["id"]] = enemy
        return enemy_dict
    
    # from level 1 to 5
    if gilbert_level >= 0:
        
        if random.randint(0,2):
            amount_of_enemies = max(1,min(amount_of_enemies, 8)) + random.randint(0,1)
            for i in range(amount_of_enemies):
                mouse = create_mouse(gilbert_level)
                enemy_dict[mouse["id"]] = mouse


        else:
            amount_of_enemies = max(min(amount_of_enemies - 2, 5),1)
            for i in range(amount_of_enemies):
                rat = create_rat(gilbert_level)
                enemy_dict[rat["id"]] = rat

    if gilbert_level >= 7:
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

        elif random.randint(1,3) == 1:
            amount_of_enemies = max(3,min(amount_of_enemies + 2, 10))
            for i in range(amount_of_enemies):
                enemy = create_bat(gilbert_level)
                enemy_dict[enemy["id"]] = enemy

        else:
            amount_of_enemies = max(1,min(amount_of_enemies - 3, 5))
            for i in range(amount_of_enemies):
                enemy = create_snake(gilbert_level)
                enemy_dict[enemy["id"]] = enemy


    if gilbert_level >= 12:
        # small chance to use the previous enemy batch, or generate a new one with different enemies
        if random.randint(0,7):
            enemy_dict = {}
        else:
            return enemy_dict
        

        # new enemy generation
        if random.randint(1,4) == 1:
            amount_of_enemies = max(1,min(amount_of_enemies, 7)) + 1
            for i in range(amount_of_enemies):
                enemy = create_shrimp(gilbert_level)
                enemy_dict[enemy["id"]] = enemy

        elif random.randint(1,4) == 1:
            amount_of_enemies = max(1,min(amount_of_enemies - 2, 5))
            for i in range(amount_of_enemies):
                enemy = create_jellyfish(gilbert_level)
                enemy_dict[enemy["id"]] = enemy

        elif random.randint(1,3) == 1:
            amount_of_enemies = max(1,min(amount_of_enemies - 4, 12))
            for i in range(amount_of_enemies):
                enemy = create_puffer(gilbert_level)
                enemy_dict[enemy["id"]] = enemy

        elif random.randint(1,70) == 1 and gilbert_level >= 18:
            enemy = create_moai_boss(gilbert_level)
            enemy_dict[enemy["id"]] = enemy

        else:
            amount_of_enemies = max(1,min(amount_of_enemies - 5, 3))
            for i in range(amount_of_enemies):
                enemy = create_shark(gilbert_level)
                enemy_dict[enemy["id"]] = enemy



    # if gilbert_level >= 18:
    #     # small chance to use the previous enemy batch, or generate a new one with different enemies
    #     if random.randint(0,5):
    #         enemy_dict = {}
    #     else:
    #         return enemy_dict
        

    #     # small chance to spawn boss
    #     if random.randint(1,100) == 1 and gilbert_level >= 23:
    #         enemy_dict = create_emoji_boss_group(gilbert_level)
        
    #     # todo add new mobs

    return enemy_dict


# early game enemy, medium attack speed, deals more damage to gilbert
def create_rat(level):

    level_multiplier = get_level_multiplier(level)

    rat = {
    "name": "Rat",
    "description": "a giant rat! slow attack speed but strong!",
    "emoji": "🐀",
    "level": 3,
    "health": min(7,math.floor(4 * level_multiplier)),
    "damage_to_gilbert": 2,
    "seconds_til_attack": random.randint(1, 4), 
    "attack_seconds": 5,
    "item_drops": {"health_potion" : 1},
    "gold_drop": math.floor(6 * level_multiplier),
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
    "health": min(4,math.floor(1 * level_multiplier)),
    "damage_to_gilbert": 1,
    "seconds_til_attack": random.randint(2, 5), 
    "attack_seconds": 2,
    "item_drops": {"health_potion" : 1},
    "gold_drop": math.floor(3 * level_multiplier),
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
    "gold_drop": math.floor(15 * level_multiplier) + 5,
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
    "top": random.randint(1, 65),
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
    "xp_drop": math.floor(level_multiplier * 8) + 3,
    "id": str(uuid.uuid4()),
    "top": random.randint(1, 65),
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
    "gold_drop": math.floor(8 * level_multiplier),
    "xp_drop":  math.floor(random.randint(3, 5) * level_multiplier),
    "id": str(uuid.uuid4()),
    "top": random.randint(1, 5),
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
    "gold_drop": math.floor(10 * level_multiplier),
    "xp_drop":  math.floor(random.randint(4, 5) * level_multiplier),
    "health_drop": math.floor(level_multiplier) + 3,
    "id": str(uuid.uuid4()),
    "top": random.randint(1, 65),
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
    "gold_drop": math.floor(5 * level_multiplier),
    "xp_drop":  math.floor(1 * level_multiplier),
    "id": str(uuid.uuid4()),
    "top": random.randint(1, 65),
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
    "health": min(5, math.floor(1 * level_multiplier)),
    "damage_to_gilbert": 1,
    "seconds_til_attack": 0, 
    "attack_seconds": 0,
    "item_drops": {"health_potion" : 1},
    "gold_drop": math.floor(6 * level_multiplier),
    "xp_drop":  math.floor(1 * level_multiplier),
    "id": str(uuid.uuid4()),
    "top": random.randint(1, 65),
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
    "health": min(math.floor(3 * level_multiplier), 18),
    "damage_to_gilbert": 10 + math.floor(level_multiplier),
    "seconds_til_attack": 2, 
    "attack_seconds": 6,
    "item_drops": {"health_potion" : 1},
    "gold_drop": math.floor(15 * level_multiplier) + 10,
    "xp_drop":  math.floor(3 * level_multiplier),
    "health_drop": math.floor(level_multiplier) + 3,
    "id": str(uuid.uuid4()),
    "top": random.randint(1, 65),
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
    "description": "a majestic jellyfish! moderate speed!",
    "emoji": "🪼",
    "level": 11,
    "health": math.floor(4 * level_multiplier),
    "damage_to_gilbert": 6,
    "seconds_til_attack": 10, 
    "attack_seconds": 3,
    "item_drops": {"health_potion" : 1},
    "gold_drop": math.floor(12 * level_multiplier) + 3,
    "xp_drop":  math.floor(3 * level_multiplier),
    "id": str(uuid.uuid4()),
    "top": random.randint(1, 65),
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
    "description": "a spiky pufferfish! health scales with level!",
    "emoji": "🐡",
    "level": 14,
    "health": math.floor(5 * level_multiplier),
    "damage_to_gilbert": 3,
    "seconds_til_attack": 5, 
    "attack_seconds": 1,
    "item_drops": {"health_potion" : 1},
    "gold_drop": math.floor(9 * level_multiplier) + 10,
    "xp_drop":  math.floor(3 * level_multiplier),
    "id": str(uuid.uuid4()),
    "top": random.randint(1, 65),
    "left": random.randint(1, 80),
    "alive": True,
    "attack_speed": 7,
    }

    return enemy

def create_moai_boss(level):
    level_multiplier = get_level_multiplier(level)

    enemy = {
    "name": "Moai Head",
    "description": "will kill you in 60 seconds.",
    "emoji": "🗿",
    "level": 50,
    "health": 50,
    "damage_to_gilbert": 100,
    "seconds_til_attack": 60, 
    "attack_seconds": 60,
    "item_drops": {"health_potion" : 1},
    "gold_drop": math.floor(100 * level_multiplier) + 10,
    "xp_drop":  math.floor(30 * level_multiplier),
    "health_drop":  math.floor(15 * level_multiplier) + 3,
    "id": str(uuid.uuid4()),
    "top": random.randint(30, 50),
    "left": random.randint(30, 70),
    "alive": True,
    "attack_speed": 1,
    "type": "boss",
    "boss_type": "moai",
    "special_attack": "Stomp of Death",
    "attack_description": "Moai Heads's attacks ignore your defense."
    }

    return enemy

def create_emoji_boss_group(level):
    level_multiplier = get_level_multiplier(level)
    boss_id = str(uuid.uuid4())

    enemy1 = {
    "name": "Emoji Squad",
    "description": "get ready to be tossed",
    "emoji": "🚮",
    "level": 50,
    "health": 25 + math.floor(level_multiplier),
    "damage_to_gilbert": 10 + math.floor(level_multiplier),
    "seconds_til_attack": 3, 
    "attack_seconds": 4,
    "item_drops": {"health_potion" : 1},
    "gold_drop": math.floor(25 * level_multiplier) + 10,
    "xp_drop":  math.floor(10 * level_multiplier),
    "health_drop":  math.floor(5 * level_multiplier) + 3,
    "id": str(uuid.uuid4()),
    "top": 50,
    "left": 410,
    "alive": True,
    "attack_speed": 1,
    "type": "boss",
    "boss_type": "emoji",
    "special_attack": "Life Link",
    "animation": "button-dodge-wait-fast",
    "attack_description": "Will continue to attack until all 5 emojis are defeated.",
    "boss_id": boss_id
    }

    enemy2 = {
    "name": "Emoji Squad",
    "description": "waaAAaaAAAaAA",
    "emoji": "🚼",
    "level": 50,
    "health": 25 + math.floor(level_multiplier),
    "damage_to_gilbert": 10 + math.floor(level_multiplier),
    "seconds_til_attack": 4, 
    "attack_seconds": 4,
    "item_drops": {"health_potion" : 1},
    "gold_drop": math.floor(25 * level_multiplier) + 10,
    "xp_drop":  math.floor(10 * level_multiplier),
    "health_drop":  math.floor(5 * level_multiplier) + 3,
    "id": str(uuid.uuid4()),
    "top": 70,
    "left": 960,
    "alive": True,
    "attack_speed": 1,
    "type": "boss",
    "boss_type": "emoji",
    "special_attack": "Life Link",
    "attack_description": "Will continue to attack until all 5 emojis are defeated.",
    "animation": "button-dodge-slow",
    "boss_id": boss_id
    }

    enemy3 = {
    "name": "Emoji Squad",
    "description": "3",
    "emoji": "3️⃣",
    "level": 50,
    "health": 25 + math.floor(level_multiplier),
    "damage_to_gilbert": 10 + math.floor(level_multiplier),
    "seconds_til_attack": 5, 
    "attack_seconds": 4,
    "item_drops": {"health_potion" : 1},
    "gold_drop": math.floor(25 * level_multiplier) + 10,
    "xp_drop":  math.floor(10 * level_multiplier),
    "health_drop":  math.floor(5 * level_multiplier) + 3,
    "id": str(uuid.uuid4()),
    "top": 400,
    "left": 1024,
    "alive": True,
    "attack_speed": 1,
    "type": "boss",
    "boss_type": "emoji",
    "special_attack": "Life Link",
    "attack_description": "Will continue to attack until all 5 emojis are defeated.",
    "animation": "button-dodge",
    "boss_id": boss_id
    }

    enemy4 = {
    "name": "Emoji Squad",
    "description": "shuffle this",
    "emoji": "🔀",
    "level": 50,
    "health": 25 + math.floor(level_multiplier),
    "damage_to_gilbert": 10 + math.floor(level_multiplier),
    "seconds_til_attack": 6, 
    "attack_seconds": 4,
    "item_drops": {"health_potion" : 1},
    "gold_drop": math.floor(25 * level_multiplier) + 10,
    "xp_drop":  math.floor(10 * level_multiplier),
    "health_drop":  math.floor(5 * level_multiplier) + 3,
    "id": str(uuid.uuid4()),
    "top": 510,
    "left": 700,
    "alive": True,
    "attack_speed": 1,
    "type": "boss",
    "boss_type": "emoji",
    "special_attack": "Life Link",
    "attack_description": "Will continue to attack until all 5 emojis are defeated.",
    "animation": "button-fast",
    "boss_id": boss_id
    }

    enemy5 = {
    "name": "Emoji Squad",
    "description": "SO COOL!",
    "emoji": "🆒",
    "level": 50,
    "health": 25 + math.floor(level_multiplier),
    "damage_to_gilbert": 10 + math.floor(level_multiplier),
    "seconds_til_attack": 7, 
    "attack_seconds": 4,
    "item_drops": {"health_potion" : 1},
    "gold_drop": math.floor(25 * level_multiplier) + 10,
    "xp_drop":  math.floor(10 * level_multiplier),
    "health_drop":  math.floor(5 * level_multiplier) + 3,
    "id": str(uuid.uuid4()),
    "top": 330,
    "left": 380,
    "alive": True,
    "attack_speed": 1,
    "type": "boss",
    "boss_type": "emoji",
    "special_attack": "Life Link",
    "attack_description": "Will continue to attack until all 5 emojis are defeated.",
    "animation": "button-medium",
    "boss_id": boss_id
    }

    boss_group = {
        enemy1.get("id"): enemy1,
        enemy2.get("id"): enemy2,
        enemy3.get("id"): enemy3,
        enemy4.get("id"): enemy4,
        enemy5.get("id"): enemy5,
    }

    return boss_group

# given an int representing gilbert's level, return a float for scaling enemy health/dmg/whatnot
def get_level_multiplier(level):
    mult = (((level) / 10) ** 1.001 * 1.1 + 1).real
    level_mult = max(mult, 1.0)

    return level_mult


# given an int representing gilbert's level, return an integer representing the amount of enemies to spawn
def get_enemy_count(level):
    mult = (((level) / 10) ** 1.001 * 1.1 + 1).real + .5
    amount_of_enemies = max(math.floor(max(mult, 1.0)) + random.randint(-2,math.ceil(mult)), 1)
    amount_of_enemies = min(8, amount_of_enemies) #don't want over 8 enemies spawning at once probably

    if amount_of_enemies <= 1:
        return 1

    return amount_of_enemies


# get the rough strength of all of the current enemies on screen
# should eventually just have an enemy_weight stat in each enemy
def get_enemy_spawn_weight(gilbert_enemies_dict):

    enemy_weight = 0

    for id, enemy in gilbert_enemies_dict.items():
        enemy_type = enemy.get("type", "normal")
        enemy_is_alive = enemy.get("alive")

        if enemy_type == "boss" and enemy_is_alive:
            enemy_weight += 3

        if enemy_type == "normal" and enemy_is_alive:
            enemy_weight += 1

    return enemy_weight


def is_emoji_boss_alive(gilbert_enemies_dict, boss_id):

    for id, enemy in gilbert_enemies_dict.items():
        enemy_boss_id = enemy.get("boss_id", None)

        if enemy_boss_id == boss_id:
            if enemy.get("health") > 0:
                return True


    return False


def remove_emoji_boss_from_dict(gilbert_enemies_dict, boss_id, ignore_id):

    new_enemy_dict = copy.deepcopy(gilbert_enemies_dict)

    for id, enemy in gilbert_enemies_dict.items():
        
        enemy_boss_id = enemy.get("boss_id")
        monster_id = enemy.get("id")

        if monster_id == ignore_id:
            continue

        if enemy_boss_id == boss_id:
            del new_enemy_dict[monster_id]

    return new_enemy_dict

def get_all_valid_emoji_boss_ids(gilbert_enemies_dict, boss_id):

    id_list = []

    for id, enemy in gilbert_enemies_dict.items():
        enemy_boss_id = enemy.get("boss_id")
        monster_id = enemy.get("id")

        if enemy_boss_id == boss_id:
            id_list.append(monster_id)

    return id_list


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
    print("level 13: ", get_enemy_count(13))
    print("level 15: ", get_enemy_count(15))
    print("level 17: ", get_enemy_count(17))
    print("level 20: ", get_enemy_count(20))
    print("level 23: ", get_enemy_count(23))
    print("level 25: ", get_enemy_count(25))
    print("level 27: ", get_enemy_count(27))
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