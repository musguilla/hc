# Hashcoin Bot

Hashcoin Bot is a Telegram Bot ready for production that acts as a digital shop. It allows users to browse digital products and purchase them using **Telegram Stars (XTR)**. Built with Node.js and `node-telegram-bot-api`.

## Requirements
- Node.js LTS (v18 or v20)
- NPM or Yarn
- Valid Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- PM2 (for production deployment)

## Installation

1. Copy the repository to your local machine or server.
2. Install the dependencies:
   ```bash
   npm install
   ```

## Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill the `.env` variables with your values:
   - `BOT_TOKEN`: The token given by @BotFather.
   - `PORT`: Port for healthcheck server (e.g. 3000).
   - `BOT_USERNAME`: The bot username without @.
   - `SUPPORT_TEXT`: Message displayed when users type `/support`.

## Running Locally

To run the bot in development mode:
```bash
npm run dev
```

To run normally:
```bash
npm start
```

## Production Deployment with PM2 (OLA CLOUD / Linux)

For 24/7 PM2-ready execution on an Ubuntu/Linux server:

1. Install PM2 globally if you don't have it:
   ```bash
   npm install -g pm2
   ```
2. Start the bot with PM2:
   ```bash
   pm2 start src/bot.js --name hashcoin-bot
   ```
3. Save the PM2 process list:
   ```bash
   pm2 save
   ```
4. Configure PM2 to start on boot:
   ```bash
   pm2 startup
   ```
   *(Follow the command given by pm2 in the terminal).*

## Telegram Stars (XTR) Details

- **Currency:** `XTR`.
- **Payment Method:** The bot creates `sendInvoice` using Telegram Stars. No `provider_token` is required or needed for this specific digital goods flow.
- Ensure that you accept the Telegram Terms relating to Telegram Stars in @BotFather if your bot gets restricted for any reason.

## Current Limitations & Future Improvements
- **Persistence:** Currently uses JSON (`data/users.json` and `data/purchases.json`) for quick and simple local persistence.
- **Future Improvement:** The codebase is decoupled into specific services and handlers to allow easily replacing `src/data/index.js` functions with real MongoDB (Mongoose) methods when needed in the next versions.
