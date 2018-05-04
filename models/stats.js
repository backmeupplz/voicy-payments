/**
 * @module models/stats
 * @license MIT
 */

/** Dependencies */
const mongoose = require('mongoose');

/** Schema */
const Schema = mongoose.Schema;
const statsSchema = new Schema({
  json: String,
}, { timestamps: true });

/** Exports */
module.exports = mongoose.model('stats', statsSchema);
