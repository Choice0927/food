const express = require('express')
const router = express.Router()
const Favorite = require('../models/Favorite')
const auth = require('../middleware/auth.middleware')

// @route   GET /api/favorites
// @desc    获取当前用户的收藏列表
// @access  Private
router.get('/favorites', auth, async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .populate('place', 'name city images rating tags')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: favorites,
    })
  } catch (error) {
    console.error('Get favorites error:', error)
    res.status(500).json({
      success: false,
      message: '获取收藏列表失败',
    })
  }
})

// @route   POST /api/favorites
// @desc    添加收藏
// @access  Private
router.post('/favorites', auth, async (req, res) => {
  try {
    const { placeId } = req.body

    // 检查是否已经收藏
    const existingFavorite = await Favorite.findOne({
      user: req.user.id,
      place: placeId,
    })

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: '该地点已收藏',
      })
    }

    const favorite = new Favorite({
      user: req.user.id,
      place: placeId,
    })

    await favorite.save()

    await favorite.populate('place', 'name city images rating tags')

    res.status(201).json({
      success: true,
      data: favorite,
    })
  } catch (error) {
    console.error('Add favorite error:', error)
    res.status(500).json({
      success: false,
      message: '添加收藏失败',
    })
  }
})

// @route   DELETE /api/favorites/:id
// @desc    取消收藏
// @access  Private
router.delete('/favorites/:id', auth, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: '收藏记录不存在',
      })
    }

    await favorite.deleteOne()

    res.json({
      success: true,
      message: '取消收藏成功',
    })
  } catch (error) {
    console.error('Delete favorite error:', error)
    res.status(500).json({
      success: false,
      message: '取消收藏失败',
    })
  }
})

// @route   GET /api/favorites/check/:placeId
// @desc    检查是否已收藏某个地点
// @access  Private
router.get('/favorites/check/:placeId', auth, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      user: req.user.id,
      place: req.params.placeId,
    })

    res.json({
      success: true,
      data: {
        isFavorite: !!favorite,
        favoriteId: favorite?._id || null,
      },
    })
  } catch (error) {
    console.error('Check favorite error:', error)
    res.status(500).json({
      success: false,
      message: '检查收藏状态失败',
    })
  }
})

module.exports = router
