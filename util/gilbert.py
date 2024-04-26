import random


def update_gilbert_statistics(gilbert_old):
    gilbert_new = gilbert_old.copy()

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
        gilbert_new["hunger"] = max(current_hunger - random.randint(0, 3), 0)

    elif current_happiness <= 50:
        gilbert_new["hunger"] = max(current_hunger - random.randint(0, 2), 0)
     
    else:
        gilbert_new["hunger"] = max(current_hunger - random.randint(0, 1), 0)


    # handle happiness
    rand = random.randint(1, 4)
    if rand == 1:
        gilbert_new["happiness"] = max(current_happiness - random.randint(1, 3), 0)
    
    elif rand == 2:
        gilbert_new["happiness"] = max(current_happiness - random.randint(0, 2), 0)
        


    # low health triggers death
    if current_health <= 0:
        gilbert_new["alive"] = False

    
    # change seconds alive, only update if alive
    if gilbert_old["alive"] == True:
        gilbert_new["seconds_alive"] = seconds_alive + 1


    # change profile image based on hunger
    gilbert_new["picture_path"] = update_gilbert_image(current_health)

    return gilbert_new


def handle_gilbert_action(action, gilbert_old):

    gilbert_new = gilbert_old.copy()
    
    current_hunger = gilbert_old.get("hunger")
    current_happiness = gilbert_old.get("happiness")
    current_health = gilbert_old.get("health")

    
    if action == "feed":
        if current_hunger <= 100:
            gilbert_new["hunger"] = min(current_hunger + 5, 100)

        elif current_hunger >= 100:
            gilbert_new["happiness"] = max(current_happiness - 1, 0)

    if action == "pet":
        if current_happiness <= 100:
            gilbert_new["happiness"] = min(current_happiness + random.randint(1, 4), 100)

    if action == "hurt":
        gilbert_new["health"] = max(current_health - 1, 0)


    return gilbert_new 


def update_gilbert_image(health):
    if health >= 70:
        return '/static/img/gilbert_happy.png'
    elif health >= 50:
        return '/static/img/gilbert_ok.png'
    elif health >= 10:
        return '/static/img/gilbert_sad.png'
    elif health > 0:
        return '/static/img/gilbert_dying.png'
    else:
        return '/static/img/gilbert_gravestone.png'
    

def set_initial_gilbert(name):
    gilbert_stats = {
        "health": 100,
        "hunger": random.randint(75, 90),
        "happiness": random.randint(45, 55),
        "seconds_alive": 0,
        "name": name,
        "picture_path": '/static/img/gilbert_happy.png',
        "alive": True,
    }

    return gilbert_stats

def generate_gilbert_thought(gilbert_thoughts_collection, user_collection):

    # random message from chat
    if random.randint(0,2):
        pipeline = [{"$sample": {"size": 1}}]
        thought = list(gilbert_thoughts_collection.aggregate(pipeline))[0]

        if thought:
            if thought.get("type") == "normal" or thought.get("type") == "from_user":
                return {'message': thought.get("message")}

    # random set message
    elif random.randint(0,3):

        pipeline = [{"$sample": {"size": 1}}]
        user = list(user_collection.aggregate(pipeline))[0].get("username")

        if user:
            thought_list = [
                f"<b>@{user}</b> is so cool!!", 
                f"i wish <b>@{user}</b> would give me food...", 
                f"no way... <b>@{user}</b> is yapping...",  
                f"<b>@{user}</b> is a yapper fs",
                f"hi <b>@{user}</b>",
                f"what the heck is <b>@{user}</b> doing",
                f"<b>@{user}</b>... i'm so hungry........",
                f"<b>@{user}</b>... <b>@{user}</b>... <b>@{user}</b>.... hello ",
                 f"<b>@{user}</b> <b>@{user}</b> <b>@{user}</b>",
                f"i agree with <b>@{user}</b>",
                f"hello <b>@{user}</b>",
                f"i would have to agree <b>@{user}</b>",
                f"<b>@all</b> guys give me food",
            ]

            thought = random.choice(thought_list)
            return {'message': thought}
        
    else:
        return
        