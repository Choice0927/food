require('dotenv').config()

const connectDB = require('./config/db')

const PORT = process.env.PORT || 5000

const bootstrap = async () => {
  try {
    await connectDB()
    const app = require('./app')

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`)
    process.exit(1)
  }
}

bootstrap()
