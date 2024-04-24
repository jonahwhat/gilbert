console.log("Hello, World!");

const ws = true;
let socket = null

function initWS() {
    // Establish a WebSocket connection with the server
    socket = io();
    console.log("socket: ", socket)
    playWavSound("/static/sounds/The Microsoft Sound.wav");
}

function updatePost() {
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            clearPostMain();
            const posts = JSON.parse(this.response);
            posts.forEach((post, index) => {
                // Delay the display of each post
                setTimeout(() => {
                    if (post.hidden == false) {
                        displayPost(post);
                    }
                    
                    console.log(post)


                    if (post.messageType == "shame") {
                        console.log("shame post encountered")

                        const existingUser = document.getElementById("list_id_" + post.author);
                        if (!existingUser) {
                            console.log("no existing user, we should add it to list")
                            document.getElementById('user-list').innerHTML += `<li id="list_id_${post.author}">${post.author}</li>`;


                            const containerElement = document.getElementById('user-div');
                            if (containerElement) {
                                containerElement.classList.add('like-anim');
                                containerElement.addEventListener('animationend', function () {
                                    containerElement.classList.remove('like-anim');
                                });
                            }
                        }


                    }



                    console.log(post.content)
                }, index * getRandomDelay());
            });
        }
    };
    request.open("GET", "/send_posts"); //change path to whatever we are using
    request.send();
}

// Function to get a random delay value
function getRandomDelay() {
    return Math.floor(Math.random() * 70); // Random delay between 0 and 3 seconds
}


function likePost(messageId) {

    if (ws) {
        socket.emit('like_post', messageId);
    } else {
        const request = new XMLHttpRequest();

        request.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                updatePost();
            }
        }
        request.open("POST", "/handle_like/" + messageId);
        request.send();
    }
}

function clearPostMain() {
    const postMain = document.querySelector(".post-list");
    postMain.innerHTML = "";
}

function sendPost() {
    const postTextBox = document.querySelector(".create-text");
    const message = postTextBox.value; //value of the post or message
    if (message == "") {
        return
    }
    console.log(message)
    postTextBox.value = "";
    // Using AJAX
    if (ws) {
        socket.emit('create_post_ws', message);
        console.log("hello")
    } else {
        const request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                console.log(this.response);
            }
        }
        const messageJSON = { "content": message };
        request.open("POST", "/create_post");
        request.setRequestHeader("Content-Type", "application/json");
        request.send(JSON.stringify(messageJSON));
        postTextBox.focus();
    }


    // updatePost();
}

function welcome() {
    document.getElementById("js-test").innerHTML += " This text was added by JavaScript 😀";
}

function initializePostPage() {
    updatePost()
    playWavSound("/static/sounds/The Microsoft Sound.wav");
    document.addEventListener("keypress", function (event) {
        if (event.code === "Enter") {
            event.preventDefault();
            sendPost();
        }
    });

    if (!ws) {
        setInterval(updatePost, 5000);
    }
}

function createPostHTML(postJSON) {
    const username = postJSON.author;
    const message = postJSON.content;
    const messageId = postJSON.id;
    const likesNumber = postJSON.likes.length;
    const imagePath = postJSON.image_path;
    const top = postJSON.top
    const left = postJSON.left


    let imageTag = '';

    if (username != "Guest") {
        imageTag = `<img src="${imagePath}" class="postImage">`;

    }

    let windowTextList = [
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ The end is near!",
        "🚨 CRITICAL ERROR!",
        "⚠️ Warning!",
        "🎉 CONGRATULATIONS, YOU'VE WON!",
        "🏛️ Message from the US Government:",
    ]

    const numericId = parseInt(messageId, 16);
    const index = numericId % windowTextList.length;

    let windowText = windowTextList[index];


    let postHTML = `<div class="window postwindow" id="${messageId}" style="top: ${top}%; left: ${left}%">
            <div class="title-bar">
                <div class="title-bar-text">
                    ${windowText}
                </div>
    
                <div class="title-bar-controls">
                    <button aria-label="Close" onclick="deletePost('${messageId}')"></button>
                </div>
            </div>
            <div class="window-body">
                ${imageTag}
                <p>📬 Message From <b>${username}</b></p>
                <hr>
                <p>${message}</p>
                <section class="field-row" style="justify-content: flex-end">
                    <button class="like-btn" onclick="likePost('${messageId}')" >Like (${likesNumber})</button>
                </section>
            </div>
    </div>`;



    return postHTML;
}

function displayPost(messageJSON) {
    const chatMessages = document.getElementById("post-list");
    const postHTML = createPostHTML(messageJSON);
    chatMessages.insertAdjacentHTML('afterbegin', postHTML);

    const newlyAddedPost = chatMessages.querySelector('.window');

    const maxZIndex = getMaxZIndex('.window');
    newlyAddedPost.style.zIndex = maxZIndex + 1;


    newlyAddedPost.classList.add('windowShake');

    newlyAddedPost.addEventListener('animationend', function () {
        this.classList.remove('windowShake');
    }, { once: true });

    makeDraggable();
}

function getMaxZIndex(selector) {
    const elements = document.querySelectorAll(selector);
    let maxZIndex = 0;
    elements.forEach(element => {
        const zIndex = parseInt(window.getComputedStyle(element).zIndex);
        if (!isNaN(zIndex) && zIndex > maxZIndex) {
            maxZIndex = zIndex;
        }
    });
    return maxZIndex;
}


document.addEventListener('DOMContentLoaded', () => {

    if (ws) {
        initWS()
    }


    // Event listener for when the WebSocket connection is established
    socket.on('connect', function (data) {

        if (!data) {
            return
        }

        console.log(data.username, ' connected to server');
        // playWavSound("/static/sounds/TADA.WAV");

        if (data.username == "Guest") {
            return
        }

        const existingUser = document.getElementById("list_id_" + data.username);
        if (!existingUser) {
            document.getElementById('user-list').innerHTML += `<li id="list_id_${data.username}">${data.username}</li>`;


            const containerElement = document.getElementById('user-div');
            if (containerElement) {
                containerElement.classList.add('like-anim');
                containerElement.addEventListener('animationend', function () {
                    containerElement.classList.remove('like-anim');
                });
            }
        }
    });

    // TODO Event listener for when the WebSocket connection is disconnected
    socket.on('disconnect', function (data) {
        if (!data) {
            return
        }
        console.log(data.username, ' disconnected from server');
        const userListItem = document.getElementById("list_id_" + data.username);

        if (userListItem) {
            const userList = document.getElementById('user-list');
            userList.removeChild(userListItem);

            const containerElement = document.getElementById('user-div');
            if (containerElement) {
                containerElement.classList.add('like-anim');
                containerElement.addEventListener('animationend', function () {
                    containerElement.classList.remove('like-anim');
                });
            }
        }


    });

    // Event listener for when a message is received from the server
    socket.on('message', function (data) {
        console.log('Received message:', data);
    });

    // Event listener for when a 'send_post' event is received from the server
    socket.on('send_post', function (data) {
        console.log('Received Post:', data);
    });

    // Event listener for when a 'new_post' event is received from the server
    socket.on('new_post', function (data) {
        console.log('New post:', data);


        const messageType = data.messageType;
        console.log(messageType)

        if (messageType === "post") {
            displayPost(data);
            playWavSound("/static/sounds/CHORD.WAV");

        } else if (messageType === "shame") {
            displayPost(data);
            playWavSound("/static/sounds/CHORD.WAV");
            const existingUser = document.getElementById("list_id_" + data.author);
            if (!existingUser) {
                document.getElementById('user-list').innerHTML += `<li id="list_id_${data.author}">${data.author}</li>`;


                const containerElement = document.getElementById('user-div');
                if (containerElement) {
                    containerElement.classList.add('like-anim');
                    containerElement.addEventListener('animationend', function () {
                        containerElement.classList.remove('like-anim');
                    });
                }
            }

        }

    });

    socket.on('statistics', function (data) {
        console.log('stats:', data);

        document.getElementById('posts-created').innerText = `Posts Created: ${data.posts_created}`;
        document.getElementById('posts-deleted').innerText = `Posts Deleted: ${data.posts_deleted}`;
        document.getElementById('unique-users').innerText = `Unique Users: ${data.unique_users}`;

    });

    socket.on('post_deleted', function (data) {
        const postId = data.post_id;
        const postElement = document.getElementById(postId);
        if (postElement) {
            postElement.classList.add('delete-animation');
            playWavSound("./static/sounds/CHIMES.WAV");
            postElement.addEventListener('animationend', function () {

                postElement.remove();
            });
        }
    });

    socket.on('post_liked', function (data) {
        const postId = data.message_id;
        const likesNumber = data.likes;
        console.log("like recieved, new likes: ", likesNumber, postId)
        const postElement = document.getElementById(postId);
        if (postElement) {

            postElement.classList.add('like-anim');
            // playWavSound("/static/sounds/DING.WAV");
            const likeButton = postElement.querySelector('.like-btn');
            if (likeButton) {

                likeButton.textContent = `Like (${likesNumber})`;
            }
            postElement.addEventListener('animationend', function () {
                postElement.classList.remove('like-anim');
            });

        }
    });



});

function deletePost(postId) {
    socket.emit('delete_post', postId);
}

function makeDraggable() {
    document.querySelectorAll('.window').forEach(window => {
        window.addEventListener('mousedown', bringToFront);

        const titleBar = window.querySelector('.title-bar');
        if (titleBar) {
            titleBar.addEventListener('mousedown', startDragging);
        }
    });

    function bringToFront() {
        const windows = document.querySelectorAll('.window');
        const maxZIndex = Math.max(...Array.from(windows).map(win => parseInt(win.style.zIndex) || 1));
        this.style.zIndex = maxZIndex + 1;
    }

    function startDragging(event) {
        const window = this.closest('.window');
        if (window) {
            const rect = window.getBoundingClientRect();
            const offsetX = event.clientX - rect.left;
            const offsetY = event.clientY - rect.top;

            document.addEventListener('mousemove', dragWindow);
            document.addEventListener('mouseup', stopDragging);

            function dragWindow(event) {
                window.style.left = (event.clientX - offsetX) + 'px';
                window.style.top = (event.clientY - offsetY) + 'px';
            }

            function stopDragging() {
                document.removeEventListener('mousemove', dragWindow);
                document.removeEventListener('mouseup', stopDragging);
            }
        }
    }
}


function playWavSound(filename) {
    var audio = new Audio(filename);
    audio.play();
}

document.addEventListener('DOMContentLoaded', makeDraggable);