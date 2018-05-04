const mongoose = require('mongoose');
const config = require('../config');
const db = require('../helpers/db');
const bot = require('../helpers/bot');

global.Promise = require('bluebird');

/** Setup mongoose */
mongoose.Promise = global.Promise;
mongoose.connect(config.productionDatabase);

let errors = {};
const step = 500;

console.log('Getting chat count');
db.countChats()
  .then((count) => {
    console.log(`Got chat count (${count}), creating promises to count users`);
    const indexes = [];
    for (let i = -step; i < count; i += step) {
      indexes.push(i);
    }
    indexes[0] = {};
    
    Promise.reduce(indexes, (total, index) => {
      return getNumberOfUsers(index, step)
        .then((sum) => {
          result = Object.create(total);
          Object.keys(sum).forEach((language) => {
            if (result[language]) {
              result[language] += sum[language];
            } else {
              result[language] = sum[language];
            }
          });
          console.log('Total so far:', result);
          console.log('Errors so far:', errors);
          return result;
        })
        .catch(err => console.log(`Error: ${err.message}`));;
    })
      .then((total) => {
        console.log(`Number of users: ${total}`);
        console.log(`Errors:`);
        console.log(errors);
      })
      .catch(err => console.log(`Error: ${err.message}`));;
  })
  .catch(err => console.log(`Error: ${err.message}`));


function getNumberOfUsers(skip, limit) {
  return new Promise((resolve, reject) => {
    console.log(`Getting chats from ${skip}`);
    db.findChats({})
      .skip(skip)
      .limit(limit)
      .then((chats) => {
        console.log(`Got chats from ${skip}, counting users`);

        const promises = [];
        chats.forEach((chat) => {
          promises.push(getNumberOfUsersInChat(chat));
        });
        let sum = 0;
        Promise.all(promises)
          .then((sums) => {
            let result = {};
            sums.forEach((sum) => {
              if (result[sum.language]) {
                result[sum.language] += sum.number;
              } else {
                result[sum.language] = sum.number;
              }
            })
            console.log(`Finished counting users from ${skip}`);
            resolve(result);
          })
          .catch(err => console.log(`Error: ${err.message}`));;
      })
      .catch((err) => {
        console.log(`Error: ${err.message}`);
      });
  });
}

function getNumberOfUsersInChat(chat) {
  return new Promise((resolve, reject) => {
    bot.getChatMembersCount(chat.id)
      .then((number) => {
        let language = 'no';
        if (chat.engine === 'wit') {
          language = chat.witLanguage;
        } else if (chat.engine === 'google') {
          langauge = chat.googleLanguage;
        } else if (chat.engine === 'yandex') {
          language = chat.yandexLanguage;
        }
        resolve({
          language,
          number,
        });
      })
      .catch((err) => {
        if (errors[err.message]) {
          errors[err.message] = errors[err.message] + 1;
        } else {
          errors[err.message] = 1;
        }
        resolve({});
      })
  });
}