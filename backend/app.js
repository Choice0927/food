const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/auth.routes')
const postRoutes = require('./routes/post.routes')
const testRoutes = require('./routes/test.routes')
const favoriteRoutes = require('./routes/favorite.routes')

const app = express()
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const defaultOrigins = [
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]

const whitelist = [...new Set([...defaultOrigins, ...allowedOrigins])]

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || whitelist.includes(origin)) {
        callback(null, true)
        return
      }

      callback(new Error(`CORS blocked for origin: ${origin}`))
    },
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static('uploads'))

app.get('/', (req, res) => {
  res.json({
    name: 'Food Travel API',
    status: 'ok',
  })
})

app.use('/api/auth', authRoutes)
app.use('/api', postRoutes)
app.use('/api', favoriteRoutes)
app.use('/api', testRoutes)

module.exports = app
