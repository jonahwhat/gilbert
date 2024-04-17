import hashlib
import os
import uuid



def handle_profile_picture_upload(request, profile_image_collection, username):
    if 'upload_profile_pic' not in request.files:
        return 'there is no image in the form!'
    
    
    image = request.files['upload_profile_pic']
    image_bytes = image.read()
    image_type = get_file_type(image_bytes)

    if image_type == False:
        return 'invalid image type!'
    
    filename =str(uuid.uuid4()) + "." + image_type
    upload_directory = "./static/public/image"
    os.makedirs(upload_directory, exist_ok=True)
    upload_path = os.path.join(upload_directory, filename)

    # write to disk
    with open(upload_path, "wb") as imageCopy:
        imageCopy.write(image_bytes)
        imageCopy.flush()
        imageCopy.close()

    
    # store image
    store_profile_image_path(username, profile_image_collection, upload_path)

    # return f'The image is uploaded. You can view it <a href="{upload_path}">here</a>.'


def store_profile_image_path(username, profile_image_collection, upload_path):

    existing_record = profile_image_collection.find_one({"username": username})

    # if a record with the same hashed token exists, delete it
    if existing_record:
        profile_image_collection.delete_one({"username": username})
    

    profile_picture = {
        "upload_path": upload_path,
        "username": username
    }

    # insert into db
    profile_image_collection.insert_one(profile_picture)


def get_profile_image(username, profile_image_collection):

    result = profile_image_collection.find_one({"username": username})

    if result:
        return result["upload_path"]
    else:
        return "/static/img/Profile-Avatar-PNG-Picture.png"


def get_file_type(content):
    file_types = {
        b'\xFF\xD8\xFF': 'jpg',
        b'\x89\x50\x4E\x47': 'png',
        b'\x47\x49\x46\x38': 'gif',
        # b'\x66\x74\x79\x70': 'mp4',
        # b'\x00\x00\x00\x18fty': 'mp4',
        # b'\x00\x00\x00\x18': 'mp4',
        b'\xFF': 'jpg',
        b'\x89': 'png',
        b'\x47': 'gif',
        # b'\x00': 'mp4',
    }

    for signature, type in file_types.items():
        if content.startswith(signature):
            print("file type found: " + type)
            return type

    return False