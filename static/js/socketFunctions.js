
// function that's run every time gilbert's data is sent to the client
function updateGilbertStatsSocket(data) {
    let status = "dead"
    if (data.alive == true) {
        status = "alive"
    }

    let emoji = "😎"
    let health = data.health
    if (health >= 150) {
        emoji = "🤩"
    } else if (health >= 90) {
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
        // document.getElementById("controlsWindow").style.display = "none"
        // document.getElementById("statisticsWindow").style.display = "none"
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

}


function gilbertDeathSocket(data) {
    audioDict.dead.play()
    updateGilbertThoughtSocket("i died...")

    document.getElementById('website-title').innerHTML = `Yap Chat`;

    let pet_button = document.getElementById('pet_button');
    pet_button.disabled = true;

    let feed_button = document.getElementById('feed_button');
    feed_button.disabled = true;

    document.getElementById('gilbert_stage_explanation').innerText = `Gilbert has passed away...`;



    // reset all to normal
    // todo change this to socket type=reset instead of timeout, let this be handled by server

}


function resetGilbertSocket() {
    let feed_button = document.getElementById('feed_button');
    feed_button.disabled = false;
    updateGilbertThoughtSocket("i wish someone would give me some food...")

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
    document.getElementById('website-title').innerHTML = `Yap Chat`;
    // document.getElementById("controlsWindow").style.display = "initial"
    // document.getElementById("statisticsWindow").style.display = "initial"

    // remove stats div
    const aboutGilbert = document.getElementById("aboutGilbertDiv");
    aboutGilbert.style.display = "none";
    clearEnemiesMain()
}


function updateGilbertThoughtSocket(data) {
    let message = data.message

    if (typeof data === 'string') {
        message = data
    }   

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

function startGilbertSocket(data) {
    audioDict.startup.play()
    updateGilbertThoughtSocket("i'm gilbert!!!")

    let button = document.getElementById('pet_button');
    button.disabled = false;
}


function newEnemyGroupSocket(data) {
    
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
}



function updateEnemySocket(data) {
    
    if (data.interaction_type == "player_attack") {
        // if health is zero, gray out button
        if (data.health <= 0) {
            var button = document.getElementById(`buttonid_${data.id}`)
            
            // horrible code to make sure button is actually disabled
            button.disabled = true

            setTimeout(function () {
                button.disabled = true
            }, 1020);
            setTimeout(function () {
                button.disabled = true
            }, 1100);
            setTimeout(function () {
                button.disabled = true
            }, 2000);

            button.innerHTML = "☠️ Emoji Dead"
            document.getElementById(`monster_health_${data.id}`).innerHTML = `💔 Health: 0 (dead)`
            document.getElementById(`monster_titleid_${data.id}`).innerHTML = `${data.emoji} ${data.name} (Dead)`

            setTimeout
        } else {
            document.getElementById(`monster_health_${data.id}`).innerHTML = `❤️ Health: <b>${data.health}</b>`
            document.getElementById(`monster_titleid_${data.id}`).innerHTML = `${data.emoji} ${data.name} (${data.health} hp)`
        }

    } else if (data.interaction_type == "attack_gilbert") {
        
        // handle gilbert animation
        const gilbert = document.getElementById("gilbert_div");

        if (gilbert) {
            
            gilbert.classList.add('gilbert-damage');
            gilbert.addEventListener('animationend', function () {
                gilbert.classList.remove('gilbert-damage');
            });
        }
        

        // handle enemy sound and animations
        const enemyType = data.type

        if (enemyType == "boss") {
            const bossType = data.boss_type
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
}


function purchaseGilbertUpgradeSocket(data) {
    
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

}


function updateOnlineUserlistSocket(data) {
    
    const type = data.type
    const userList = document.getElementById(`user-list`)

    if (type == 'all_users') {

        userList.innerHTML = ``

        for (const [index, username] of Object.entries(data.data)) {
            const id = `${username}-online-user-list`
            if (!document.getElementById(id)) {
                const userHTML = `<li id='${id}'>${username}</li>`
                userList.insertAdjacentHTML('afterbegin', userHTML);
            }
        }

    } else if (type == 'single_user_connect') {
        const id = `${data.data}-online-user-list`
        if (!document.getElementById(id)) {
            const userHTML = `<li id='${id}'>${data.data}</li>`
            userList.insertAdjacentHTML('afterbegin', userHTML);

            usernameElement = document.getElementById(id)

            usernameElement.classList.add('buttonClick');
            usernameElement.addEventListener('animationend', function () {
                usernameElement.classList.remove('buttonClick');
            });
        }

    } else if (type == 'single_user_disconnect') {
        const listElement = document.getElementById(`${data.data}-online-user-list`)
        if (listElement) {
            listElement.remove()
        }

    }
}


function newPostSocket(data) {
    if (data.hidden == true) {
        return
    }
    const messageType = data.messageType;
    displayPost(data);
    audioDict.chord.play()
}


function updateStatisticsSocket(data) {
    document.getElementById('posts-created').innerHTML = `Posts Created: <b>${data.posts_created}</b>`;
    document.getElementById('posts-deleted').innerHTML = `Posts Deleted: <b>${data.posts_deleted}</b>`;
    document.getElementById('unique-users').innerHTML = `Unique Users: <b>${data.unique_users}</b>`;
    document.getElementById('global-likes').innerHTML = `Global Likes: <b>${data.global_likes}</b>`;
    document.getElementById('longest_life').innerHTML = `Longest Gilbert Life: <b>${data.gilbert_longest_alive} seconds</b>`;
}


function deletePostSocket(data) {
    const postId = data.post_id;
    const postElement = document.getElementById(postId);
    if (postElement) {
        postElement.classList.add('delete-animation');
        audioDict.chimes.play()
        postElement.addEventListener('animationend', function () {

            postElement.remove();
        });
    }
}


function likePostSocket(data) {
    const postId = data.message_id;
        const likesNumber = data.likes;
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
}