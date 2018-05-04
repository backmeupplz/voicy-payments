const mongoose = require('mongoose');
const config = require('../config');
const db = require('../helpers/db');

global.Promise = require('bluebird');
global.Promise.config({ cancellation: true });

/** Setup mongoose */
mongoose.Promise = global.Promise;
mongoose.connect(config.productionDatabase);

db.generateWordCount();