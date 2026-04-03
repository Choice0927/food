const mongoose = require('mongoose')

const placeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
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
  location: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  description: {
    type: String,
    trim: true,
    maxlength: 300,
  },
  images: {
    type: [String],
    default: [],
  },
  tags: {
    type: [String],
    default: [],
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
}, {
  timestamps: true,
})

placeSchema.index({ user: 1, createdAt: -1 })
placeSchema.index({ city: 1 })

module.exports = mongoose.model('Place', placeSchema)
