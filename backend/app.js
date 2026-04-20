const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const path = require('path')
require('dotenv').config()
const connectDB = require('./config/db')
const User = require('./models/User')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api', async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (error) {
    res.status(503).json({
      message: '数据库连接失败',
      error: error.message,
    })
  }
})

// Routes
app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api', require('./routes/place.routes'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongooseReadyState: mongoose.connection.readyState,
    userModelReadyState: User.db.readyState,
    dbName: mongoose.connection.name,
    dbHost: mongoose.connection.host,
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'API endpoint not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal server error' })
})

module.exports = app
