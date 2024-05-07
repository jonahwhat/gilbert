import time
from pymongo import MongoClient
from flask import Flask, render_template, request, send_from_directory, make_response, redirect, session, url_for, jsonify
from markupsafe import escape
from util.auth import *
from util.posts import *
from util.image import *
from util.gilbert import *
from util.websockets import *
from util.enemies import *
from flask import session
from flask_socketio import SocketIO, emit
import threading


app = Flask(__name__)
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['UPLOAD_FOLDER'] = 'static'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app.secret_key = 'cse312secretkeymoment1612!'
socket = SocketIO(app)
socket.init_app(app, cors_allowed_origins="*")

statistics = {
    "posts_created": 0,
    "posts_deleted": 0,
    "unique_users": 0,
    "global_likes":0,
    "gilbert_longest_alive": 0,
}

gilbert_respawn_timer = 0

gilbert_stats = {
    "upgrades": {},
    "alive": False
}

gilbert_thoughts_userlist = ["gilbert"]
gilbert_enemies_dict = {}
gilbert_temporary_statistics = {
}

# should probably be in a different file but its ok
gilbert_upgrade_prices = {
    "damage": {
        "upgrade_value": [2, 3, 4, 5, 6, 7, 8, 9, 10],
        "upgrade_cost": [75, 150, 350, 500, 1000, 1500, 2500, 5000, 10000, 'max'],
        "maximum_upgrade": 8
    },
    "defense": {
        "upgrade_value": [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
        "upgrade_cost": [25, 50, 100, 200, 350, 500, 750, 1000, 5000, 10000, 'max'],
        "maximum_upgrade": 9
    },
    "health": {
        "upgrade_value": [110, 120, 130, 140, 150, 160, 170, 180, 190, 200],
        "upgrade_cost": [15, 25, 50, 75, 100, 150, 250, 350, 500, 1000, 'max'],
        "maximum_upgrade": 9
    },
    "regen": {
        "upgrade_value": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        "upgrade_cost": [150, 250, 500, 1000, 2000, 4000, 7500, 10000, 25000, 50000, 'max'],
        "maximum_upgrade": 9
    },
    "luck": {
        "upgrade_value": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        "upgrade_cost": [100, 200, 500, 1000, 1500, 2500, 3500, 5000, 7600, 10000, 20000, 30000, 40000, 50000, 100000, 'max'],
        "maximum_upgrade": 14
    }
}

debug = False
online_users = {}




# setting up database
mongo_client = MongoClient("mongo")
db = mongo_client["cse312"]

# user_collection stores user login information
user_collection = db["user"]
# auth_collection stores auth tokens along with username
auth_collection = db["auth"]
# posts_collection stores all user posts on the main feed
posts_collection = db["posts"]
# profile_image_collection stores all profile images
profile_image_collection = db["profile_image"]
# gilbert_thoughts_collection stores all of gilbert's thoughts, these are strings that he can say at any random point
gilbert_thoughts_collection = db["gilbert_thoughts"]


@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response


@app.route('/')
@app.route('/index')
def index():
 # Retrieve error messages from session, if any
    register_error = session.pop('register_error', '')
    login_error = session.pop('login_error', '')

    # Get username from the authentication cookie
    auth_token = request.cookies.get('auth')
    username = getUsername(auth_token, auth_collection)

    if username != "Guest":
        return redirect(url_for("application"))

    return render_template('index.html', username=username, register_error=register_error, login_error=login_error)

@app.route('/application')
def application():
    auth_token = request.cookies.get('auth')
    username = getUsername(auth_token, auth_collection)
    profile_picture_path = get_profile_image(username, profile_image_collection)
    session['username'] = username
    session['profile_picture_path'] = profile_picture_path

    return render_template('application.html', username=username, profile_picture_path=profile_picture_path)

@app.route('/register',methods=["POST"])
def register():
    if request.method == "POST":
        return handleRegister(request, user_collection, auth_collection)

    else:
        return jsonify({'error': 'Method not allowed'}), 405


@app.route('/send_posts', methods=['GET'])
def send_posts():
    return send_all_posts(posts_collection, profile_image_collection)


@app.route('/send_gilbert_enemies', methods=['GET'])
def send_gilbert_enemies():
    response = jsonify(gilbert_enemies_dict)
    response.status_code = 200
    response.mimetype = 'application/json; charset=utf-8'

    return response


@app.route('/login', methods=['POST'])
def login():
    return handleLogin(request, user_collection, auth_collection)


@app.route('/logout', methods=['POST'])
def logout():
    response = make_response(redirect(url_for("index")))
    removeAuthToken(request, response, auth_collection)
    return response


@app.route('/static/js/<path:filename>')
def function(filename):
    return send_from_directory('static/js', filename, mimetype='text/javascript')


@app.route('/static/css/<path:filename>')
def serve_css(filename):
    return send_from_directory('static/css', filename, mimetype='text/css')


@app.route('/image-upload', methods=['POST'])
def handle_image():
    username = getUsername(request.cookies.get('auth'), auth_collection)
    handle_profile_picture_upload(request, profile_image_collection, username)
    return redirect(url_for("application"))



#* Websockets *#
@socket.on('create_post_ws')
def message(data):
    statistics['posts_created'] += 1

    username = session.get("username")
    profile_picture_path = session.get("profile_picture_path")

    new_post = create_post_json(data, username, profile_picture_path)
    
    socket.emit('new_post', new_post)
    socket.emit('statistics', statistics)

    posts_collection.insert_one(new_post)
    gilbert_thoughts_collection.insert_one({"type": "from_user", "message": str(escape(data))[:200]},)


@socket.on('delete_post')
def delete_post(post_id):

    post = posts_collection.find_one({"id": post_id})

    if (not post) or (not session.get("username")):
        return
    


    if ((post.get("author") == "Guest" and session.get("username") == "Guest") or (session.get("username") != "Guest")): 

        posts_collection.delete_one({'id': post_id})
        statistics['posts_deleted'] += 1
        socket.emit('post_deleted', {'post_id': post_id})
        socket.emit('statistics', statistics)


@socket.on('like_post')
def handle_like_post(message_id):
    result = handle_post_like_ws(session["username"], posts_collection, message_id)
    if result != None:
        statistics['global_likes'] += result[1]
        socket.emit('post_liked', {'message_id': message_id, 'likes': result[0]})
        socket.emit('statistics', statistics)


@socket.on('connect')
def handle_connect(data):
    global online_users

    # statistics
    statistics['unique_users'] += 1
    socket.emit('statistics', statistics)

    # handle online userlist
    username = session.get("username")
    emit('update-online-users', {'type': 'all_users', 'data': list(online_users.keys())}, room=request.sid)

    if username == "Guest":
        return

    online_users[username] = {"username": username, "disconnect_cooldown": 10, "connected": True}
    socket.emit('update-online-users', {'type': 'single_user_connect', 'data': username})

    printMsg(session.get('username') + " connected.")

@socket.on('disconnect')
def handle_disconnect():
    global online_users

    # socket.emit('disconnect', {'username': session.get('username')})
    username = session.get("username")

    if username == "Guest":
        return

    printMsg(username + " disconnected.")
    online_users[username] = {"username": username, "disconnect_cooldown": 10, "connected": False}

    pass


#* Gilbert Functions *#

@socket.on('shop_interaction')
def handle_shop_interaction(upgrade_type):
    global gilbert_stats

    # given an upgrade, attempt to purchase it with gilbert's gold
    current_gold = gilbert_stats.get("gold")
    current_upgrade_level = gilbert_stats.get("upgrades").get(upgrade_type)
    cost_of_upgrade = gilbert_upgrade_prices.get(upgrade_type).get("upgrade_cost")[current_upgrade_level]

    if current_upgrade_level > gilbert_upgrade_prices.get(upgrade_type).get("maximum_upgrade"):
        return

    elif current_gold < cost_of_upgrade:
        # if fail, send a failure type frame "unable to purchase this upgrade", button animation for disabling maybe
        return

    elif current_gold >= cost_of_upgrade:
        # update gilbert_upgrades dict
        gilbert_stats["upgrades"][upgrade_type] += 1
        gilbert_stats["upgrades"][upgrade_type + "_cost"] = gilbert_upgrade_prices.get(upgrade_type).get("upgrade_cost")[current_upgrade_level + 1]
        gilbert_stats["gold"] -= cost_of_upgrade

        # update gilbert_stats with new stat
        if upgrade_type == "health": 
            gilbert_stats["max_health"] = gilbert_upgrade_prices.get(upgrade_type).get("upgrade_value")[current_upgrade_level]
            gilbert_stats["health"] += 10
        else:
            gilbert_stats[upgrade_type] = gilbert_upgrade_prices.get(upgrade_type).get("upgrade_value")[current_upgrade_level]

        socket.emit('upgrade_purchase', {"upgrade_type": upgrade_type, "username": session.get("username"), "level": current_upgrade_level + 1, "successful": True})

        # send gilbert stats
        socket.emit('recieve_gilbert_stats', gilbert_stats)






@socket.on('enemy_interaction')
def handle_monster_attack(monster_id):

    # action can be attack or loot
    # attack damage is verified by server

    global gilbert_stats
    global gilbert_enemies_dict
    
    monster = gilbert_enemies_dict.get(monster_id)


    if monster:

        enemy_type = monster.get("type", None)
        boss_type = monster.get("boss_type", None)
        boss_id = monster.get("boss_id", None)
        is_boss = enemy_type == "boss"

        if monster.get("alive"):
            new_health = max(monster.get("health") - gilbert_stats.get("damage"), 0)
            gilbert_enemies_dict[monster_id]["health"] = new_health
            # if health is zero emit death, else emit new stats

            if new_health <= 0:
                # emit death, update stats to reflect that, only remove from dict once player takes loot 
                # check dictionary for enemies that have boss_id equal
                # if there are any bossid alive, don't emit death
                if boss_type == "emoji":
                    if is_emoji_boss_alive(gilbert_enemies_dict, boss_id):
                        # emit nothing, maybe gray out button
                        # emit health only
                        # don't emit if enemy is already dead?
                        socket.emit('update_enemy_frontend', {"interaction_type": "player_attack", "id": monster_id, "health": new_health, "name": monster.get("name"), "emoji": monster.get("emoji"), "type": monster.get("type", "none")})
                    
                    else:
                        # dend delete frame to all 5 emojis
                        emoji_boss_ids = get_all_valid_emoji_boss_ids(gilbert_enemies_dict, boss_id)

                        for enemy_id in emoji_boss_ids:
                            socket.emit('update_enemy_frontend', {"interaction_type": "emoji_death", "id": enemy_id}) 

                        # remove all bossid from dict
                        gilbert_enemies_dict = remove_emoji_boss_from_dict(gilbert_enemies_dict, boss_id, monster_id)
                        gilbert_enemies_dict[monster_id]["alive"] = False

                        socket.emit('update_enemy_frontend', {"interaction_type": "boss_loot", "id": monster_id, "is_boss": True , "gold_drop": monster.get("gold_drop"), "xp_drop": monster.get("xp_drop"), "health_drop": monster.get("health_drop"), "name": monster.get("name"), "top": random.randint(10, 60), "left": random.randint(10, 70), "emoji": monster.get("emoji"), "type": monster.get("type", "none")})

                else:
                    socket.emit('update_enemy_frontend', {"interaction_type": "death", "is_boss": is_boss, "id": monster_id, "gold_drop": monster.get("gold_drop"), "xp_drop": monster.get("xp_drop"), "health_drop": monster.get("health_drop"), "name": monster.get("name"), "top": random.randint(10, 60), "left": random.randint(10, 70), "emoji": monster.get("emoji"), "type": monster.get("type", "none")})
                    gilbert_enemies_dict[monster_id]["alive"] = False
                    gilbert_stats["enemies_defeated"] += 1

            else:
                # update health of enemy
                socket.emit('update_enemy_frontend', {"interaction_type": "player_attack", "id": monster_id, "health": new_health, "name": monster.get("name"), "emoji": monster.get("emoji"), "boss_type": boss_type})


        else:
            # player is attempting to loot, remove from dict
            # maybe add cooldown? idk
            # emit loot
            socket.emit('update_enemy_frontend', {"interaction_type": "loot", "id": monster_id})
            # add gold/xp to gilbert
            gilbert_stats["gold"] += monster.get("gold_drop", 0)
            gilbert_stats["xp"] += monster.get("xp_drop", 0)
            gilbert_stats["health"] = min(monster.get("health_drop", 0) + gilbert_stats.get("health"), gilbert_stats.get("max_health"))

            # remove enemy from dict
            del gilbert_enemies_dict[monster_id]



# this should be a new "messageType", where types can be feed, play, etc
@socket.on('update_gilbert')
def handle_gilbert_update(action):
    global gilbert_stats
    global gilbert_thoughts_userlist

    
    if (gilbert_stats.get("alive") == False):
        return



    # add user to gilbert's thoughts so he responds to them
    username = session.get("username", "guest")
    if username not in gilbert_thoughts_userlist:
        gilbert_thoughts_userlist.append(username)

    # gilbert logic based on his current stats
    gilbert_stats = handle_gilbert_action(action, gilbert_stats)

    # send new gilbert back
    socket.emit('recieve_gilbert_stats', gilbert_stats)




@socket.on('gilbert_start')
def handle_gilbert_start():

    global gilbert_stats
    global gilbert_respawn_timer
    global gilbert_thoughts_userlist
    global gilbert_enemies_dict
    global gilbert_temporary_statistics

    
    if (gilbert_respawn_timer > 0):
        return


    # check if glibert is already alive, if he is, ignore, if he isn't start the loop
    if gilbert_stats.get("alive") == False:
        # reset stats
        gilbert_stats = set_initial_gilbert(debug)
        gilbert_temporary_statistics = set_initial_temp_stats()
        socket.emit('recieve_gilbert_stats', gilbert_stats)
        socket.emit('start_gilbert')



        # reset and add user to gilbert thoughts userlist
        gilbert_thoughts_userlist = [session.get("username", "guest")]

        # maybe while true loop to show timing?
        # only sendall when the epoch time changes



#* Util *#
def error_handler(e):
    print('An error occurred:', e)


def printMsg(message):
    output = f"\n\033[32m=== Printing to Console ===\033[0m\n\033[97m{message}\033[0m\n\033[32m=== End of Message ===\033[0m"
    app.logger.info(output)
    return "Check your console"


def send_updates():

    global gilbert_stats
    global gilbert_respawn_timer
    global gilbert_thoughts_userlist
    global gilbert_enemies_dict
    global gilbert_temporary_statistics


    while True:

        if gilbert_respawn_timer > 0:
            gilbert_respawn_timer -= 1

        # if gilbert alive, send gilbert dict
        if gilbert_stats.get("alive"):
            gilbert_stats = update_gilbert_statistics(gilbert_stats, gilbert_enemies_dict)

            # update longest alive time
            current_alive = gilbert_stats["seconds_alive"]
            if current_alive >= statistics.get("gilbert_longest_alive"):
                statistics["gilbert_longest_alive"] = current_alive
                socket.emit('statistics', statistics)


            if int(time.time()) % 15 == 0:
                thought = generate_gilbert_thought(gilbert_thoughts_collection, gilbert_thoughts_userlist)
                if thought:
                    socket.emit('recieve_gilbert_thoughts', thought)

            if gilbert_stats.get("alive") == False:
                socket.emit('gilbert_die')
                gilbert_respawn_timer = 15
                gilbert_enemies_dict = {}


            #* handle enemy logic *#
            if gilbert_stats.get("stage") >= 2: 

                # backend handling of enemy attack cooldown system
                for id, enemy in gilbert_enemies_dict.items():

                    if enemy.get("alive") == False:
                        continue

                    seconds_til_attack = enemy.get("seconds_til_attack")
                    attack_seconds = enemy.get("attack_seconds")
                    damage = max(1,int(enemy.get("damage_to_gilbert") - ((enemy.get("damage_to_gilbert") * gilbert_stats.get("defense")/100))))
                    
                    if enemy.get("name") == "Moai Head":
                        damage = enemy.get("damage_to_gilbert")
                    
                    
                    name = enemy.get("name")
                    enemy_type = enemy.get("type")
                    boss_type = enemy.get("boss_type")

                    if seconds_til_attack <= 0:
                        # emit the attack anim
                        socket.emit('update_enemy_frontend', {"interaction_type": "attack_gilbert", "id": id, "damage": damage, "name": name, "type": enemy_type, "boss_type": boss_type})

                        # reset seconds back to default
                        gilbert_enemies_dict[id]["seconds_til_attack"] = attack_seconds

                        # update gilbert's health
                        gilbert_stats["health"] = max(0, gilbert_stats.get("health") - damage)


                    else:
                        gilbert_enemies_dict[id]["seconds_til_attack"] -= 1

                


                if ((int(time.time()) + 5) % 16 == 0) or (gilbert_stats.get("level") >= 13 and int(time.time()) % 48 == 0) or (gilbert_stats.get("level") >= 23 and int(time.time() + 3) % 120 == 0):
                    if get_enemy_spawn_weight(gilbert_enemies_dict) <= 10:
                        enemy_group = {}
                        # BOSS: don't spawn enemies if alive boss exists
                        # generate a group of enemies based on gilbert's level
                        if gilbert_temporary_statistics.get("boss_moai_spawned") == False and gilbert_stats.get("level") >= 15:
                            enemy = create_moai_boss(gilbert_stats.get("level"))
                            enemy_group[enemy["id"]] = enemy
                            gilbert_temporary_statistics["boss_moai_spawned"] = True

                        elif gilbert_temporary_statistics.get("boss_emoji_spawned") == False and gilbert_stats.get("level") >= 20:
                            enemy_group = create_emoji_boss_group(gilbert_stats.get("level"))
                            gilbert_temporary_statistics["boss_emoji_spawned"] = True

                            
                        else:
                            enemy_group = spawn_enemy(gilbert_stats.get("level"), gilbert_stats.get("luck"), gilbert_stats.get("enemies_defeated"))
                            gilbert_temporary_statistics["enemy_groups_spawned"] += 1
                            gilbert_temporary_statistics["enemies_spawned"] += len(enemy_group)

                        # send enemy group to front end
                        socket.emit('new_enemy_group', enemy_group)

                        # add all enemies to the dictionary
                        for enemy in enemy_group.values():
                            gilbert_enemies_dict[enemy.get("id")] = enemy
            

            if gilbert_stats.get("stage") >= 3:
                # regen implementation
                if (int(time.time())) % 5 == 0:
                    gilbert_stats["health"] = min(gilbert_stats.get("max_health"), gilbert_stats.get("health") + gilbert_stats.get("regen"))




            # at the end of all this logic, emit the stats       
            socket.emit('recieve_gilbert_stats', gilbert_stats)

        time.sleep(1)

def handle_online_user_cooldown():
    
    global online_users

    while True:

        # count down users who have disconnected
        for username in list(online_users):
            data = online_users[username]

            if data.get("connected") == False:
                online_users[username]["disconnect_cooldown"] -= 1
                
                # if user cooldown = 0, delete from dict, send updated dict
                if data.get("disconnect_cooldown") <= 0:
                    del online_users[username]
                    socket.emit('update-online-users', {'type': 'single_user_disconnect', 'data': username})


        time.sleep(1)


# gilbert thread
send_updates_thread = threading.Thread(target=send_updates)
send_updates_thread.start()

# online users thread
online_users_thread = threading.Thread(target=handle_online_user_cooldown)
online_users_thread.start()



if __name__ == '__main__':
    # socket.run(app, debug=True, host='0.0.0.0', port=8080, allow_unsafe_werkzeug=True)
    #app.run(debug=True, host='0.0.0.0', port=8080)

    app.run(debug=True, host='0.0.0.0', port=8080)

    