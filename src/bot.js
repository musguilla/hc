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

async function runBot() {
  // 1. Await Database connection and creation of tables
  await initDataStorage();

  // 2. Initialize Express Healthcheck and Admin Server
  const app = express();
  const path = require('path');
  const session = require('express-session');
  const adminRoutes = require('./routes/admin');

  app.use(session({
    secret: process.env.SESSION_SECRET || 'hashcoin_super_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1 day
  }));

  app.use('/admin', adminRoutes);

  // Serve static assets automatically (index.html will handle /)
  app.use(express.static(path.join(__dirname, '../public')));

  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'hashcoin-bot',
      uptime: process.uptime()
    });
  });

  app.listen(config.port, () => {
    logger.info(`Web server running on port ${config.port}`);
  });

  // 3. Initialize Telegram Bot
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

  // Callbacks
  bot.on('callback_query', (query) => paymentHandler.handleCallbackQuery(bot, query));
  bot.on('pre_checkout_query', (query) => paymentHandler.handlePreCheckoutQuery(bot, query));
  bot.on('successful_payment', (msg) => paymentHandler.handleSuccessfulPayment(bot, msg));

  logger.info(`Bot successfully initialized and listening for updates.`);
}

runBot();
