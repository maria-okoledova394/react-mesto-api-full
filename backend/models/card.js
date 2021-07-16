const mongoose = require('mongoose');

const urlRegex = /(http|https):\/\/(www\.)?([a-zA-Z0-9_-]+)\.([a-zA-Z]+)(\/[a-zA-Z0-9_\-._~:/?#[\]@!$&'()*+,;=]*)?/;

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  link: {
    type: String,
    required: true,
    validate: {
      validator: (v) => urlRegex.test(v),
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('card', cardSchema);
