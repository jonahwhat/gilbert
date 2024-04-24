import os
from pymongo import MongoClient
from flask import Flask, render_template, request, send_from_directory, make_response, redirect, session, url_for, jsonify
from markupsafe import escape
from util.auth import *
from util.posts import *
from util.image import *
from util.websockets import *
from flask import session
from werkzeug.utils import secure_filename
from flask_socketio import SocketIO, emit
from pathlib import Path


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
}


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
        return handleRegister(request, user_collection)

    else:
        return jsonify({'error': 'Method not allowed'}), 405


@app.route('/send_posts', methods=['GET'])
def send_posts():
    return send_all_posts(posts_collection, profile_image_collection)

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


@socket.on('delete_post')
def delete_post(post_id):

    post = posts_collection.find_one({"id": post_id})

    if ((post.get("author") == "Guest" and session.get("username") == "Guest") or (session.get("username") != "Guest")): 

        # find one, if message type = shame, set hidden to true
        
        if (post["messageType"] == "shame"):


            updatedPost = {
                'messageType': post["messageType"],
                "author": post["author"],
                "content": post["content"],
                "likes": post["likes"],
                "id": post["id"],
                "image_path": post["image_path"],
                "top": post["top"],
                "left": post["left"],
                "hidden": True
            }

            posts_collection.update_one({"id": post_id}, {"$set": updatedPost})

        else:
            posts_collection.delete_one({'id': post_id})



        statistics['posts_deleted'] += 1
        socket.emit('post_deleted', {'post_id': post_id})
        socket.emit('statistics', statistics)
        printMsg(post_id)


@socket.on('like_post')
def handle_like_post(message_id):
    result = handle_post_like_ws(session["username"], posts_collection, message_id)
    printMsg(result)
    if result != None:
        socket.emit('post_liked', {'message_id': message_id, 'likes': result})


@socket.on('connect')
def handle_connect():
    # printMsg(session["username"])
    statistics['unique_users'] += 1
    socket.emit('statistics', statistics)
    # socket.emit('connect', {'username': session.get('username')})
    # printMsg(session.get('username'))



@socket.on('disconnect')
def handle_disconnect():
    # socket.emit('disconnect', {'username': session.get('username')})
    pass


#* Util *#
def error_handler(e):
    print('An error occurred:', e)


@app.route('/print')
def printMsg(message):
    output = f"\n\033[32m=== Printing to Console ===\033[0m\n\033[97m{message}\033[0m\n\033[32m=== End of Message ===\033[0m"
    app.logger.info(output)
    return "Check your console"

if __name__ == '__main__':
    # socket.run(app, debug=True, host='0.0.0.0', port=8080, allow_unsafe_werkzeug=True)
    #app.run(debug=True, host='0.0.0.0', port=8080)
    app.run(debug=True, host='0.0.0.0', port=8080)