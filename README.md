# Yapchat

## Description

A chat platform with a Windows 98 theme, featuring a multiplayer cookie clicker like game that adapts based on the number of online users.

![Homescreen](https://i.imgur.com/Z2F7yc4.png)

## Features

- Real-time messaging and website updates through WebSockets
- Live online user list
- In-browser multiplayer minigame that scales with the number of active players
- Deployed automatically using Docker
- MongoDB for user data storage and chat message history


## Setup

1. Install Docker Desktop
2. Open the project in VSCode
3. Run this command in a terminal `docker-compose up --build --force-recreate`
4. View the website at http://localhost:8080/


## Planned future features

- Revamp draggable window code to restrict dragging beyond the screen edges and accommodate various screen sizes
- Improve mobile responsiveness
- Streamline the login and registration process
- Updates to gameplay


## Acknowledgements

Base Windows 98 Theme: 98.css <br>
Sound Effects: freesound.org <br>
CSS Animations: animista.net
