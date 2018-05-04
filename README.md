[![Voicybot](/images/logo.png?raw=true)](http://voicybot.com/)

# [@voicybot](https://telegram.me/voicybot) payments and stats service
This repository contains the code for [voicybot.com](http://voicybot.com) payments service. It was used to process payments with stripe for Google Speech recognition seconds, however has retired to serve stats about the bot for voicybot.com. If you are looking for any other [@voicybot](https://t.me/voicybot) repositories, please proceed to [the main repository](https://github.com/backmeupplz/voicy).

# Installation and local launch
1. Clone this repo: `git clone https://github.com/backmeupplz/voicy-payments`
2. Launch the [mongo database](https://www.mongodb.com/) locally (preferably connect to the local instance of [@voicybot](https://t.me/voicybot) database)
3. Create `.env` file with `VOICY_MONGO_DB_URL`, `ADMIN_CHAT`, `STRIPE_TOKEN` and `TELEGRAM_TOKEN`
4. Run `npm i` in the root folder
5. Run `npm run start`

# Continuous integration
Any commit pushed to master gets deployed to voicybot.com via [CI Ninja](https://github.com/backmeupplz/ci-ninja).

# License
MIT — use for any purpose. Would be great if you could leave a note about the original developers. Thanks!