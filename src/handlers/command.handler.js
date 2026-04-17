const { getUsers, saveUsers, getPurchases } = require('../data');
const config = require('../config');
const { getProducts } = require('../services/product.service');

function ensureUser(msg) {
  const users = getUsers();
  const telegramId = msg.from.id;
  const existingUser = users.find(u => u.telegramId === telegramId);
  
  if (!existingUser) {
    const newUser = {
      telegramId,
      username: msg.from.username || '',
      firstName: msg.from.first_name || '',
      lastName: msg.from.last_name || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(newUser);
    saveUsers(users);
  }
}

function handleStart(bot, msg) {
  ensureUser(msg);
  const chatId = msg.chat.id;
  const welcomeText = `Welcome to <b>Hashcoin Bot</b>! 🪙\n\nYour premium digital shop right in Telegram. We offer exclusive digital products and access passes.\n\nUse our commands to navigate:\n🛍 /shop - Browse our digital products\n🔑 /myaccess - View your purchased access and content\n💬 /support - Get help from our team`;
  
  bot.sendMessage(chatId, welcomeText, { parse_mode: 'HTML' });
}

function handleShop(bot, msg) {
  ensureUser(msg);
  const chatId = msg.chat.id;
  const products = getProducts();
  
  const inlineKeyboard = products.map(product => ([{
    text: `⭐️ ${product.title} - ${product.amount_xtr} XTR`,
    callback_data: `buy_${product.code}`
  }]));
  
  bot.sendMessage(chatId, '🛍 <b>Hashcoin Shop</b>\nSelect a product below to purchase using Telegram Stars:', {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: inlineKeyboard
    }
  });
}

function handleMyAccess(bot, msg) {
  ensureUser(msg);
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;
  
  const purchases = getPurchases().filter(p => p.telegramId === telegramId && p.status === 'paid');
  
  if (purchases.length === 0) {
    return bot.sendMessage(chatId, 'You don\'t have any active purchases yet. Visit /shop to get started!');
  }
  
  let accessText = '🔑 <b>Your Purchased Access:</b>\n\n';
  purchases.forEach(p => {
    accessText += `🔹 <b>${p.productCode}</b> • ${p.amount} ${p.currency}\n  <i>Purchased on: ${new Date(p.paidAt).toLocaleDateString()}</i>\n\n`;
  });
  
  bot.sendMessage(chatId, accessText, { parse_mode: 'HTML' });
}

function handleSupport(bot, msg) {
  ensureUser(msg);
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, config.supportText, { parse_mode: 'HTML' });
}

module.exports = {
  handleStart,
  handleShop,
  handleMyAccess,
  handleSupport,
  ensureUser
};
