## Telegram integration

### Create a Telegram Bot
Creating a bot is streamlined by Telegram’s Bot API, which gives the tools and framework required to integrate your code. To get started, message @BotFather on Telegram to register your bot and receive its authentication token.

**Your bot token is its unique identifier – store it in a secure place, and only share it with people who need direct access to the bot. Everyone who has your token will have full control over your bot.**

### Environments
```dotenv
TELEGRAM_TOKEN="API token returned by @BotFather"
TELEGRAM_CHANNELS=["@Channel1", "@Channel2"]
```

### As a channel admin
Add the bot to the channel as you normally would by inviting it and making it admin

### Messages
Can be edited in `src/integrations/telegram/messages.ts`