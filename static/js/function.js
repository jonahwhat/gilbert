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


document.addEventListener('DOMContentLoaded', () => {

    if (ws) {
        initWS()
    }

    socket.on('update-online-users', updateOnlineUserlistSocket)

    socket.on('recieve_gilbert_thoughts', updateGilbertThoughtSocket)

    socket.on('start_gilbert', startGilbertSocket);

    socket.on('gilbert_die', gilbertDeathSocket)

    socket.on('reset_gilbert', resetGilbertSocket)

    socket.on('recieve_gilbert_stats', updateGilbertStatsSocket)

    socket.on('new_enemy_group', newEnemyGroupSocket)

    socket.on('update_enemy_frontend', updateEnemySocket)

    socket.on('upgrade_purchase', purchaseGilbertUpgradeSocket)

    socket.on('new_post', newPostSocket)

    socket.on('statistics', updateStatisticsSocket)

    socket.on('post_deleted', deletePostSocket)

    socket.on('post_liked', likePostSocket)

});

function updateGilbertEnemiesDict() {
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            clearEnemiesMain();


            const enemies = JSON.parse(this.response);

            if (enemies) {
                
                for (const [id, monster] of Object.entries(enemies)) {
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

    postTextBox.value = "";
    // Using AJAX
    if (ws) {
        socket.emit('create_post_ws', message);
    } else {
        const request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
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