const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error("Missing TELEGRAM_BOT_TOKEN environment variable.");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// Mock balances (to be manually updated for now)
const balances = {}; // userId: balance in USD

// Replace these with your actual crypto wallet addresses
const wallets = {
  BTC: 'bc1qlg349f7xtej4svyh9k9q3k5cvqv43m4m5337s8',
  ETH: '0xB24bA2bB528C029B5ef11C772707c7a347778EA5',
  LTC: 'LfM12usmw8B3rNrKfYBht68TvNhy9hdLkU',
  XMR: 'XMR is currently down.',
  SOL: '3ygsN95By5pyJJnQvjX1hidQk5UixuFu9BEgg6Un3Qu4',
  XRP: 'rLJRmCQgH6sUobzxBNZ5Fk29EztqPMvtJz',
  USDT: '0xB24bA2bB528C029B5ef11C772707c7a347778EA5',
  USDC: '0xB24bA2bB528C029B5ef11C772707c7a347778EA5'
};

function requireBalance(userId) {
  return balances[userId] && balances[userId] > 0;
}

// ─── OSINT Commands (locked) ─────────────────────────────────────────

const osintCommands = [
  'lookup', 'whois', 'ipinfo', 'emailinfo', 'socials',
  'breachcheck', 'reverseimage', 'dnslookup', 'phoneinfo',
  'urlscan', 'geolocate', 'metadata', 'iphistory', 'google',
  'torrentinfo', 'osintnews'
];

osintCommands.forEach((cmd) => {
  bot.onText(new RegExp(`/${cmd}`), (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (requireBalance(userId)) {
      bot.sendMessage(chatId, `✅ Running /${cmd}... (functionality coming soon)`);
    } else {
      bot.sendMessage(chatId, `🔒 This feature is locked.\nPlease use /deposit to add balance and unlock.`);
    }
  });
});

// ─── Main Commands ────────────────────────────────────────────────

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `👋 Welcome to GoSint 🕵️‍♂️\nUse /help to view available commands.`);
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id, `
📋 Commands:

/deposit - Deposit balance to use features  
/balance - Check your current balance  

🔎 OSINT Tools:
/lookup /whois /ipinfo /emailinfo /socials  
/breachcheck /reverseimage /dnslookup /phoneinfo  
/urlscan /geolocate /metadata /iphistory /google  
/torrentinfo /osintnews
  `);
});

bot.onText(/\/balance/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const balance = balances[userId] || 0;
  bot.sendMessage(chatId, `💳 Your balance: $${balance.toFixed(2)}\n(Manually credited after deposit)`);
});

bot.onText(/\/deposit/, (msg) => {
  const chatId = msg.chat.id;

  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "BTC", callback_data: "deposit_BTC" }, { text: "ETH", callback_data: "deposit_ETH" }],
        [{ text: "LTC", callback_data: "deposit_LTC" }, { text: "XMR", callback_data: "deposit_XMR" }],
        [{ text: "SOL", callback_data: "deposit_SOL" }, { text: "XRP", callback_data: "deposit_XRP" }],
        [{ text: "USDT", callback_data: "deposit_USDT" }, { text: "USDC", callback_data: "deposit_USDC" }]
      ]
    }
  };

  bot.sendMessage(chatId, "💰 Choose a cryptocurrency to deposit:", options);
});

bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;

  if (query.data.startsWith("deposit_")) {
    const coin = query.data.split("_")[1];
    const address = wallets[coin];
    bot.sendMessage(chatId, `🪙 Send your ${coin} deposit to:\n<code>${address}</code>`, {
      parse_mode: "HTML"
    });
  }
});

console.log("✅ GoSint OSINT bot is running (crypto-only, locked commands).");
