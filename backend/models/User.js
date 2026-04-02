const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    openid: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: true,
    },
    nickname: {
      type: String,
      trim: true,
      required: true,
      maxlength: 50,
    },
    avatar: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
      maxlength: 200,
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
)

module.exports = mongoose.model('User', userSchema)
