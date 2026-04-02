const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const authMiddleware = require('../middleware/auth.middleware')

const router = express.Router()

const createToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET || 'dev-jwt-secret', {
    expiresIn: '7d',
  })

const buildUserResponse = (user) => ({
  id: user._id,
  openid: user.openid,
  phone: user.phone,
  email: user.email,
  nickname: user.nickname,
  avatar: user.avatar,
  bio: user.bio,
  createdAt: user.createdAt,
})

router.post('/register', async (req, res) => {
  try {
    const {
      openid = '',
      phone = '',
      email = '',
      password = '',
      nickname = '',
      avatar = '',
      bio = '',
    } = req.body

    const normalizedPhone = phone.trim()
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPassword = password.trim()
    const normalizedNickname =
      nickname.trim() || `用户${(normalizedPhone || normalizedEmail).slice(-4)}`

    if (!normalizedPhone && !normalizedEmail) {
      return res.status(400).json({
        message: '手机号或邮箱至少填写一项',
      })
    }

    if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        message: '邮箱格式不正确',
      })
    }

    if (normalizedPhone && !/^1\d{10}$/.test(normalizedPhone)) {
      return res.status(400).json({
        message: '手机号格式不正确',
      })
    }

    if (normalizedPassword.length < 6) {
      return res.status(400).json({
        message: '密码长度不能少于 6 位',
      })
    }

    const queryConditions = []

    if (normalizedEmail) {
      queryConditions.push({ email: normalizedEmail })
    }

    if (normalizedPhone) {
      queryConditions.push({ phone: normalizedPhone })
    }

    const existingUser = await User.findOne({
      $or: queryConditions,
    })

    if (existingUser) {
      return res.status(409).json({
        message: '手机号或邮箱已注册',
      })
    }

    const hashedPassword = await bcrypt.hash(normalizedPassword, 10)

    const user = await User.create({
      openid: openid.trim(),
      phone: normalizedPhone || undefined,
      email: normalizedEmail || undefined,
      password: hashedPassword,
      nickname: normalizedNickname,
      avatar: avatar.trim(),
      bio: bio.trim(),
    })

    const token = createToken(user._id.toString())

    res.status(201).json({
      message: '注册成功',
      token,
      user: buildUserResponse(user),
    })
  } catch (error) {
    res.status(500).json({
      message: '注册失败',
      error: error.message,
    })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { account = '', email = '', phone = '', password = '' } = req.body
    const loginAccount = account.trim() || email.trim().toLowerCase() || phone.trim()

    if (!loginAccount || !password.trim()) {
      return res.status(400).json({
        message: '账号和密码不能为空',
      })
    }

    const user = await User.findOne({
      $or: [
        { email: loginAccount.toLowerCase() },
        { phone: loginAccount },
      ],
    })

    if (!user) {
      return res.status(401).json({
        message: '账号或密码错误',
      })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({
        message: '账号或密码错误',
      })
    }

    const token = createToken(user._id.toString())

    res.json({
      message: '登录成功',
      token,
      user: buildUserResponse(user),
    })
  } catch (error) {
    res.status(500).json({
      message: '登录失败',
      error: error.message,
    })
  }
})

router.get('/profile', authMiddleware, async (req, res) => {
  res.json({
    message: '获取用户信息成功',
    user: buildUserResponse(req.user),
  })
})

module.exports = router
