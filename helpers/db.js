/**
 * @module db
 * @license MIT
 */

/** Get schemas **/
const { Voice, Chat, Word, Stats, MessageStats } = require('../models')

/**
 * Searches for chat by it's id
 * @param {Telegram:ChatId} id Id of the chat to search
 */
function findChat(id) {
  return Chat.findOne({ id })
}

function findChats(query) {
  return Chat.find(query)
}

function countChats() {
  return new Promise((resolve, reject) => {
    return Chat.count({}, (err, count) => {
      if (err) {
        reject(err)
      } else {
        resolve(count)
      }
    })
  })
}

function findVoices(query) {
  return Voice.find(query)
}

function getDuration() {
  return new Promise((resolve, reject) => {
    Voice.aggregate(
      {
        $group: {
          _id: '',
          duration: { $sum: '$duration' },
        },
      },
      (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(parseInt(result[0].duration, 10))
        }
      }
    )
  })
}

function generateWordCount() {
  const start = new Date()
  Word.remove({}, () => {
    console.log('start generating word count')
    let words = {}

    const cursor = Voice.find({}).then(voices => {
      voices.forEach(voice => {
        if (voice.text && voice.text.length > 3) {
          voice.text
            .toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
            .split(' ')
            .forEach(word => {
              if (word.length > 3) {
                if (words[word]) {
                  words[word] += 1
                } else {
                  words[word] = 1
                }
              }
            })
        }
      })
      let ops = []

      Object.keys(words).forEach(k => {
        const p = new Promise((res, rej) => {
          const newWord = new Word({ word: String(k), count: words[k] })
          newWord
            .save()
            .then(() => {
              res()
            })
            .catch(err => {
              rej(err)
            })
        })
        ops.push(p)
      })
      console.log('start promises')
      Promise.all(ops)
        .then(() => {
          const end = new Date() - start
          console.info('word count generated in: %dms', end)
        })
        .catch(err => {
          console.log(`word count generation failed: ${err.message}`)
        })
    })
  })
}

function getWordCount() {
  return Word.find({})
    .sort({ count: -1 })
    .limit(20)
}

function getStats() {
  return new Promise((resolve, reject) => {
    Stats.findOne()
      .then(stats => {
        MessageStats.find().then(messageStats => {
          const json = JSON.parse(stats.json)
          json.messageStats = messageStats
          resolve(json)
        })
      })
      .catch(err => reject(err))
  })
}

function getNewStats() {
  return new Promise((resolve, reject) => {
    const result = {}
    Chat.count({}, (err, chatCount) => {
      if (err) {
        reject(err)
        return
      }
      result.chatCount = chatCount
      Voice.count({}, (err, voiceCount) => {
        if (err) {
          reject(err)
          return
        }
        result.voiceCount = voiceCount
        Voice.aggregate([
          {
            $match: {
              createdAt: {
                $lt: new Date(),
                $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
              },
            },
          },
          {
            $project: {
              _id: '$_id',
              time: {
                $divide: [
                  {
                    $subtract: [
                      { $subtract: [new Date(), '$createdAt'] },
                      {
                        $mod: [
                          { $subtract: [new Date(), '$createdAt'] },
                          24 * 60 * 60 * 1000,
                        ],
                      },
                    ],
                  },
                  24 * 60 * 60 * 1000,
                ],
              },
            },
          },
          {
            $group: { _id: '$time', count: { $sum: 1 } },
          },
          { $sort: { _id: -1 } },
        ]).exec((err, hourlyStats) => {
          if (err) {
            reject(err)
            return
          }
          const temp = hourlyStats.map(v => v._id)
          for (var i = 0; i <= 29; i++) {
            if (!temp.includes(i)) {
              hourlyStats.push({ _id: i, count: 0 })
            }
          }
          hourlyStats.sort((a, b) => a._id - b._id)
          result.hourlyStats = hourlyStats
          getDuration()
            .then(duration => {
              result.duration = duration
              return Stats.findOne({})
                .then(stats => {
                  if (!stats) {
                    const newStats = new Stats({
                      json: JSON.stringify(result),
                    })
                    return newStats.save()
                  }
                  stats.json = JSON.stringify(result)
                  return stats.save()
                })
                .then(() => {
                  resolve()
                })
            })
            .catch(err => reject(err))
        })
      })
    })
  })
}

/** Exports */
module.exports = {
  findChat,
  getStats,
  generateWordCount,
  findChats,
  findVoices,
  countChats,
  getNewStats,
}
