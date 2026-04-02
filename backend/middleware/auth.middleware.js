const jwt = require('jsonwebtoken')
const User = require('../models/User')

const authMiddleware = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization || ''

    if (!authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        message: '未授权，请先登录',
      })
    }

    const token = authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-jwt-secret')
    const user = await User.findById(decoded.userId).select('-password')

    if (!user) {
      return res.status(401).json({
        message: '用户不存在或登录已失效',
      })
    }

    req.user = user
    req.token = token

    next()
  } catch (error) {
    res.status(401).json({
      message: 'Token 无效或已过期',
    })
  }
}

module.exports = authMiddleware
