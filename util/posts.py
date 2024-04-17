import json
from pymongo import MongoClient
from flask import Flask, render_template, request, send_from_directory, make_response, redirect, session, url_for, jsonify
from markupsafe import escape
from util.auth import *
from util.image import *
from server import printMsg
from flask import session

# create post, add to database, returns 201 created json response
def create_post_response(request, auth_collection, posts_collection):
    auth_token = request.cookies.get('auth')
    username = getUsername(auth_token, auth_collection)
    content = str(escape(request.json.get('content')))

    new_post = {
        'author': username,
        'content': content,
        'likes': [],
        'id': str(uuid.uuid4())
    }

    response = jsonify(new_post)
    response.status_code = 201
    response.mimetype = 'application/json; charset=utf-8'
    
    posts_collection.insert_one(new_post)

    return response

def send_all_posts(posts_collection, profile_image_collection):
    posts = list(posts_collection.find({}))

    posts_list = []
    for post in posts:

        image_path = get_profile_image(post["author"], profile_image_collection)

        # printMsg(image_path)

        post_data = {
            "author": post["author"],
            "content": post["content"],
            "likes": post["likes"],
            "id": post["id"],
            "image_path": image_path
        }
        posts_list.append(post_data)

    # Return the list of posts as JSON response
    response = jsonify(posts_list)
    response.status_code = 200
    response.mimetype = 'application/json; charset=utf-8'

    return response

def handle_post_like(request, auth_collection, posts_collection, messageId, profile_image_collection):
    # Get username, if username = guest, do nothing
    auth_token = request.cookies.get('auth')
    username = getUsername(auth_token, auth_collection)
    image_path = get_profile_image(username, profile_image_collection)

    if username == "Guest":
        response = make_response("Unauthorized", 403)
        response.mimetype = 'text/plain; charset=utf-8'
        return response
    
    post = posts_collection.find_one({"id": messageId})

    if username in post["likes"]:
        updatedLikes = [like for like in post["likes"] if like != username]
    else:
        updatedLikes = post["likes"] + [username]

    updatedPost = {
        "author": post["author"],
        "content": post["content"],
        "likes": updatedLikes,
        "id": post["id"],
        "image_path": image_path
    }

    posts_collection.update_one({"id": messageId}, {"$set": updatedPost})

    # Return updated post as JSON response
    response = jsonify(updatedPost)
    response.status_code = 200
    response.mimetype = 'application/json; charset=utf-8'
    return response