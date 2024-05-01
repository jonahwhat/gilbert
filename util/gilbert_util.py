import random


def stage_zero(hunger, health):
    
    new_health = health
    new_hunger = hunger

    # update health
    if hunger <= 10:
        new_health = max(health - 3, 0)

    elif hunger <= 25:
        new_health = max(health - 2, 0)

    elif hunger <= 50:
        new_health = max(health - 1, 0)


    # handle hunger going down
    if random.randint(1, 2) == 1:
        new_hunger = max(hunger - random.randint(0, 2), 0)   


    return new_health, new_hunger


def stage_one(hunger, health, happiness):

    new_health = health
    new_hunger = hunger
    new_happiness = happiness

    # update health, happiness also determines health loss
    if hunger <= 10 or happiness <= 10:
        new_health = max(health - 3, 0)

    elif hunger <= 25 or happiness <= 25:
        new_health = max(health - 2, 0)

    elif hunger <= 50 or happiness <= 50:
        new_health = max(health - 1, 0)


    # handle hunger going down, faster now!
    new_hunger = max(hunger - random.randint(0, 2), 0)   


    
    # handle happiness, only goes down occassionally
    rand = random.randint(1, 4)
    if rand == 1:
        new_happiness = max(happiness - random.randint(1, 2), 0)
    
    elif rand == 2:
        new_happiness = max(happiness - random.randint(0, 2), 0)



    return new_health, new_hunger, new_happiness




def stage_two(hunger, health, happiness):

    new_health = health
    new_hunger = hunger
    new_happiness = happiness

    # update health, happiness also determines health loss
    if hunger <= 10 or happiness <= 5:
        new_health = max(health - 3, 0)

    elif hunger <= 25 or happiness <= 10:
        new_health = max(health - 2, 0)

    elif hunger <= 50 or happiness <= 25:
        new_health = max(health - 1, 0)

    # slower hunger and happiness loss
    if random.randint(1,5) == 1:
        new_hunger = max(hunger - random.randint(0, 2), 0)   

        new_happiness = max(happiness - random.randint(0, 2), 0)
    


    return new_health, new_hunger, new_happiness