require('dotenv').config();

// Ensure required environment variables
const requiredEnvVars = ['BOT_TOKEN'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`FATAL ERROR: Environment variable ${envVar} is missing.`);
    process.exit(1);
  }
}

module.exports = {
  botToken: process.env.BOT_TOKEN,
  port: process.env.PORT || 3000,
  botUsername: process.env.BOT_USERNAME || 'hashcoin_bot',
  supportText: process.env.SUPPORT_TEXT || 'Contact support for help.',
  nodeEnv: process.env.NODE_ENV || 'development'
};
