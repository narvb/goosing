const TelegramBot = require('node-telegram-bot-api');

// Read your bot token from environment variables
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('Error: TELEGRAM_BOT_TOKEN environment variable not set.');
  process.exit(1);
}

// Create the bot with polling enabled
const bot = new TelegramBot(token, { polling: true });

// Example command handler: /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `Hello, ${msg.from.first_name}! Welcome to GoSint!`);
});

// Your other command handlers here...

console.log('Bot is running...');
