// this code is awful please ignore
// this code is awful please ignore
// this code is awful please ignore
// this code is awful please ignore
// this code is awful please ignore

const ws = true;
let socket = null

const audioDict = {
    "minimize": new Audio("/static/sounds/Windows 98 minimize.wav"),
    "chimes": new Audio("/static/sounds/CHIMES.WAV"),
    "chord": new Audio("/static/sounds/CHORD.WAV"),
    "dead": new Audio("/static/sounds/dead.mp3"),
    "ding": new Audio("/static/sounds/DING.WAV"),
    "tada": new Audio("/static/sounds/TADA.WAV"),
    "microsoft_sound": new Audio("/static/sounds/The Microsoft Sound.wav"),
    "startup": new Audio("/static/sounds/Windows 98 startup.wav"),
    "upgrade": new Audio("/static/sounds/upgrade.wav"),
    "enemy": new Audio("/static/sounds/enemy.wav"),
    "attack_sword": new Audio("/static/sounds/attack_sword.wav"),
    "good": new Audio("/static/sounds/good_job.wav"),
    "hit": new Audio("/static/sounds/hit.wav"),
    "portal": new Audio("/static/sounds/portal.wav"),
    "spider": new Audio("/static/sounds/spider_death.wav"),
    "pickup": new Audio("/static/sounds/pickup.wav"),
    "click": new Audio("/static/sounds/click.wav"),
    "moai": new Audio("/static/sounds/moai.mp3"),
    "boom": new Audio("/static/sounds/boom.mp3"),
    "emoji_boss": new Audio("/static/sounds/emoji_boss_spawn.wav"),
    "emoji_attack": new Audio("/static/sounds/emoji_attack.wav"),
    "gilbert_damage": new Audio("/static/sounds/gilbert_damage.wav"),
}


function initWS() {
    // Establish a WebSocket connection with the server
    socket = io();
    audioDict.microsoft_sound.play()
}

function updateGilbertEnemiesDict() {
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            clearEnemiesMain();


            const enemies = JSON.parse(this.response);
            // console.log("entire enemy list: ", enemies)

            if (enemies) {
                
                for (const [id, monster] of Object.entries(enemies)) {
                    // console.log(monster)
                    setTimeout(() => {
                        
                        if (monster.alive) {
                            createEnemy(monster);
                        } else {
                            createLoot(monster)
                        }
                
                        }, Math.floor(Math.random() * 3) * getRandomDelay());
                }
            }

        }
    };
    request.open("GET", "/send_gilbert_enemies");
    request.send();
}


function updatePost() {
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            clearPostMain();

            let button = document.getElementById('pet_button');
            button.disabled = false;

            const posts = JSON.parse(this.response);
            posts.forEach((post, index) => {
                // Delay the display of each post


                setTimeout(() => {
                    displayPost(post);

                    // console.log(post.content)
                }, index * getRandomDelay());
            });
        }
    };
    request.open("GET", "/send_posts"); //change path to whatever we are using
    request.send();
}

// Function to get a random delay value
function getRandomDelay() {
    return Math.floor(Math.random() * 100);
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
    const postMain = document.getElementById("post-list");
    postMain.innerHTML = "";
}

function clearEnemiesMain() {
    const postMain = document.getElementById("enemy-list");
    postMain.innerHTML = "";
}


function sendPost() {

    const postTextBox = document.querySelector(".create-text");
    const message = postTextBox.value; //value of the post or message
    if (message == "") {
        return
    }

    let button = document.getElementById('post_button');
    button.disabled = true;
    button.classList.add('buttonClick');

    let textarea = document.getElementById("text_area_post");
    textarea.disabled = true

    setTimeout(function () {
        button.disabled = false;
        button.classList.remove('buttonClick')
        textarea.disabled = false;

    }, 2500);

    // console.log(message)
    postTextBox.value = "";
    // Using AJAX
    if (ws) {
        socket.emit('create_post_ws', message);
        // console.log("hello")
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


function initializePostPage() {
    updatePost()
    updateGilbertEnemiesDict()
    audioDict.microsoft_sound.play()
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


    let postHTML = `<div class="window postwindow draggable" id="${messageId}" style="top: ${top}%; left: ${left}%">
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

    // slightly horrible code, too bad!
    socket.on('update-online-users', function(incoming_data) {
        // console.log("update-online-users: ", incoming_data)

        const type = incoming_data.type
        const userList = document.getElementById(`user-list`)

        if (type == 'all_users') {

            userList.innerHTML = ``

            for (const [index, username] of Object.entries(incoming_data.data)) {
                // console.log(username)
                const id = `${username}-online-user-list`
                if (!document.getElementById(id)) {
                    const userHTML = `<li id='${id}'>${username}</li>`
                    userList.insertAdjacentHTML('afterbegin', userHTML);
                }
            }

        } else if (type == 'single_user_connect') {
            const id = `${incoming_data.data}-online-user-list`
            if (!document.getElementById(id)) {
                const userHTML = `<li id='${id}'>${incoming_data.data}</li>`
                userList.insertAdjacentHTML('afterbegin', userHTML);

                usernameElement = document.getElementById(id)

                usernameElement.classList.add('buttonClick');
                usernameElement.addEventListener('animationend', function () {
                    usernameElement.classList.remove('buttonClick');
                });
            }

        } else if (type == 'single_user_disconnect') {
            const listElement = document.getElementById(`${incoming_data.data}-online-user-list`)
            if (listElement) {
                listElement.remove()
            }

        }
    });


    socket.on('recieve_gilbert_thoughts', function (data) {
        // console.log('Received thought:', data.message);
        update_gilb_thought(data.message)
    });

    socket.on('start_gilbert', function (data) {
        // console.log('gilbert starting!');
        audioDict.startup.play()
        update_gilb_thought("i'm gilbert!!!")

        let button = document.getElementById('pet_button');
        button.disabled = false;

    });

    socket.on('gilbert_die', function (data) {
        // console.log('gilbert died!');
        audioDict.dead.play()
        update_gilb_thought("i died...")

        document.getElementById('website-title').innerHTML = `Yap Chat`;

        let pet_button = document.getElementById('pet_button');
        pet_button.disabled = true;

        let feed_button = document.getElementById('feed_button');
        feed_button.disabled = true;

        document.getElementById('gilbert_stage_explanation').innerText = `Gilbert has passed away...`;



        // reset all to normal
        // todo change this to socket type=reset instead of timeout, let this be handled by server
        setTimeout(function () {
            feed_button.disabled = false;
            update_gilb_thought("i wish someone would give me some food...")

            document.getElementById('gilbert_health_stats').innerHTML = `Nothing here yet...`;
            document.getElementById('gilbert_hunger_stats').innerHTML = ``;
            document.getElementById('gilbert_seconds_alive').innerHTML = ``;

            document.getElementById('gilbert_happiness_stats').innerHTML = ``;
            document.getElementById('gilbert_title_bar').innerText = `❓ Gilbert`;
            document.getElementById('gilbert_seconds_alive').innerHTML = ``;

            document.getElementById('gilbert_status').innerHTML = `<b>Gilbert</b>`;

            document.getElementById('gilbert_emoji').innerText = `❓`;

            document.getElementById('gilbert_stage_explanation').innerText = ``;
            document.getElementById('gilbert_gold').innerHTML = ``;
            document.getElementById('gilbert_level').innerHTML = ``;
            document.getElementById('gilbert_xp').innerHTML = ``;

            document.getElementById("pet_button").style.display = "none"
            document.getElementById("gilbert_upgrades").hidden = true

            document.getElementById('health-upgrade-button').disabled = false
            document.getElementById('defense-upgrade-button').disabled = false
            document.getElementById('damage-upgrade-button').disabled = false
            document.getElementById('luck-upgrade-button').disabled = false
            document.getElementById('regen-upgrade-button').disabled = false


            // remove stats div
            const aboutGilbert = document.getElementById("aboutGilbertDiv");
            aboutGilbert.style.display = "none";
            clearEnemiesMain()

        }, 21000);

    });

    socket.on('recieve_gilbert_stats', function (data) {
        // console.log('Received gilbert stats:', data);   

        let status = "dead"
        if (data.alive == true) {
            status = "alive"
        }

        let emoji = "😎"
        let health = data.health

        if (health >= 90) {
            emoji = "😎"
        } else if (health >= 75) {
            emoji = "🙂‍"
        } else if (health >= 50) {
            emoji = "😐"
        } else if (health >= 25) {
            emoji = "😟"
        } else if (health >= 1) {
            emoji = "😔"
        } else {
            emoji = "💀"
        }

        if (status == "dead") {
            emoji = "💀"
        }

        // show stats div
        const aboutGilbert = document.getElementById("aboutGilbertDiv");
        if (aboutGilbert.style.display === "none") {
            aboutGilbert.style.display = "initial";
        }

        gilbert_stage = data.stage

        // only display certain things depending on the stage of gilbert
        if (gilbert_stage >= 0) {
            // update statistics box
            document.getElementById('gilbert_health_stats').innerHTML = `❤️ Health: <b>${data.health}</b>/${data.max_health}`;
            document.getElementById('gilbert_hunger_stats').innerHTML = `🍇 Hunger: <b>${data.hunger}</b>/100`;
            document.getElementById('gilbert_seconds_alive').innerHTML = `🕑 Time Alive: <b>${data.seconds_alive} seconds</b>`;

            // website title
            document.getElementById('website-title').innerHTML = `Gilbert (${data.health}/100 hp)`;

            // gilbert status
            document.getElementById('gilbert_status').innerHTML = `<b>Gilbert</b> (Level ${data.level})`;

            // gilbert emoji picture
            document.getElementById('gilbert_emoji').innerText = `${emoji}`;

            // gilbert's title bar
            document.getElementById('gilbert_title_bar').innerText = `${emoji} Gilbert (${data.health}/${data.max_health} hp)`;

            // update stage explanation
            document.getElementById('gilbert_stage_explanation').innerText = `Don't let Gilbert's hunger get too low!`;

        }

        if (gilbert_stage >= 1) {
            // show happiness stat
            const happinessStat = document.getElementById('gilbert_happiness_stats');

            happinessStat.innerHTML = `🌈 Happiness: <b>${data.happiness}</b>/100`;

            // show feed button
            const petButton = document.getElementById("pet_button");
            // play an animation on join
            if (petButton.style.display === "none") {

                audioDict.upgrade.play()

                petButton.classList.add('windowShake');

                setTimeout(function () {
                    petButton.classList.remove('windowShake')
                }, 1000);

                petButton.style.display = "initial";
            }

            // update stage explanation
            document.getElementById('gilbert_stage_explanation').innerText = `Give Gilbert treats to keep him happy!`;
        }

        if (gilbert_stage >= 2) {

            if (!document.getElementById('gilbert_gold').innerHTML) {
                audioDict.upgrade.play()
            }

            document.getElementById('gilbert_level').innerHTML = `🏰 Level: <b>${data.level}</b>`;
            document.getElementById('gilbert_gold').innerHTML = `🪙 Gold: <b>${data.gold}</b>`;
            document.getElementById('gilbert_xp').innerHTML = `✨ XP: <b>${data.xp}</b>/${data.xp_to_levelup}`;
            document.getElementById('gilbert_stage_explanation').innerText = `gilbert is ${data.status}`;
        }

        if (gilbert_stage >= 3) {

            const gilbertUpgrades = document.getElementById("gilbert_upgrades");
            if (gilbertUpgrades.hasAttribute("hidden")) {

                audioDict.upgrade.play()

                gilbertUpgrades.classList.add('windowShake');

                setTimeout(function () {
                    gilbertUpgrades.classList.remove('windowShake')
                }, 1000);

                gilbertUpgrades.removeAttribute("hidden");
                makeDraggable()
            }

            document.getElementById('shop-gold-display').innerHTML = `🪙 Your Gold: <b>${data.gold}</b>`;

            // damage updates
            document.getElementById('damage-upgrade-stat').innerHTML = `Damage: <b> ${data.damage}</b> / 10`;

            if (data.upgrades.damage_cost == "max") {
                document.getElementById('damage-upgrade-button').innerHTML = `<b>Max Upgrade!</b>`;
                document.getElementById('damage-upgrade-button').disabled = true
            } else {
                document.getElementById('damage-upgrade-button').innerHTML = `<b>Upgrade</b> (${data.upgrades.damage_cost} gold)`;
            }

            // defense
            document.getElementById('defense-upgrade-stat').innerHTML = `Defense: <b> ${data.defense} %</b>`;

            if (data.upgrades.defense_cost == "max") {
                document.getElementById('defense-upgrade-button').innerHTML = `<b>Max Upgrade!</b>`;
                document.getElementById('defense-upgrade-button').disabled = true
            } else {
                document.getElementById('defense-upgrade-button').innerHTML = `<b>Upgrade</b> (${data.upgrades.defense_cost} gold)`;
            }


            // max health
            document.getElementById('health-upgrade-stat').innerHTML = `Max Health: <b> ${data.max_health}</b> / 200`;

            if (data.upgrades.health_cost == "max") {
                document.getElementById('health-upgrade-button').innerHTML = `<b>Max Upgrade!</b>`;
                document.getElementById('health-upgrade-button').disabled = true
            } else {
                document.getElementById('health-upgrade-button').innerHTML = `<b>Upgrade</b> (${data.upgrades.health_cost} gold)`;
            }

            // regen
            document.getElementById('regen-upgrade-stat').innerHTML = `Regeneration: <b> ${data.regen} </b> hp`;
            
            if (data.upgrades.regen_cost == "max") {
                document.getElementById('regen-upgrade-button').innerHTML = `<b>Max Upgrade!</b>`;
                document.getElementById('regen-upgrade-button').disabled = true
            } else {
                document.getElementById('regen-upgrade-button').innerHTML = `<b>Upgrade</b> (${data.upgrades.regen_cost} gold)`;
            }

            // luck
            document.getElementById('luck-upgrade-stat').innerHTML = `Loot Luck: <b> ${data.luck} %</b>`;

            if (data.upgrades.luck_cost == "max") {
                document.getElementById('luck-upgrade-button').innerHTML = `<b>Max Upgrade!</b>`;
                document.getElementById('luck-upgrade-button').disabled = true
            } else {
                document.getElementById('luck-upgrade-button').innerHTML = `<b>Upgrade</b> (${data.upgrades.luck_cost} gold)`;
            }
            
        }





        // handle gilbert animations
        let pic = document.getElementById('gilbert_emoji')

        if (status == "alive") {
            if (!pic.classList.contains('gilbert-anim-alive')) {
                pic.classList.add('gilbert-anim-alive');
            }
        } else {
            pic.classList.remove('gilbert-anim-alive');
        }

    });


    socket.on('new_enemy_group', function (data) {

        for (const [id, monster] of Object.entries(data)) {
            setTimeout(() => {
           
                createEnemy(monster);

                if (monster.type == "bonus") {
                    audioDict.portal.play()
                } else if (monster.type == "boss") {
                    const boss = monster.boss_type
                    if (boss == "moai") {
                        var audio = audioDict.moai
                        audio.volume = 0.5
                        audio.play()
                    } else if (boss == "emoji") {
                        var audio = audioDict.emoji_boss
                        audio.volume = 0.7
                        audio.play()
                    }
                } else {
                    audioDict.enemy.play()
                }
        
                }, Math.floor(Math.random() * 3) * getRandomDelay());

        }



    });

    socket.on('update_enemy_frontend', function (data) {

        if (data.interaction_type == "player_attack") {

            document.getElementById(`monster_health_${data.id}`).innerHTML = `❤️ Health: <b>${data.health}</b>`
            document.getElementById(`monster_titleid_${data.id}`).innerHTML = `${data.emoji} ${data.name} (${data.health} hp)`

            // if health is zero, gray out button
            if (data.health <= 0) {
                var button = document.getElementById(`buttonid_${data.id}`)
                
                // horrible code to make sure button is actually disabled
                setTimeout(function () {
                    button.disabled = true
                }, 500);
                setTimeout(function () {
                    button.disabled = true
                }, 1100);
                setTimeout(function () {
                    button.disabled = true
                }, 2100);

                button.innerHTML = "☠️ Emoji Dead"

                setTimeout
            }

        } else if (data.interaction_type == "attack_gilbert") {

            const enemyType = data.type

            if (enemyType == "boss") {
                const bossType = data.boss_type
                console.log(bossType)
                if (bossType == "moai") {
                    var audio = audioDict.boom
                    audio.volume = 0.7
                    audio.play()
                } else if (bossType == "emoji") {
                    var emojiAudio = audioDict.emoji_attack
                    emojiAudio.volume = 0.7
                    emojiAudio.play()
                }


                const postElement = document.getElementById(data.id);
                if (postElement) {
                    // remove existing animation because css sucks
                    postElement.classList.remove('float-slow');
                    postElement.classList.add('wobble-hor-bottom');
                    
                    // wait for animation to end, then readd the idle boss animation
                    postElement.addEventListener('animationend', function () {
                        postElement.classList.remove('wobble-hor-bottom');
                        postElement.classList.add('float-slow');

                    });
                }

            } else {
                var hitSound = audioDict.hit
                hitSound.volume = 0.3

                if (hitSound.paused) { 
                    hitSound.play();
                } else {
                    hitSound.currentTime = 0;
                    hitSound.play();
                }

                    
                const postElement = document.getElementById(data.id);
                if (postElement) {
                    postElement.classList.add('wobble-hor-bottom');
                    postElement.addEventListener('animationend', function () {
                        postElement.classList.remove('wobble-hor-bottom');
                    });
                }

            }


        } else if (data.interaction_type == "loot") {
        

            const postElement = document.getElementById(data.id + "_loot");
            if (postElement) {
                
                if (audioDict.pickup.paused) { 
                    audioDict.pickup.play();
                } else {
                    audioDict.pickup.currentTime = 0;
                    audioDict.pickup.play();
                }
                

                postElement.classList.add('delete-animation-fast');
                postElement.addEventListener('animationend', function () {

                    postElement.remove();
                });
            }

        } else if (data.interaction_type == "death") {


            // delete window + animation
            const postElement = document.getElementById(data.id);
            if (postElement) {
                // if bonus remove existing animation class
                if (data.type == "bonus" || data.type == "boss") {
                    postElement.classList.remove('float')
                    postElement.classList.remove('float-slow')
                }

                postElement.classList.add('delete-animation-fast');
                createLoot(data)
                audioDict.good.play()

                postElement.addEventListener('animationend', function () {
                    postElement.remove();   
                });
            }

        } else if (data.interaction_type == "emoji_death") {

            const postElement = document.getElementById(data.id);

            if (postElement) {
                postElement.classList.remove('float-slow')

                postElement.classList.add('delete-animation-fast');

                postElement.addEventListener('animationend', function () {
                    postElement.remove();   
                });
            }

        } else if (data.interaction_type == "boss_loot") {
            createLoot(data)
            audioDict.good.play()
        }
    });

    // Event listener for when a 'new_post' event is received from the server
    socket.on('new_post', function (data) {

        if (data.hidden == true) {
            return
        }

        // console.log('New post:', data);


        const messageType = data.messageType;
        // console.log(messageType)
        displayPost(data);
        audioDict.chord.play()

    });

    socket.on('statistics', function (data) {
        // console.log('stats:', data);

        document.getElementById('posts-created').innerHTML = `Posts Created: <b>${data.posts_created}</b>`;
        document.getElementById('posts-deleted').innerHTML = `Posts Deleted: <b>${data.posts_deleted}</b>`;
        document.getElementById('unique-users').innerHTML = `Unique Users: <b>${data.unique_users}</b>`;
        document.getElementById('global-likes').innerHTML = `Global Likes: <b>${data.global_likes}</b>`;
        document.getElementById('longest_life').innerHTML = `Longest Gilbert Life: <b>${data.gilbert_longest_alive} seconds</b>`;

    });

    socket.on('post_deleted', function (data) {
        const postId = data.post_id;
        const postElement = document.getElementById(postId);
        if (postElement) {
            postElement.classList.add('delete-animation');
            audioDict.chimes.play()
            postElement.addEventListener('animationend', function () {

                postElement.remove();
            });
        }
    });

    socket.on('post_liked', function (data) {
        const postId = data.message_id;
        const likesNumber = data.likes;
        // console.log("like recieved, new likes: ", likesNumber, postId)
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

    socket.on('upgrade_purchase', function (data) {
        // console.log("upgrade: ", data)

        // should really be in it's own function but whatever
        // timeout to remove after 5 seconds
        if (audioDict.upgrade.paused) { 
            audioDict.upgrade.play();
        } else {
            audioDict.upgrade.currentTime = 0;
            audioDict.upgrade.play();
        }

        const shopGold = document.getElementById("gilbert_upgrades");


        shopGold.classList.add('windowShake');

        setTimeout(function () {
            shopGold.classList.remove('windowShake')
        }, 500);

        document.getElementById("shop-interaction-status").innerHTML = `${data.username} purchased <i style="text-transform: capitalize">${data.upgrade_type}</i> level ${data.level}.`

    });

});

function deletePost(postId) {
    socket.emit('delete_post', postId);
}

function makeDraggable() {
    document.querySelectorAll('.draggable').forEach(window => {
        window.addEventListener('mousedown', bringToFront);

        const titleBar = window.querySelector('.title-bar');
        if (titleBar) {
            titleBar.addEventListener('mousedown', startDragging);
        }
    });

    function bringToFront() {
        const windows = document.querySelectorAll('.draggable');
        const maxZIndex = Math.max(...Array.from(windows).map(win => parseInt(win.style.zIndex) || 1));
        this.style.zIndex = maxZIndex + 1;
    }

    function startDragging(event) {
        const window = this.closest('.draggable');
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


function feedGilbert() {
    socket.emit('gilbert_start');

    socket.emit('update_gilbert', "feed");

    let button = document.getElementById('feed_button');
    button.disabled = true;
    button.classList.add('buttonClick');
    audioDict.minimize.play()

    setTimeout(function () {
        button.disabled = false;
        button.classList.remove('buttonClick')
    }, 1500);
}

function petGilbert() {
    socket.emit('update_gilbert', "pet");

    let button = document.getElementById('pet_button');
    button.disabled = true;
    button.classList.add('buttonClick');

    audioDict.minimize.play()

    setTimeout(function () {
        button.disabled = false;
        button.classList.remove('buttonClick')
    }, 1000);
}

function hurtGilbert() {
    socket.emit('update_gilbert', "hurt");

    let button = document.getElementById('hurt_button');
    button.disabled = true;
    button.classList.add('buttonClick');

    audioDict.minimize.play()

    setTimeout(function () {
        button.disabled = false;
        button.classList.remove('buttonClick')
    }, 1000);
}


function update_gilb_thought(message) {
    document.getElementById('gilbert_thoughts').innerHTML = message;

    // animation
    containerElement = document.getElementById('gilb_thought_container')

    if (containerElement) {
        containerElement.classList.add('jello-horizontal');
        containerElement.addEventListener('animationend', function () {
            containerElement.classList.remove('jello-horizontal');
        });
    }
}

function loginButton() {

    let button = document.getElementById('loginButton');
    button.disabled = true;
    button.classList.add('buttonClick');

    audioDict.minimize.play()

    setTimeout(function () {
        button.disabled = false;
        button.classList.remove('buttonClick')
    }, 1000);
}

function registerButton() {

    let button = document.getElementById('registerButton');
    button.disabled = true;
    button.classList.add('buttonClick');

    audioDict.minimize.play()

    setTimeout(function () {
        button.disabled = false;
        button.classList.remove('buttonClick')
    }, 1000);
}

function enemyInteraction(monsterID) {


    let button = document.getElementById(`buttonid_${monsterID}`);
    button.disabled = true;
    button.classList.add('buttonClick');

    setTimeout(function () {
        button.disabled = false;
        button.classList.remove('buttonClick')
    }, 1000);

    var gilbAudio = audioDict.gilbert_damage
    gilbAudio.volume = 0.8

    if (gilbAudio.paused) { 
        gilbAudio.play();
    } else {
        gilbAudio.currentTime = 0;
        gilbAudio.play();
    }


    socket.emit('enemy_interaction', monsterID);
}

function enemyLoot(monsterID) {

    let id = monsterID.slice(0, monsterID.lastIndexOf("_"));

    let button = document.getElementById(`buttonid_${monsterID}`);
    button.disabled = true;
    button.classList.add('buttonClick');

    setTimeout(function () {
        button.disabled = false;
        button.classList.remove('buttonClick')
    }, 1000);

    

    const postElement = document.getElementById(monsterID);
    if (postElement) {
        audioDict.pickup.play()
        postElement.classList.add('delete-animation-fast');
        postElement.addEventListener('animationend', function () {

            postElement.remove();
        });
    }


    socket.emit('enemy_interaction', id);
}


function createEnemy(messageJSON) {
    const chatMessages = document.getElementById("enemy-list");
    const postHTML = createEnemyHTML(messageJSON);
    chatMessages.insertAdjacentHTML('afterbegin', postHTML);

    const newlyAddedPost = chatMessages.querySelector('.window');

    const maxZIndex = getMaxZIndex('.window');
    newlyAddedPost.style.zIndex = maxZIndex + 1;


    newlyAddedPost.classList.add('windowShake');

    newlyAddedPost.addEventListener('animationend', function () {
        this.classList.remove('windowShake');
        if (messageJSON.type == "bonus") { 
            newlyAddedPost.classList.add('float');
        } else if (messageJSON.type == "boss") {
            newlyAddedPost.classList.add('float-slow');
        }

    }, { once: true });

    makeDraggable();
}


function createEnemyHTML(enemyJSON) {
    const top = enemyJSON.top;
    const left = enemyJSON.left;
    const health = enemyJSON.health;
    const emoji = enemyJSON.emoji;
    const description = enemyJSON.description;
    const id = enemyJSON.id;
    const damage = enemyJSON.damage_to_gilbert;
    const level = enemyJSON.level;
    const animation = enemyJSON.animation
    const attackSpeed = enemyJSON.attack_speed

    let type = enemyJSON.type
    let enemyStats = ``
    let windowClass = 'enemyWindow'
    let name = enemyJSON.name;
    let enemyLabel = `<p>${emoji}<b>${name}</b> (Level ${level})</p>`
    let top_div_html = `<div class="draggable window ${windowClass}" id="${id}" style="top: ${top}%; left: ${left}%; overflow: hidden">`

    if (type == "bonus") {
        type = "purple-highlight"
        enemyLabel = `<p>${emoji}<b>${name}</b> (Bonus)</p>`

    } else if (type == "boss") {
        type = "red-dark"
        windowClass = "bossWindow"
        enemyStats = `
        <ul class="tree-view" style="margin-top: 5px">
            <li id="monster_health_${id}">❤️ Health: <b>${health}</b></li>
            <li id="enemy_damage">🔪 Damage: <b>${damage}</b></li>
            <li id="boss_bonus">🌀 Special Ability: <b>${enemyJSON.special_attack}</b></li>
            <li id="enemy_damage" style="margin-top: 7px">${enemyJSON.attack_description}</li>
        </ul>`
        top_div_html = `<div class="draggable window ${windowClass} boss-window" id="${id}" style="top: ${top}px; left: ${left}px; overflow: hidden">`

        enemyLabel = `<p>${emoji}<b>${name}</b> (Boss)</p>`
        if (enemyJSON.boss_type == "emoji") {
            windowClass = "bossWindowSmaller"
            top_div_html = `<div class="draggable window ${windowClass} boss-window" id="${id}" style="top: ${top}px; left: ${left}px; overflow: hidden">`
        }

    } else {
        type = "red"
        enemyStats = `
        <ul class="tree-view" style="margin-top: 5px">
            <li id="monster_health_${id}">❤️ Health: <b>${health}</b></li>
            <li id="enemy_damage">🔪 Damage: <b>${damage}</b></li>
        </ul>`
    }


    let enemyHTML = `
    ${top_div_html}
            <div class="title-bar ${type}">
                <div class="title-bar-text" id="monster_titleid_${id}">
                ${emoji} ${name} (${health} hp)
                </div>
                <div class="title-bar-controls">
                    <button title="An enemy! Attack it before it attacks gilbert!" aria-label="Help"></button>
                </div>
            </div>
            <div class="window-body">
                <div class="centerGilbert">
                    <p class="enemy-anim" style="font-size: 45px; padding: 3px; margin: 3px; text-shadow: 2px 1px 2px rgba(3, 3, 3, 0.349)">${emoji}</p>
                    ${enemyLabel}
                    <i>${description}</i>
                </div>   
                ${enemyStats}
                <section class="field-row ${animation}" style="justify-content: center; margin-top: 7px">
                    <button class="like-btn" onclick="enemyInteraction('${id}')" id="buttonid_${id}">⚔️ Attack</button>
                </section>
            </div>
        </div>
    `;

    return enemyHTML;
}

function createLootHTML(enemyJSON) {
    const top = enemyJSON.top;
    const left = enemyJSON.left;
    const name_of_enemy = enemyJSON.name;
    const id = enemyJSON.id + "_loot";
    const gold = enemyJSON.gold_drop;
    const xp = enemyJSON.xp_drop;
    const health = enemyJSON.health_drop;
    const emoji = enemyJSON.emoji;
    const is_boss = enemyJSON.is_boss;
    let healthHTML = ``
    let goldHTML = ``
    let xpHTML = ``


    if (health) {
        healthHTML = `<li>🩷 Health: <b>${health}</b></li>`
    }
    if (gold) {
        goldHTML = `<li>🪙 Gold: <b>${gold}</b></li>`
    }
    if (xp) {
        xpHTML = `<li>✨ XP: <b>${xp}</b></li>`
    }

    let enemyHTML

    if (is_boss) {
        enemyHTML = `<div class="draggable window lootWindow" id="${id}" style="top: ${top}%; left: ${left}%">
            <div class="title-bar gold-highlight">
                <div class="title-bar-text">
                💰 Boss Loot!
                </div>
                <div class="title-bar-controls">
                    <button title="Loot dropped from an enemy!" aria-label="Help"></button>
                </div>
            </div>
            <div class="window-body">
                <div class="centerGilbert">
                <p class="enemy-anim" style="font-size: 50px; padding: 3px; margin: 3px; text-shadow: 2px 1px 2px rgba(3, 3, 3, 0.349)">💰</p>
                    <p><b>${emoji} ${name_of_enemy} Boss Defeated!</b></p>
                    <i></i>
                </div>   

                <hr>

                <p>📜 Items Dropped</p>
                    <ul class="tree-view">
                        ${goldHTML}
                        ${xpHTML}
                        ${healthHTML}
                    </ul>

                <section class="field-row" style="justify-content: center; margin-top: 7px">
                    <button class="like-btn" onclick="enemyLoot('${id}')" id="buttonid_${id}">Grab Loot</button>
                </section>
            </div>
    </div>`;

    } else {

    enemyHTML = `<div class="draggable window lootWindow" id="${id}" style="top: ${top}%; left: ${left}%">
            <div class="title-bar gold-highlight">
                <div class="title-bar-text">
                    💰 Loot!
                </div>
                <div class="title-bar-controls">
                    <button title="Loot dropped from an enemy!" aria-label="Help"></button>
                </div>
            </div>
            <div class="window-body">
                <div class="centerGilbert">
                <p class="enemy-anim" style="font-size: 45px; padding: 3px; margin: 3px; text-shadow: 2px 1px 2px rgba(3, 3, 3, 0.349)">💰</p>
                    <p><b>${emoji}${name_of_enemy} defeated!</b></p>
                    <i></i>
                </div>   

                <hr>

                <p>📜 Items Dropped</p>
                    <ul class="tree-view">
                        ${goldHTML}
                        ${xpHTML}
                        ${healthHTML}
                    </ul>

                <section class="field-row" style="justify-content: center; margin-top: 7px">
                    <button class="like-btn" onclick="enemyLoot('${id}')" id="buttonid_${id}">Grab Loot</button>
                </section>
            </div>
    </div>`;
    }

    return enemyHTML;
}

function createLoot(messageJSON) {
    const chatMessages = document.getElementById("enemy-list");
    const postHTML = createLootHTML(messageJSON);
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


function setActiveWindow(windowId) {
	const windowLabel = `shop-tab-${windowId}`;
	const tabLabel = `shop-tab-label-${windowId}`;
	
	// hide all windows
	var windows = document.querySelectorAll('.window[role="tabpanel"]');
	windows.forEach(function (window) {
		window.setAttribute("hidden", true);
	});
	var tabWindows = document.querySelectorAll('[role="tab"]');
	tabWindows.forEach(function (window) {
		window.setAttribute("aria-selected", false);
	});

	// show selected windows/tabs
	var activeWindow = document.getElementById(windowLabel);
	if (activeWindow) {
		activeWindow.removeAttribute("hidden");
	}
	var activeWindow = document.getElementById(tabLabel);
	if (activeWindow) {
		activeWindow.setAttribute("aria-selected", true);

        let clickSound = audioDict.click
        clickSound.volume = 0.5

        if (clickSound.paused) { 
            clickSound.play();
        } else {
            clickSound.currentTime = 0;
            clickSound.play();
        }

	}
}

function shopInteraction(upgrade_type) {
    socket.emit('shop_interaction', upgrade_type);
    
    let button = document.getElementById(`${upgrade_type}-upgrade-button`);
    button.classList.add('buttonClick');

    setTimeout(function () {
        button.classList.remove('buttonClick')
    }, 1000);
}






document.addEventListener('DOMContentLoaded', makeDraggable);