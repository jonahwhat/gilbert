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

function clearPostMain(){
    const postMain = document.querySelector(".post-main");
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
}

//handle the html and display of post here
function displayPost(){

}

function welcome() {
    document.getElementById("js-test").innerHTML += " This text was added by JavaScript 😀";
}