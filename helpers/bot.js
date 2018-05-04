/**
 * Telegam bot
 *
 * @module bot
 * @license MIT
 */

/** Dependencies */
const Telegram = require('node-telegram-bot-api');
const config = require('../config');

const bot = new Telegram(config.token, {
  polling: false,
});

/** Exports */
module.exports = bot;
