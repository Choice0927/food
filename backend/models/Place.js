const mongoose = require('mongoose')

const placeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255,
  },
  latitude: {
    type: Number,
    default: null,
  },
  longitude: {
    type: Number,
    default: null,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  images: {
    type: [String],
    default: [],
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  tags: {
    type: [String],
    default: [],
  },
  likesCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  favoritesCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  commentsCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  checkinsCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  likedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
}, {
  timestamps: true,
})

module.exports = mongoose.model('Place', placeSchema)
