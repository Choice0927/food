const mongoose = require('mongoose')

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    location: {
      name: {
        type: String,
      },
      address: {
        type: String,
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        content: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
)

// 添加索引
postSchema.index({ createdAt: -1 })
postSchema.index({ author: 1 })

module.exports = mongoose.model('Post', postSchema)
