/**
 * @module db
 * @license MIT
 */

/** Get schemas **/
const {
  Voice,
  Chat,
  Word,
  Stats,
} = require('../models');

/**
 * Searches for chat by it's id
 * @param {Telegram:ChatId} id Id of the chat to search
 */
function findChat(id) {
  return Chat.findOne({ id });
}

function findChats(query) {
  return Chat.find(query);
}

function countChats() {
  return new Promise((resolve, reject) => {
    return Chat.count({}, (err, count) => {
      if (err) {
        reject(err);
      } else {
        resolve(count);
      }
    });
  });
}

function findVoices(query) {
  return Voice.find(query);
}

function getDuration() {
  return new Promise((resolve, reject) => {
    Voice.aggregate({
      $group: {
        _id: '',
        duration: { $sum: '$duration' }
      }
    }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(parseInt(result[0].duration, 10));
      }
    });
  });
}

function generateWordCount() {
  const start = new Date();
  Word.remove({}, () => {
    console.log('start generating word count');
    let words = {};

    const cursor = Voice.find({})
      .then((voices) => {
        voices.forEach((voice) => {
          if (voice.text && voice.text.length > 3) {
            voice.text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,'').split(' ').forEach((word) => {
              if (word.length > 3) {
                if (words[word]) {
                  words[word] += 1;
                } else {
                  words[word] = 1;
                }
              }
            });
          }
        });
        let ops = [];

        Object.keys(words).forEach((k) => {
          const p = new Promise((res, rej) => {
            const newWord = new Word({ word: String(k), count: words[k] });
            newWord.save()
              .then(() => {
                res();
              })
              .catch((err) => { 
                rej(err);
              });
          });
          ops.push(p);
        });
        console.log('start promises');
        Promise.all(ops)
          .then(() => {
            const end = new Date() - start;
            console.info('word count generated in: %dms', end);
          })
          .catch(err => {
            console.log(`word count generation failed: ${err.message}`);
          });
      });
  });
}

function getWordCount() {
  return Word.find({})
    .sort({ count: -1 })
    .limit(20);
}

function getStats() {
  return new Promise((resolve, reject) => {
    Stats.findOne()
      .then((stats) => {
        resolve(JSON.parse(stats.json));
      })
      .catch(err => reject(err));
  });
}

function getNewStats() {
  return new Promise((resolve, reject) => {
    const result = {};
    Chat.count({}, (err, chatCount) => {
      if (err) {
        reject(err);
        return;
      }
      result.chatCount = chatCount;
      Voice.count({}, (err, voiceCount) => {
        if (err) {
          reject(err);
          return;
        }
        result.voiceCount = voiceCount;
        Chat.aggregate([{ $group: {
          _id: { $size:"$voices"},
          count: {$sum: 1}
        } }, { $sort : { _id : -1} }])
          .exec((err, voiceStats) => {
            if (err) {
              reject(err);
              return;
            }
            
            let temp = {
              '0': 0,
              '1-5': 0,
              '5-10': 0,
              '10-50': 0,
              '50-100': 0,
              '100-200': 0,
              '200-500': 0,
              '500+': 0
            };

            voiceStats.forEach((obj) => {
              if (obj._id === 0) {
                temp['0'] += obj.count;
              } else if (obj._id >= 1 && obj._id < 5) {
                temp['1-5'] += obj.count;
              } else if (obj._id >= 5 && obj._id < 10) {
                temp['5-10'] += obj.count;
              } else if (obj._id >= 10 && obj._id < 50) {
                temp['10-50'] += obj.count;
              } else if (obj._id >= 50 && obj._id < 100) {
                temp['50-100'] += obj.count;
              } else if (obj._id >= 100 && obj._id < 200) {
                temp['100-200'] += obj.count;
              } else if (obj._id >= 200 && obj._id < 500) {
                temp['200-500'] += obj.count;
              } else if (obj._id >= 500) {
                temp['500+'] += obj.count;
              }
            });

            temp = Object.keys(temp).map(key => ({ _id: key, count: temp[key]}));

            result.voiceStats = temp;

            Voice.aggregate([{ $match: {
                "createdAt" : { 
                   $lt: new Date(), 
                    $gte: new Date(new Date().setDate(new Date().getDate()-30))
                  }  
              } },
              {   
                    "$project": {
                        "_id":"$_id",
                        "time": {$divide: [{ "$subtract": [
                            { "$subtract": [new Date(), "$createdAt"] },
                            { $mod: [{ "$subtract": [new Date(), "$createdAt"] }, 24 * 60 * 60 * 1000] }
                            ]
                        }, 24 * 60 * 60 * 1000] }
                    }
                },
                {   
                    "$group": {"_id": "$time", "count":{"$sum":1}}
                },
                { $sort : { _id : -1} }
            ])
            .exec((err, hourlyStats) => {
              if (err) {
                reject(err);
                return;
              }
              const temp = hourlyStats.map(v => v._id);
              for (var i = 0; i <= 29; i++) {
                if (!temp.includes(i)) {
                  hourlyStats.push({ _id: i, count: 0 });
                }
              }
              hourlyStats.sort((a, b) => a._id - b._id);
              result.hourlyStats = hourlyStats;
              getDuration()
                .then((duration) => {
                  result.duration = duration;
                  return Stats.findOne({})
                    .then((stats) => {
                      if (!stats) {
                        const newStats = new Stats({
                          json: JSON.stringify(result)
                        });
                        return newStats.save();
                      }
                      stats.json = JSON.stringify(result);
                      return stats.save();
                    })
                    .then(() => {
                      resolve();
                    });
                })
                .catch(err => reject(err));
            });
          });
      });
    });
  });
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
};
