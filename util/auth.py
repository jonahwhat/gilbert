import uuid
import hashlib

# set this upon the user logging in
def setAuthToken(response, username, auth_collection):
    # HttpOnly directive set, give user auth token, store hash of token in db
    token = str(uuid.uuid4())
    response.headers['Set-Cookie'] = f'auth={token}; Max-Age=36000; HttpOnly'
    
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
    response.headers['Set-Cookie'] = 'auth=; Max-Age=1; HttpOnly'
    
    # response.setResponseLine("HTTP/1.1 302 Found")
    # response.setContentType("application/json; charset=utf-8")
    # response.addHeader("Location: /")