console.log("Hello, World!");


function getPost(){
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            clearChat();
            const messages = JSON.parse(this.response);
            for (const message of messages) {
                addMessageToChat(message);
            }
        }
    }
    request.open("GET", "/post"); //change path to whatever we are using
    request.send();
}

function sendPost(){
    const postTextBox = document.getElementById("chat-text-box");
    const message = post.value; //value of the post or message
    postTextBox.value = "";
    // Using AJAX
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            console.log(this.response);
        }
    }
    const messageJSON = {"content": message};
    request.open("POST", "/create_post"); // path for sending post
    request.send(JSON.stringify(messageJSON));
    chatTextBox.focus();
}

function addPost(messageJSON) {
    const post = document.getElementById(""); //get id for post 
    //chatMessages.innerHTML += chatMessageHTML(messageJSON);
    post.scrollIntoView(false);
    post.scrollTop = post.scrollHeight - post.clientHeight;
}
//function if needed to handle html for post 
function postHTML(messageJSON) {
    const username = messageJSON.username;
    const message = messageJSON.message;
    const messageId = messageJSON.id;
    let messageHTML = "" //place html here for individual post
    return messageHTML;
}