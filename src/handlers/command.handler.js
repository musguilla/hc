const { ensureUserRecord, getUserPurchases } = require('../data');
const config = require('../config');
const { getProducts } = require('../services/product.service');

async function ensureUser(msg) {
  const telegramId = msg.from.id;
  const username = msg.from.username || '';
  const firstName = msg.from.first_name || '';
  const lastName = msg.from.last_name || '';
  await ensureUserRecord(telegramId, username, firstName, lastName);
}

async function handleStart(bot, msg) {
  await ensureUser(msg);
  const chatId = msg.chat.id;
  const welcomeText = `Welcome to <b>Hashcoin Bot</b>! 🪙\n\nYour premium digital shop right in Telegram. We offer exclusive digital products and access passes.\n\nUse our commands to navigate:\n🛍 /shop - Browse our digital products\n🔑 /myaccess - View your purchased access and content\n💬 /support - Get help from our team`;
  
  bot.sendMessage(chatId, welcomeText, { parse_mode: 'HTML' });
}

async function handleShop(bot, msg) {
  await ensureUser(msg);
  const chatId = msg.chat.id;
  const products = getProducts();
  
  const inlineKeyboard = products.map(product => {
    const usdValue = (product.amount_xtr * 0.02).toFixed(2);
    return [{
      text: `⭐️ ${product.title} - ${product.amount_xtr} XTR ($${usdValue})`,
      callback_data: `buy_${product.code}`
    }];
  });
  
  bot.sendMessage(chatId, '🛍 <b>Hashcoin Shop</b>\nSelect a product below to purchase using Telegram Stars:', {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: inlineKeyboard
    }
  });
}

async function handleMyAccess(bot, msg) {
  await ensureUser(msg);
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;
  
  const purchases = await getUserPurchases(telegramId);
  
  if (purchases.length === 0) {
    return bot.sendMessage(chatId, 'You don\'t have any active purchases yet. Visit /shop to get started!');
  }
  
  let accessText = '🔑 <b>Your Purchased Access:</b>\n\n';
  purchases.forEach(p => {
    const usdValue = (p.amount * 0.02).toFixed(2);
    accessText += `🔹 <b>${p.productCode}</b> • ${p.amount} ${p.currency} ($${usdValue})\n  <i>Purchased on: ${new Date(p.paidAt).toLocaleDateString()}</i>\n\n`;
  });
  
  bot.sendMessage(chatId, accessText, { parse_mode: 'HTML' });
}

async function handleSupport(bot, msg) {
  await ensureUser(msg);
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
