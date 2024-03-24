import uuid
import hashlib
import bcrypt
from flask import make_response, redirect, session, url_for
from markupsafe import escape

# set this upon the user logging in
def setAuthToken(response, username, auth_collection):
    # HttpOnly directive set, give user auth token, store hash of token in db
    token = str(uuid.uuid4())
    response.headers['Set-Cookie'] = f'auth={token}; Max-Age=136000; HttpOnly'
    
    # You must store a hash (no salt) of each token in your database
    hashed_token = hashlib.sha256(token.encode()).digest()
    auth_token = {
        "username": username,
        "hashed_token": hashed_token
    }
    
    auth_collection.insert_one(auth_token)


# use for when the user logs out
def removeAuthToken(request, response, auth_collection):
    # get token
    auth_token = request.cookies.get("auth", "")
    hashed_token = hashlib.sha256(auth_token.encode()).digest()

    # remove token from db
    result = auth_collection.delete_one({"hashed_token": hashed_token})

    # send response with empty auth token and expires directive
    response.headers['Set-Cookie'] = 'auth=; Max-Age=136000; HttpOnly'
    return


def handleRegister(request, user_collection):
    username = str(escape(request.form.get("username")))
    password = request.form.get("password")
    password2 = request.form.get("password2")

    # check if username/pass is empty string
    if username == "" or password == "" or password2 == "":
        session['register_error'] = "Please enter a valid username/password!"
        return redirect(url_for("index"))

    # check if passwords are equal
    if password != password2:
        session['register_error'] = "Passwords are not equal!"
        return redirect(url_for("index"))
    
    # check if username is already taken
    userExists = user_collection.find_one({'username': username})
    if userExists:
        session['register_error'] = "Username is already taken!"
        return redirect(url_for("index"))

    # use bcrypt to salt+hash
    salted_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

    user_login = {
        "username": username,
        "salted_hash": salted_hash,
    }
    
    # store in user_collection
    user_collection.insert_one(user_login)

    session['register_error'] = f"Register Successful!, your username is {username}!"
    return redirect(url_for("index"))


def handleLogin(request, user_collection, auth_collection):
    username = str(escape(request.form.get("username_login")))
    password = request.form.get("password_login")    
    response = make_response(redirect(url_for("application")))

    # check if username is empty
    if username == "":
        session['login_error'] = "Please enter a valid username!"
        return redirect(url_for("index"))

    userDict = user_collection.find_one({'username': username})
    # use bcrypt to check

    if userDict:
        # check that hash matches 
        if bcrypt.checkpw(password.encode(), userDict["salted_hash"]):
            # give user an auth cookie
            setAuthToken(response, username, auth_collection)
            session['login_error'] = f"Login Successful! Welcome {username}"
            return response
        
    session['login_error'] = "Invalid Login!"
    return redirect(url_for("index"))


def getUsername(token, auth_collection):

    username = "Guest"

    if not token:
        return username
    
    hashed_token = hashlib.sha256(token.encode()).digest()

    result = auth_collection.find_one({"hashed_token": hashed_token})

    if result:
        username = result["username"]

    return username