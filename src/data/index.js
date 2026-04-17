const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const dataDir = path.join(__dirname, '../../data');
const usersPath = path.join(dataDir, 'users.json');
const purchasesPath = path.join(dataDir, 'purchases.json');

// Ensure data directory and files exist
function initDataStorage() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    if (!fs.existsSync(usersPath)) {
      fs.writeFileSync(usersPath, JSON.stringify([]));
    }
    
    if (!fs.existsSync(purchasesPath)) {
      fs.writeFileSync(purchasesPath, JSON.stringify([]));
    }
    
    logger.info('Data storage initialized successfully.');
  } catch (error) {
    logger.error('Error initializing data storage:', error);
    process.exit(1);
  }
}

// Basic Read/Write operations for Users
function getUsers() {
  try {
    const data = fs.readFileSync(usersPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    logger.error('Error reading users.json:', error);
    return [];
  }
}

function saveUsers(users) {
  try {
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  } catch (error) {
    logger.error('Error writing users.json:', error);
  }
}

// Basic Read/Write operations for Purchases
function getPurchases() {
  try {
    const data = fs.readFileSync(purchasesPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    logger.error('Error reading purchases.json:', error);
    return [];
  }
}

function savePurchases(purchases) {
  try {
    fs.writeFileSync(purchasesPath, JSON.stringify(purchases, null, 2));
  } catch (error) {
    logger.error('Error writing purchases.json:', error);
  }
}

module.exports = {
  initDataStorage,
  getUsers,
  saveUsers,
  getPurchases,
  savePurchases
};
