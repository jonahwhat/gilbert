console.log("Hello, World!");

const ws = true;
let socket = null

function initWS() {
    // Establish a WebSocket connection with the server
    socket = io();
    console.log("socket: ", socket)

    // Called whenever data is received from the server over the WebSocket connection
    // socket.onmessage = function (ws_message) {
    //     const message = JSON.parse(ws_message.data);
    //     console.log(message)

    //     const messageType = message.messageType;
    //     console.log(message.messageType)

    //     if (messageType === "chatMessage") {
    //         addMessageToChat(message);
    //     } else if (messageType === "onlineUser") {
    //         addToOnlineList(message)
    //     } else if (messageType === "removeOnlineUser") {
    //         removeFromOnlineList(message)
    //     } else {
    //         // send message to WebRTC
    //         processMessageAsWebRTC(message, messageType);
    //     }
    // };
}

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
        const messageJSON = {"content": message};
        request.open("POST", "/create_post");
        request.setRequestHeader("Content-Type", "application/json");
        request.send(JSON.stringify(messageJSON));
        postTextBox.focus();
    }


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

document.addEventListener('DOMContentLoaded', () => {

    if (ws) {
        initWS()
    }


    // Event listener for when the WebSocket connection is established
    socket.on('connect', function() {
        console.log('Connected to server');
    });

    // Event listener for when the WebSocket connection is disconnected
    socket.on('disconnect', function() {
        console.log('Disconnected from server');
    });

    // Event listener for when a message is received from the server
    socket.on('message', function(data) {
        console.log('Received message:', data);
    });

    // Event listener for when a 'send_post' event is received from the server
    socket.on('send_post', function(data) {
        console.log('Received Post:', data);
    });

    // Event listener for when a 'new_post' event is received from the server
    socket.on('new_post', function(data) {
        console.log('New post:', data);


        const messageType = data.messageType;
        console.log(messageType)

        if (messageType === "post") {
            displayPost(data);
        }

    });
});


// Make the DIV elements draggable and bring to front when clicked
function makeDraggable() {
    document.querySelectorAll('.window').forEach(window => {
      window.addEventListener('mousedown', bringToFront);
      window.querySelector('.title-bar').addEventListener('mousedown', startDragging);
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
  
  // Call the function when the DOM is loaded
  document.addEventListener('DOMContentLoaded', makeDraggable);
  