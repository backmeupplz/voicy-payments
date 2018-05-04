const mongoose = require('mongoose');
const config = require('../config');
const db = require('../helpers/db');

global.Promise = require('bluebird');
global.Promise.config({ cancellation: true });

/** Setup mongoose */
mongoose.Promise = global.Promise;
mongoose.connect(config.productionDatabase);

// db.findChats({$or: [{ createdAt: null }, { createdAt: {$exists: false }}]})
//   .then((chats) => {
//     let ops = [];
//     chats.forEach((chat) => {
//       chat.createdAt = chat._id.getTimestamp();
//       ops.push(new Promise((resolve, reject) => {
//         chat.save()
//           .then(resolve)
//           .catch(reject);
//       }));
//     });
//     Promise.all(ops)
//       .then(() => {
//         console.log('All timestamps recovered');
//       })
//       .catch((err) => {
//         console.log('Error: ' + err.message);
//       });
//   });
//   
db.findVoices({})
  .then((chats) => {
    let ops = [];
    chats.forEach((chat) => {
      chat.createdAt = chat._id.getTimestamp();
      ops.push(new Promise((resolve, reject) => {
        chat.save()
          .then(resolve)
          .catch(reject);
      }));
    });
    Promise.all(ops)
      .then(() => {
        console.log('All timestamps recovered');
      })
      .catch((err) => {
        console.log('Error: ' + err.message);
      });
  });