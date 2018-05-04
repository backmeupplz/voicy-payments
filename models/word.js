/**
 * @module models/word
 * @license MIT
 */

/** Dependencies */
const mongoose = require('mongoose');

/** Schema */
const Schema = mongoose.Schema;
const wordSchema = new Schema({
  word: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    required: true,
    default: 1,
  }
});

/** Exports */
module.exports = mongoose.model('word', wordSchema);
