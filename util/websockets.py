import json
import random
from pymongo import MongoClient
from flask import Flask, render_template, request, send_from_directory, make_response, redirect, session, url_for, jsonify
from markupsafe import escape
from util.auth import *
from util.image import *
from flask import session



def create_post_json(content, username, image_path):
    content = str(escape(content))[:500]

    new_post = {
        'messageType': "post",
        'author': username,
        'content': content,
        'likes': [],
        'id': str(uuid.uuid4()),
        "image_path": image_path,
        "top": random.randint(1, 80),
        "left": random.randint(1, 80),
    }

    return new_post

def handle_post_like_ws(username, posts_collection, messageId):


    if username == "Guest":
        return None
    
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
        "image_path": post["image_path"]
    }

    posts_collection.update_one({"id": messageId}, {"$set": updatedPost})
    return len(updatedLikes)