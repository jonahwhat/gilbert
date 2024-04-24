import json
import random
from pymongo import MongoClient
from flask import Flask, render_template, request, send_from_directory, make_response, redirect, session, url_for, jsonify
from markupsafe import escape
from util.auth import *
from util.image import *
from flask import session



def create_post_json(content, username, image_path):
    content = str(escape(content))
    messageType = "post"

    if len(content) >= 500:
        content = "This guy just tried to crash our site by entering a super long string 😠"
        messageType = "shame"

    # TODO new message type if len >500, send to wall of shame lmao

    new_post = {
        'messageType': messageType,
        'author': username,
        'content': content,
        'likes': [],
        'id': str(uuid.uuid4()),
        "image_path": image_path,
        "top": random.randint(1, 80),
        "left": random.randint(1, 80),
        "hidden": False,
    }

    return new_post

def handle_post_like_ws(username, posts_collection, messageId):


    if username == "Guest":
        return None
    
    post = posts_collection.find_one({"id": messageId})

    if not post:
        return None

    if username in post["likes"]:
        updatedLikes = [like for like in post["likes"] if like != username]
        stats = -1
    else:
        updatedLikes = post["likes"] + [username]
        stats = 1

    updatedPost = {
        'messageType': post["messageType"],
        "author": post["author"],
        "content": post["content"],
        "likes": updatedLikes,
        "id": post["id"],
        "image_path": post["image_path"],
        "top": post["top"],
        "left": post["left"],
        "hidden": post["hidden"]
    }

    posts_collection.update_one({"id": messageId}, {"$set": updatedPost})
    return [len(updatedLikes), stats]