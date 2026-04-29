const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const path = require('path')
const fs = require('fs')
require('dotenv').config()
const connectDB = require('./config/db')
const User = require('./models/User')

const app = express()

// 确保 uploads 目录存在
const uploadDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// CORS 配置
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}))

// Body parser 配置 - 增加大小限制
app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ extended: true, limit: '100mb' }))

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// 请求日志（开发环境）
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
    next()
  })
}

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
  console.error('Error:', err)
  console.error(err.stack)
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

module.exports = app
