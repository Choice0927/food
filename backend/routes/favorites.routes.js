const express = require('express')
const mongoose = require('mongoose')
const Favorite = require('../models/Favorite')
const Place = require('../models/Place')
const User = require('../models/User')

const router = express.Router()

const formatPlace = (place) => ({
  id: place._id,
  userId: place.userId,
  name: place.name,
  city: place.city,
  address: place.address,
  latitude: place.latitude,
  longitude: place.longitude,
  description: place.description,
  notes: place.notes,
  images: place.images,
  rating: place.rating,
  tags: place.tags,
  likesCount: place.likesCount,
  favoritesCount: place.favoritesCount,
  commentsCount: place.commentsCount,
  checkinsCount: place.checkinsCount,
  createdAt: place.createdAt,
  updatedAt: place.updatedAt,
})

router.post('/favorites', async (req, res) => {
  try {
    const { placeId } = req.body
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        message: '请先登录',
      })
    }

    if (!placeId || !mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({
        message: '地点 ID 无效',
      })
    }

    const existingFavorite = await Favorite.findOne({ userId, placeId })

    if (existingFavorite) {
      await Favorite.findByIdAndDelete(existingFavorite._id)

      await Place.findByIdAndUpdate(placeId, {
        $inc: { favoritesCount: -1 },
      })

      return res.json({
        message: '已取消收藏',
        favorited: false,
      })
    }

    await Favorite.create({ userId, placeId })

    await Place.findByIdAndUpdate(placeId, {
      $inc: { favoritesCount: 1 },
    })

    res.status(201).json({
      message: '收藏成功',
      favorited: true,
    })
  } catch (error) {
    res.status(500).json({
      message: '操作失败',
      error: error.message,
    })
  }
})

router.get('/favorites', async (req, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.json({
        list: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          hasMore: false,
        },
      })
    }

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
    const limit = Math.min(20, Math.max(1, Number.parseInt(req.query.limit, 10) || 10))
    const skip = (page - 1) * limit

    const favorites = await Favorite.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('placeId')
      .lean()

    const total = await Favorite.countDocuments({ userId })

    const list = favorites
      .map((fav) => fav.placeId)
      .filter((place) => place !== null)
      .map(formatPlace)

    res.json({
      list,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + list.length < total,
      },
    })
  } catch (error) {
    res.status(500).json({
      message: '获取收藏列表失败',
      error: error.message,
    })
  }
})

router.get('/favorites/check/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.json({
        favorited: false,
      })
    }

    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({
        message: '地点 ID 无效',
      })
    }

    const favorite = await Favorite.findOne({ userId, placeId })

    res.json({
      favorited: !!favorite,
    })
  } catch (error) {
    res.status(500).json({
      message: '检查收藏状态失败',
      error: error.message,
    })
  }
})

module.exports = router
