const express = require('express')
const router = express.Router()
const db = require('../helpers/db')
const { Voice, Chat } = require('../models')

router.get('/statsfornikita', (req, res, next) => {
  db.getStats()
    .then(stats => {
      res.json(stats)
    })
    .catch(err => {
      res.json(err)
    })
})

router.get('/statsforashmanov', async (req, res, next) => {
  const voiceCount = await Voice.countDocuments({ engine: 'ashmanov' })
  const chatCount = await Chat.countDocuments({ engine: 'ashmanov' })
  res.json({ voiceCount, chatCount })
})

module.exports = router
