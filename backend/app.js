const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const connectDB = require('./config/db')

const app = express()

// Connect to database
connectDB()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api', require('./routes/place.routes'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
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
