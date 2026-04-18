const { getProductByCode } = require('../services/product.service');
const { savePurchase } = require('../data');
const { ensureUser } = require('./command.handler');
const logger = require('../utils/logger');

async function handleCallbackQuery(bot, query) {
  const data = query.data;
  if (!data || !data.startsWith('buy_')) return;
  
  // ensure user is recorded
  await ensureUser(query);
  
  const productCode = data.replace('buy_', '');
  const product = getProductByCode(productCode);
  
  if (!product) {
    return bot.answerCallbackQuery(query.id, { text: 'Product not found.', show_alert: true });
  }

  bot.answerCallbackQuery(query.id);

  const payload = `ext_payload_${productCode}_${Date.now()}`;

  // Invoice parameters for Telegram Stars (XTR)
  bot.sendInvoice(
    query.message.chat.id,
    product.title,
    product.description,
    payload,
    '', // Provider token must be empty for Telegram Stars
    'XTR',
    [{ label: product.title, amount: product.amount_xtr }]
  ).catch(err => {
    logger.error('Error sending invoice:', err);
  });
}

async function handlePreCheckoutQuery(bot, query) {
  // Telegram calls this to confirm the user can proceed with Payment.
  await ensureUser(query);
  
  const payload = query.invoice_payload;
  if (!payload || !payload.startsWith('ext_payload_')) {
    return bot.answerPreCheckoutQuery(query.id, false, { error_message: 'Invalid payload.' });
  }
  
  if (query.currency !== 'XTR') {
    return bot.answerPreCheckoutQuery(query.id, false, { error_message: 'Currency must be XTR.' });
  }
  
  // Accept the checkout request
  bot.answerPreCheckoutQuery(query.id, true).catch(err => {
    logger.error('Error answering pre_checkout_query:', err);
  });
}

async function handleSuccessfulPayment(bot, msg) {
  await ensureUser(msg);
  
  const payment = msg.successful_payment;
  const payload = payment.invoice_payload;
  
  if (!payload) return;
  
  const parts = payload.split('_');
  // payload format: ext_payload_<code>_timestamp
  // Reconstruct code in case code contains underscores
  const productCode = parts.slice(2, parts.length - 1).join('_');
  
  const newPurchase = {
    id: `pch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    telegramId: msg.from.id,
    username: msg.from.username || '',
    productCode: productCode,
    amount: payment.total_amount,
    currency: payment.currency,
    status: 'paid',
    telegramPaymentChargeId: payment.telegram_payment_charge_id,
    providerPaymentChargeId: payment.provider_payment_charge_id || '',
    paidAt: new Date().toISOString()
  };
  
  // Database saves and handles duplicates natively with ON CONFLICT DO NOTHING
  await savePurchase(newPurchase);
  
  logger.info(`Successful payment by ${msg.from.id} for ${productCode} (${payment.total_amount} XTR)`);
  
  const usdValue = (payment.total_amount * 0.02).toFixed(2);
  const successText = `✅ <b>Payment Successful!</b>\n\nThank you for your purchase.\n\n🔹 <b>Product:</b> ${productCode}\n🔹 <b>Amount:</b> ${payment.total_amount} ${payment.currency} ($${usdValue})\n\nYou can view your access anytime using /myaccess.`;
  
  bot.sendMessage(msg.chat.id, successText, { parse_mode: 'HTML' });
}

module.exports = {
  handleCallbackQuery,
  handlePreCheckoutQuery,
  handleSuccessfulPayment
};
