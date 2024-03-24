from pymongo import MongoClient
from flask import Flask, render_template, request, send_from_directory, make_response, redirect, session, url_for, jsonify
from markupsafe import escape
from util.auth import *
from util.posts import *
from flask import session


app = Flask(__name__)
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.secret_key = 'cse312secretkeymoment1612!'

# setting up database
mongo_client = MongoClient("mongo")
db = mongo_client["cse312"]

# user_collection stores user login information
user_collection = db["user"]
# auth_collection stores auth tokens along with username
auth_collection = db["auth"]
# posts_collection stores all user posts on the main feed
posts_collection = db["posts"]

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
    return render_template('application.html', username=username)

@app.route('/register',methods=["POST"])
def register():
    if request.method == "POST":
        return handleRegister(request, user_collection)

    else:
        return jsonify({'error': 'Method not allowed'}), 405

@app.route('/create_post', methods=['POST'])
def create_post():
    return create_post_response(request, auth_collection, posts_collection)


@app.route('/send_posts', methods=['GET'])
def send_posts():
    return send_all_posts(posts_collection)


@app.route('/handle_like/<path:messageId>', methods=['POST'])
def handle_like(messageId):
    printMsg(messageId)
    return handle_post_like(request, auth_collection, posts_collection, messageId)


@app.route('/login', methods=['POST'])
def login():
    return handleLogin(request, user_collection, auth_collection)

@app.route('/logout', methods=['POST'])
def logout():
    response = make_response(redirect(url_for("index")))
    removeAuthToken(request, response, auth_collection)
    return response

@app.route('/test')
def testRoute():
    return send_from_directory('static', 'holycow.png')

@app.route('/static/js/<path:filename>')
def function(filename):
    return send_from_directory('static/js', filename, mimetype='text/javascript')

@app.route('/static/css/<path:filename>')
def serve_css(filename):
    return send_from_directory('static/css', filename, mimetype='text/css')

 
@app.route('/print')
def printMsg(message):
    output = f"\n\033[32m=== Printing to Console ===\033[0m\n\033[97m{message}\033[0m\n\033[32m=== End of Message ===\033[0m"
    app.logger.info(output)
    return "Check your console"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)