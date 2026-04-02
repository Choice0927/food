const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth.middleware')
const Post = require('../models/Post')

// @route   GET /api/posts
// @desc    获取所有帖子/地点列表
// @access  Public
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'nickname avatar')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: posts,
    })
  } catch (error) {
    console.error('Get posts error:', error)
    res.status(500).json({
      success: false,
      message: '获取帖子列表失败',
    })
  }
})

// @route   GET /api/posts/:id
// @desc    获取单个帖子详情
// @access  Public
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'nickname avatar')

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在',
      })
    }

    res.json({
      success: true,
      data: post,
    })
  } catch (error) {
    console.error('Get post error:', error)
    res.status(500).json({
      success: false,
      message: '获取帖子详情失败',
    })
  }
})

// @route   POST /api/posts
// @desc    创建新帖子
// @access  Private
router.post('/posts', auth, async (req, res) => {
  try {
    const { title, content, images, location } = req.body

    const post = new Post({
      title,
      content,
      images,
      location,
      author: req.user.id,
    })

    await post.save()

    res.status(201).json({
      success: true,
      data: post,
    })
  } catch (error) {
    console.error('Create post error:', error)
    res.status(500).json({
      success: false,
      message: '创建帖子失败',
    })
  }
})

// @route   PUT /api/posts/:id
// @desc    更新帖子
// @access  Private
router.put('/posts/:id', auth, async (req, res) => {
  try {
    const { title, content, images, location } = req.body

    const post = await Post.findOne({
      _id: req.params.id,
      author: req.user.id,
    })

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在或无权限编辑',
      })
    }

    post.title = title || post.title
    post.content = content || post.content
    post.images = images || post.images
    post.location = location || post.location

    await post.save()

    res.json({
      success: true,
      data: post,
    })
  } catch (error) {
    console.error('Update post error:', error)
    res.status(500).json({
      success: false,
      message: '更新帖子失败',
    })
  }
})

// @route   DELETE /api/posts/:id
// @desc    删除帖子
// @access  Private
router.delete('/posts/:id', auth, async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      author: req.user.id,
    })

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在或无权限删除',
      })
    }

    await post.deleteOne()

    res.json({
      success: true,
      message: '帖子删除成功',
    })
  } catch (error) {
    console.error('Delete post error:', error)
    res.status(500).json({
      success: false,
      message: '删除帖子失败',
    })
  }
})

module.exports = router
