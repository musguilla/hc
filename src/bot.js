const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const config = require('./config');
const { initDataStorage } = require('./data');
const logger = require('./utils/logger');

// Handlers
const commandHandler = require('./handlers/command.handler');
const paymentHandler = require('./handlers/payment.handler');

// Global Promise Rejection & Exception Handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
});

// Initialize Data Storage
initDataStorage();

// Initialize Express Healthcheck Server
const app = express();
const path = require('path');
const session = require('express-session');
const adminRoutes = require('./routes/admin');

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'hashcoin_super_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// Admin panel route
app.use('/admin', adminRoutes);

// Serve static assets without intercepting / automatically (since index.html was renamed to home.html)
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  const ua = req.headers['user-agent'] || '';
  const isBrowser = ua.includes('Mozilla') || ua.includes('Chrome') || ua.includes('Safari') || ua.includes('AppleWebKit');
  
  if (isBrowser) {
    return res.sendFile(path.join(__dirname, '../public/home.html'));
  }
  
  res.json({
    status: 'ok',
    service: 'hashcoin-bot',
    uptime: process.uptime()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'hashcoin-bot',
    uptime: process.uptime()
  });
});

app.listen(config.port, () => {
  logger.info(`Healthcheck server running on port ${config.port}`);
});

// Initialize Telegram Bot
const bot = new TelegramBot(config.botToken, { polling: true });

bot.on('polling_error', (error) => {
  logger.error(`Polling error: ${error.code} - ${error.message}`);
});

logger.info(`Bot is starting...`);

// Commands
bot.onText(/^\/start/, (msg) => commandHandler.handleStart(bot, msg));
bot.onText(/^\/shop/, (msg) => commandHandler.handleShop(bot, msg));
bot.onText(/^\/myaccess/, (msg) => commandHandler.handleMyAccess(bot, msg));
bot.onText(/^\/support/, (msg) => commandHandler.handleSupport(bot, msg));

// Callbacks (Inline Buttons)
bot.on('callback_query', (query) => paymentHandler.handleCallbackQuery(bot, query));

// PreCheckoutQuery
bot.on('pre_checkout_query', (query) => paymentHandler.handlePreCheckoutQuery(bot, query));

// Successful Payment
bot.on('successful_payment', (msg) => paymentHandler.handleSuccessfulPayment(bot, msg));

logger.info(`Bot successfully initialized and listening for updates.`);
