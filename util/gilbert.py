import random


def update_gilbert_statistics(gilbert_old):
    gilbert_new = gilbert_old.copy

    current_hunger = gilbert_old.get("hunger")
    current_happiness = gilbert_old.get("happiness")
    current_health = gilbert_old.get("health")
    seconds_alive = gilbert_old.get("seconds_alive")

    # handle health decreasing if hunger below 25
    
    if current_hunger <= 10:
        gilbert_new["health"] = max(current_health - 5, 0)

    elif current_hunger <= 25:
        gilbert_new["health"] = max(current_health - 3, 0)

    elif current_hunger <= 50:
        gilbert_new["health"] = max(current_health - 1, 0)


    # handle hunger going down
    if current_happiness <= 10:
        gilbert_new["hunger"] = max(current_hunger - 15, 0)

    elif current_happiness <= 50:
        gilbert_new["hunger"] = max(current_hunger - 10, 0)
     
    else:
        gilbert_new["hunger"] = max(current_hunger - random.randint(1, 5), 0)


    # handle happiness
    rand = random.randint(1, 3)
    if rand == 1:
        gilbert_new["happiness"] = max(current_happiness + random.randint(1, 5), 100)
    
    else:
        gilbert_new["happiness"] = min(current_happiness - random.randint(1, 10), 0)


    # low health triggers death
    if current_health == 0:
        gilbert_new["alive"] == False

    
    # change seconds alive, only update if alive
    if gilbert_old["alive"] == True:
        gilbert_new["seconds_alive"] = seconds_alive + 1


    # change profile image based on hunger
    gilbert_new["picture_path"] = update_gilbert_image(current_health)

    return gilbert_new


def handle_gilbert_action(action, gilbert_old):

    gilbert_new = gilbert_old.copy
    
    current_hunger = gilbert_old.get("hunger")
    current_happiness = gilbert_old.get("happiness")

    
    if action == "feed":
        if current_hunger <= 100:
            gilbert_new["hunger"] = min(current_hunger + 5, 100)

        elif current_hunger >= 100:
            gilbert_new["happiness"] = max(current_happiness - 1, 0)

    if action == "pet":
        if current_happiness <= 100:
            gilbert_new["happiness"] = min(current_happiness + random.randint(1, 4), 100)


    return gilbert_new 


def update_gilbert_image(health):
    if health >= 70:
        return '/static/img/gilbert_happy'
    elif health >= 50:
        return '/static/img/gilbert_ok'
    elif health >= 10:
        return '/static/img/gilbert_sad'
    elif health > 0:
        return '/static/img/gilbert_dying'
    else:
        return '/static/img/gilbert_gravestone'
    

def set_initial_gilbert(name):
    gilbert_stats = {
        "health": 100,
        "hunger": random.randint(75, 90),
        "happiness": random.randint(45, 55),
        "seconds_alive": 0,
        "name": name,
        "picture_path": '/static/img/gilbert_happy',
        "alive": True,
    }

    return gilbert_stats
