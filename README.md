# cse-312-project

### Starting the Project
0. You may need to run `pip install flask` on your computer before starting the app
1. Open the project in vscode
2. Open a terminal in vscode and run `docker-compose up --build --force-recreate`
3. View the website at http://localhost:8080/

### Link to Site
https://yapper-chat.com/

### Project Part 3 Objective 3
1. Go to https://yapper-chat.com/ on chrome, make an account and log in
2. Send 5-10 chat messages in chat
3. Locate the tab that says "Gilbert"
4. Press the "Give Food" button
5. Try to keep Gilbert alive as long as possible by keeping his stats high
6. Verify that the "Gilbert's Thoughts" shows messages you have sent along with messages directed towards the account that was just created (wait ~15 seconds between thoughts)
7. Create a new account and log in in firefox and verify that Gilbert's stats are the same on both tabs
8. Verify that gilbert information and interactions are sent via websockets and not polling
