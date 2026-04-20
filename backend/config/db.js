const mongoose = require('mongoose')

let connectionPromise = null

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/food-travel'

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  if (connectionPromise) {
    return connectionPromise
  }

  try {
    connectionPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    })
    await connectionPromise
    console.log(`MongoDB connected: ${mongoose.connection.host}`)
    return mongoose.connection
  } catch (error) {
    connectionPromise = null
    throw error
  }
}

module.exports = connectDB
