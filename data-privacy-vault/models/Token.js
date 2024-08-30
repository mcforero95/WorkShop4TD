const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  originalValue: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['NAME', 'EMAIL', 'PHONE'],
    required: true
  }
});

module.exports = mongoose.model('Token', TokenSchema);
