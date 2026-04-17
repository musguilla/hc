const { Pool } = require('pg');
const logger = require('../utils/logger');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDataStorage() {
  try {
    // Create Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        telegram_id BIGINT PRIMARY KEY,
        username VARCHAR(255),
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Purchases Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id VARCHAR(255) PRIMARY KEY,
        telegram_id BIGINT,
        username VARCHAR(255),
        product_code VARCHAR(255),
        amount INTEGER,
        currency VARCHAR(10),
        status VARCHAR(50),
        telegram_payment_charge_id VARCHAR(255) UNIQUE,
        provider_payment_charge_id VARCHAR(255),
        paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Inject mock transaction as requested
    await pool.query(`
      INSERT INTO purchases (id, telegram_id, username, product_code, amount, currency, status, telegram_payment_charge_id, provider_payment_charge_id, paid_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (telegram_payment_charge_id) DO NOTHING
    `, [
      "pch_mock_12345", 
      1256886585, "musguilla", "hello", 454, "XTR", "paid", 
      "test_charge_id_musguilla", "", "2026-04-17T23:59:00.000Z"
    ]);

    logger.info('Postgres database initialized successfully.');
  } catch (error) {
    logger.error('Error initializing Postgres db:', error);
  }
}

async function getUser(telegramId) {
  try {
    const res = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
    return res.rows[0] || null;
  } catch (error) {
    logger.error('Error getting user:', error);
    return null;
  }
}

async function ensureUserRecord(telegramId, username, firstName, lastName) {
  try {
    const existing = await getUser(telegramId);
    if (!existing) {
      await pool.query(
        `INSERT INTO users (telegram_id, username, first_name, last_name) VALUES ($1, $2, $3, $4)`,
        [telegramId, username, firstName, lastName]
      );
    }
  } catch (error) {
    logger.error('Error ensuring user:', error);
  }
}

async function getPurchases() {
  try {
    const res = await pool.query('SELECT * FROM purchases ORDER BY paid_at DESC');
    return res.rows.map(row => ({
      id: row.id,
      telegramId: row.telegram_id,
      username: row.username,
      productCode: row.product_code,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      telegramPaymentChargeId: row.telegram_payment_charge_id,
      paidAt: row.paid_at
    }));
  } catch (error) {
    logger.error('Error getting purchases:', error);
    return [];
  }
}

async function getUserPurchases(telegramId) {
  try {
    const res = await pool.query('SELECT * FROM purchases WHERE telegram_id = $1 AND status = $2', [telegramId, 'paid']);
    return res.rows.map(row => ({
      productCode: row.product_code,
      amount: row.amount,
      currency: row.currency,
      paidAt: row.paid_at
    }));
  } catch (error) {
    logger.error('Error getting user purchases:', error);
    return [];
  }
}

async function savePurchase(purchase) {
  try {
    await pool.query(
      `INSERT INTO purchases (id, telegram_id, username, product_code, amount, currency, status, telegram_payment_charge_id, provider_payment_charge_id, paid_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (telegram_payment_charge_id) DO NOTHING`,
      [
        purchase.id,
        purchase.telegramId,
        purchase.username,
        purchase.productCode,
        purchase.amount,
        purchase.currency,
        purchase.status,
        purchase.telegramPaymentChargeId,
        purchase.providerPaymentChargeId,
        purchase.paidAt
      ]
    );
  } catch (error) {
    logger.error('Error saving purchase:', error);
  }
}

module.exports = {
  initDataStorage,
  getUser,
  ensureUserRecord,
  getPurchases,
  getUserPurchases,
  savePurchase
};
