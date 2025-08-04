const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('Error: TELEGRAM_BOT_TOKEN environment variable not set.');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

const userBalances = {};

// /deposit <amount>
bot.onText(/\/deposit (\d+)/, (msg, match) => {
  const userId = msg.from.id;
  const amount = parseInt(match[1], 10);
  if (amount <= 0) {
    bot.sendMessage(msg.chat.id, 'Please enter a positive number.');
    return;
  }
  userBalances[userId] = (userBalances[userId] || 0) + amount;
  bot.sendMessage(msg.chat.id, `Deposited ${amount}. Your balance is now ${userBalances[userId]}.`);
});

// /balance
bot.onText(/\/balance/, (msg) => {
  const userId = msg.from.id;
  const balance = userBalances[userId] || 0;
  bot.sendMessage(msg.chat.id, `Your balance: ${balance}`);
});

function requireBalance(handler) {
  return (msg, match) => {
    const userId = msg.from.id;
    if (!userBalances[userId] || userBalances[userId] <= 0) {
      bot.sendMessage(msg.chat.id, 'Deposit balance to use the bot.');
      return;
    }
    handler(msg, match);
  };
}

const commands = [
  'lookup',
  'whois',
  'ipinfo',
  'emailinfo',
  'socials',
  'breachcheck',
  'reverseimage',
  'dnslookup',
  'phoneinfo',
  'urlscan',
  'geolocate',
  'metadata',
  'iphistory',
  'google',
  'torrentinfo',
  'osintnews',
  'start'
];

commands.forEach(cmd => {
  bot.onText(new RegExp(`\\/${cmd}(?:\\s+(.+))?`), requireBalance((msg, match) => {
    const arg = match[1] || '';
    bot.sendMessage(msg.chat.id, `You used /${cmd}${arg ? ` with argument: ${arg}` : ''}. Deposit balance to use this feature.`);
  }));
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `Welcome to Gozint — Go OSINT bot!\nUse /deposit <amount> to add balance and unlock features.`);
});

console.log('Bot is running...');
