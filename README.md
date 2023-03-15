# Streamline Printer Bot

The Streamline Printer Bot was developed to work together with the following [Printer Controller](https://github.com/aurelianammon/flask-socketio-printer). The Bot and the Controller have to run on the same computer to get a working connection.

## Getting Started

These instructions will give you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Requirements for the software are a working node.js installation as well as a recent version of npm running on your computer.

### Install and Run

To get the software running, download the repository and open it with the eitor of your choise. Copy the file ".env_sample" and rename it to ".env". Here we have to add the token of your Telegram bot.

Move to telegram and create a bot with the help of [@BotFather]((https://core.telegram.org/bots/features#creating-a-new-bot)). Recieve your token and paste it into the .env file.

    BOT_TOKEN=PERSONAL_TOKEN_HERE

Navigate to the project in your terminal and install the dependencies.

    npm install

Eventually you can run the application.

    npm run start

Now start a conversation with your bot on telegram and have some fun.
