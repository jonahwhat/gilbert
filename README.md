# Yapchat

## Description

A unique chat platform with a nostalgic Windows 98 theme, featuring a multiplayer game that adapts based on the number of online users.

View the project live at [yap-chat.com](https://yap-chat.com/application).

![Homescreen](https://i.imgur.com/Z2F7yc4.png)

## Features

- Real-time messaging and website updates through WebSockets
- Live online user list
- In-browser multiplayer minigame that scales with the number of active players
- Deployed automatically using Docker for streamlined management
- MongoDB for long-term data storage and chat message history


## Setup (Using VSCode)

1. Install Docker Desktop
2. Open the project in VSCode
3. Open a terminal in VSCode and run `docker-compose up --build --force-recreate`
4. View the website at http://localhost:8080/


## Planned future features

- Revamp draggable window code to restrict dragging beyond the screen edges and accommodate various screen sizes
- Improve mobile responsiveness
- Streamline the login and registration process


## Authors & Acknowledgements

Programming and Design: Jonah Hoech <br>
Base Windows 98 Theme: 98.css <br>
Sound Effects: freesound.org <br>
CSS Animations: animista.net
