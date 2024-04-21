import json
from pymongo import MongoClient
from flask import Flask, render_template, request, send_from_directory, make_response, redirect, session, url_for, jsonify
from markupsafe import escape
from util.auth import *
from util.image import *
from flask import session



def create_post_json(content, username, image_path):
    content = str(escape(content))

    new_post = {
        'messageType': "post",
        'author': username,
        'content': content,
        'likes': [],
        'id': str(uuid.uuid4()),
        "image_path": image_path
    }

    return new_post