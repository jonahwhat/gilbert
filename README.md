# cse-312-project

### Starting the Project
0. You may need to run `pip install flask` on your computer before starting the app
1. Open the project in vscode
2. Open a terminal in vscode and run `docker-compose up --build --force-recreate`
3. View the website at http://localhost:8080/

### Link to Site
https://yapper-chat.com/

### Project Part 3 Objective 1 and 3
1. Go to https://yapper-chat.com/, create an account
2. Send 5-10 chat messages in chat
3. Locate the window that says "Gilbert"
4. Press the "Give Food" button
5. Try to keep Gilbert alive as long as possible by keeping his health/hunger high (cool things happen at 30+ seconds)
6. Verify that the "Gilbert's Thoughts" shows random messages along with messages directed towards the account that you're logged in with (for example if your username is helloworld, gilbert will sometimes say "hi @helloworld" )
7. Verify that gilbert information and interactions are sent via websockets and not polling
