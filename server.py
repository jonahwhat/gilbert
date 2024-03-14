from pymongo import MongoClient
from flask import Flask, request, send_from_directory, make_response, redirect, url_for, jsonify
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


@app.route('/test')
def testRoute():
    return send_from_directory('static', 'holycow.png')


@app.route('/user/<username>')
def profile(username):
    print(request.method)
    return f"Your Username is {escape(username)}, your method is {request.method}, full method: {request} "

@app.route('/function')
def function():
    return send_from_directory('public', 'function.js')

@app.route('/style.css')
def css():
    return send_from_directory('static', 'style.css')

@app.route('/register',methods=["POST"])
def register():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        return redirect(url_for("index"))
    else:
        return jsonify({'error': 'Method not allowed'}), 405
    
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)