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
  try {
    const voiceCount = await Voice.count({ engine: 'ashmanov' })
    const chatCount = await Chat.count({ engine: 'ashmanov' })
    res.json({ voiceCount, chatCount })
  } catch (err) {
    res.json({ status: 'error' })
  }
})

module.exports = router
