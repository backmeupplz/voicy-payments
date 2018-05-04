/**
 * File used to server payment pages
 */

/** Dependencies */
const express = require('express');
const router = express.Router();
const db = require('../helpers/db');
const config = require('../config');
const stripe = require('stripe')(config.stripe_token);
const bot = require('../helpers/bot');

/** Show stats */
router.get('/statsfornikita', (req, res, next) => {
  db.getStats()
    .then((stats) => {
      res.json(stats);
    })
    .catch((err) => {
      res.json(err);
    })
});

// /** Process purchase */
// router.post('/buy', (req, res, next) => {
//   const token = req.body.token;
//   const chatId = parseInt(req.body.chatId);
//   const amount = parseInt(req.body.amount);
//   const rate = parseFloat(req.body.rate);

//   if (rate !== 0.0009 && rate !== 0.00045) {
//     res.send({ error: 'Purchase rates do not match' });
//     return;
//   }

//   var charge = stripe.charges.create({
//     amount: amount * rate * 100,
//     source: token,
//     currency: "USD",
//     description: "Buying seconds for Voicy"
//   }, (err, charge) => {
//     if (err) {
//       res.send({ error: err.message });
//     } else {
//       db.findChat(chatId)
//         .then((chat) => {
//           chat.seconds = parseInt(chat.seconds) + amount;
//           if (chat.productHuntDiscountApplied) {
//             chat.productHuntSecondsBought = parseInt(chat.productHuntSecondsBought) + amount;
//           }
//           return chat.save()
//             .then((newChat) => {
//               res.send({ success: true });
//               reportPaymentToChat(newChat, amount);
//             });
//         })
//         .catch((err) => {
//           res.send({ error: err.message });
//         })
//     }
//   });
// });

// /* GET home page. */
// router.get('/:id', (req, res, next) => {
//   const chatId = parseInt(req.params.id);
//   db.findChat(chatId)
//     .then((chat) => {
//       if (!chat) {
//         const err = new Error();
//         err.status = 404;
//         err.message = 'No chat found';
//         throw err;
//       }
//       return chat;
//     })
//     .then((chat) => {
//       const discount = chat.productHuntSecondsBought < 100000 && chat.productHuntDiscountApplied;
//       res.render('index', { 
//         chatId: chat.id,
//         seconds: chat.seconds,
//         rateString: (discount) ? '$0.45 per 1000 seconds (Product Hunt discount applied)' : '$0.9 per 1000 seconds',
//         rate: (discount) ? 0.00045 : 0.0009
//       });
//     })
//     .catch(err => next(err));
// });

function reportPaymentToChat(chat, amount) {
  bot.sendMessage(chat.id, `🎉 Somebody just purchased *${amount} seconds* more for this chat! Now you have *${chat.seconds} seconds* of voice recognition in total. Rock on!`, {
    parse_mode: 'Markdown',
  });
  bot.sendMessage(config.admin_chat, `💰 Somebody just purchased *${amount} seconds* for ${chat.id}. Total is *${chat.seconds} seconds* now.`, {
    parse_mode: 'Markdown',
  });
}

/** Exports */
module.exports = router;
