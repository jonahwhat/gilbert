console.log("Hello, World!");

function updatePost(){
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            clearPostMain();
            const posts = JSON.parse(this.response);
            for (const post of posts) {
                displayPost(post);
            }
        }
    }
    request.open("GET", "/send_posts"); //change path to whatever we are using
    request.send();
}

function likePost(messageId){
    const request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            updatePost();
        }
    }
    request.open("POST", "/handle_like/" + messageId);
    request.send();
}

function clearPostMain(){
    const postMain = document.querySelector(".post-list");
    postMain.innerHTML = "";
}

function sendPost(){
    const postTextBox = document.querySelector(".create-text");
    const message = postTextBox.value; //value of the post or message
    if (message == "") {
        return
    }
    console.log(message)
    postTextBox.value = "";
    // Using AJAX
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            console.log(this.response);
        }
    }
    const messageJSON = {"content": message};
    request.open("POST", "/create_post");
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(messageJSON));
    postTextBox.focus();

    updatePost();
}

function welcome() {
    document.getElementById("js-test").innerHTML += " This text was added by JavaScript 😀";
}

function initializePostPage() {
    updatePost()
    document.addEventListener("keypress", function (event) {
        if (event.code === "Enter") {
            event.preventDefault();
            sendPost();
        }
    });
    setInterval(updatePost, 1000);
}

function createPostHTML(postJSON) {
    // todo edit this to include postJSON.profilepicture
    const username = postJSON.author;
    const message = postJSON.content;
    const messageId = postJSON.id;
    const likesNumber = postJSON.likes.length;
    const imagePath = postJSON.image_path;
    // let postHTML = `<div class="post" id="${messageId}"><div class="post-header"><img id="post-avatar" class="avatar" src="/static/img/Profile-Avatar-PNG-Picture.png"/><h3 class="username">${username}</h3></div><div class="post-body"><p class="post-p">${message}</p></div><div class="post-footer"><div class="like"><button class="like-btn" onclick="likePost('${messageId}')"><img class="like-img" src="/static/img/heart.png" /><h5>${likesNumber}</h5></button></div></div></div>`
    let postHTML = `<div class="post" id="${messageId}"><div class="post-header"><img id="post-avatar" class="avatar" src="${imagePath}"/><h3 class="username">${username}</h3></div><div class="post-body"><p class="post-p">${message}</p></div><div class="post-footer"><div class="like"><button type="button" class="like-btn" onclick="likePost('${messageId}')"><img class="like-img" src="/static/img/heart.png" /><h5>${likesNumber} likes</h5></button></div></div></div>`;
    return postHTML;
}

function displayPost(messageJSON) {
    const chatMessages = document.getElementById("post-list");
    chatMessages.innerHTML = createPostHTML(messageJSON) + chatMessages.innerHTML;
    // chatMessages.scrollIntoView(false);
    // chatMessages.scrollTop = chatMessages.scrollHeight - chatMessages.clientHeight;
}

function initializeWebSocket() {
    socket = io()
    socket.connect('http://localhost:8080/')
    socket.on('connect', function() {
        console.log('Connected to server');
    });
    socket.on('disconnect', function() {
        console.log('Disconnected from server');
    });
    socket.on('message', function(data) {
        console.log('Received message:', data);
    });
    socket.on('new_post', function(data) {
        console.log('New post:', data);
    });
}
