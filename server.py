from pymongo import MongoClient
from flask import Flask, request, send_from_directory, make_response
from markupsafe import escape

app = Flask(__name__)
app.config['SESSION_COOKIE_HTTPONLY'] = True


@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response



@app.route('/')
@app.route('/index')
def index():
    return send_from_directory('public', 'index.html')
# assumes database users with data id password and username per user
@app.route('/login', methods=['POST'])
def login():
    user_data = request.json
    username = user_data['username']
    password = user_data['password']
    
    # Find the user by username
    user = users_collection.find_one({'username': username})
    
    if user and hash(password) == user['password']:
        session['user_id'] = str(user['_id'])

@app.route('/test')
def testRoute():
    return send_from_directory('static', 'holycow.png')


@app.route('/user/<username>')
def profile(username):
    print(request.method)
    return f"Your Username is {escape(username)}, your method is {request.method}, full method: {request} "


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
