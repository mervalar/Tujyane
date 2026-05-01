const mongoose = require('mongoose');

const BlacklistSchema = new mongoose.Schema({
    token: String,
    expiresAt: Date
  });
  
  const BlacklistModel = mongoose.model('Blacklist', BlacklistSchema);
  module.exports = BlacklistModel;
