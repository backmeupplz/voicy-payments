/**
 * Configuration file
 *
 * @module config
 * @license MIT
 */

module.exports = {
  database: process.env.VOICY_MONGO_DB_URL,
  productionDatabase: process.env.VOICY_MONGO_PROD_DB_URL,
  production_url: process.env.VOICY_URL,
  token: process.env.TELEGRAM_TOKEN,
  admin_chat: process.env.ADMIN_CHAT,
  stripe_token: process.env.STRIPE_TOKEN
};