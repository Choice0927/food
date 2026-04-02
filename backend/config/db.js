const mongoose = require('mongoose')

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/food-travel'

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`MongoDB connected: ${mongoose.connection.host}`)
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`)
  }
}

module.exports = connectDB
