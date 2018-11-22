// Dependencies
const mongoose = require('mongoose')

// Schema
const Schema = mongoose.Schema
const messageStatsSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },
    count: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
)
// Exports
module.exports = mongoose.model('messageStats', messageStatsSchema)
