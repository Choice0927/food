const express = require('express')
const router = express.Router()
const Place = require('../models/Place')
const auth = require('../middleware/auth.middleware')
const upload = require('../middleware/upload.middleware')

// @route   GET /api/places
// @desc    获取当前用户的地点列表
// @access  Private
router.get('/places', auth, async (req, res) => {
  try {
    const { city, keyword, page = 1, limit = 10 } = req.query
    
    const query = { user: req.user.id }
    
    if (city) {
      query.city = city
    }
    
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { address: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(keyword, 'i')] } }
      ]
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const [places, total] = await Promise.all([
      Place.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Place.countDocuments(query)
    ])
    
    res.json({
      success: true,
      data: {
        list: places,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          hasMore: skip + places.length < total
        }
      }
    })
  } catch (error) {
    console.error('Get places error:', error)
    res.status(500).json({
      success: false,
      message: '获取地点列表失败'
    })
  }
})

// @route   GET /api/places/:id
// @desc    获取单个地点详情
// @access  Private
router.get('/places/:id', auth, async (req, res) => {
  try {
    const place = await Place.findOne({
      _id: req.params.id,
      user: req.user.id
    }).lean()
    
    if (!place) {
      return res.status(404).json({
        success: false,
        message: '地点不存在'
      })
    }
    
    res.json({
      success: true,
      data: place
    })
  } catch (error) {
    console.error('Get place error:', error)
    res.status(500).json({
      success: false,
      message: '获取地点详情失败'
    })
  }
})

// @route   POST /api/places
// @desc    创建新地点
// @access  Private
router.post('/places', auth, async (req, res) => {
  try {
    const {
      name,
      city,
      address,
      latitude,
      longitude,
      description,
      images,
      tags,
      rating
    } = req.body
    
    // 验证必填字段
    if (!name || !city || !address) {
      return res.status(400).json({
        success: false,
        message: '名称、城市和地址为必填项'
      })
    }
    
    const place = new Place({
      user: req.user.id,
      name: name.trim(),
      city: city.trim(),
      address: address.trim(),
      location: {
        lat: latitude || null,
        lng: longitude || null
      },
      description: description?.trim() || '',
      images: images || [],
      tags: tags || [],
      rating: rating || 0
    })
    
    await place.save()
    
    res.status(201).json({
      success: true,
      message: '创建成功',
      data: place
    })
  } catch (error) {
    console.error('Create place error:', error)
    res.status(500).json({
      success: false,
      message: '创建地点失败'
    })
  }
})

// @route   PUT /api/places/:id
// @desc    更新地点
// @access  Private
router.put('/places/:id', auth, async (req, res) => {
  try {
    const place = await Place.findOne({
      _id: req.params.id,
      user: req.user.id
    })
    
    if (!place) {
      return res.status(404).json({
        success: false,
        message: '地点不存在或无权限编辑'
      })
    }
    
    const updateFields = ['name', 'city', 'address', 'description', 'images', 'tags', 'rating']
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'name' || field === 'city' || field === 'address' || field === 'description') {
          place[field] = req.body[field].trim()
        } else {
          place[field] = req.body[field]
        }
      }
    })
    
    // 处理经纬度
    if (req.body.latitude !== undefined || req.body.longitude !== undefined) {
      place.location = {
        lat: req.body.latitude ?? place.location?.lat,
        lng: req.body.longitude ?? place.location?.lng
      }
    }
    
    await place.save()
    
    res.json({
      success: true,
      message: '更新成功',
      data: place
    })
  } catch (error) {
    console.error('Update place error:', error)
    res.status(500).json({
      success: false,
      message: '更新地点失败'
    })
  }
})

// @route   DELETE /api/places/:id
// @desc    删除地点
// @access  Private
router.delete('/places/:id', auth, async (req, res) => {
  try {
    const place = await Place.findOne({
      _id: req.params.id,
      user: req.user.id
    })
    
    if (!place) {
      return res.status(404).json({
        success: false,
        message: '地点不存在或无权限删除'
      })
    }
    
    await place.deleteOne()
    
    res.json({
      success: true,
      message: '删除成功'
    })
  } catch (error) {
    console.error('Delete place error:', error)
    res.status(500).json({
      success: false,
      message: '删除地点失败'
    })
  }
})

// @route   POST /api/places/upload
// @desc    上传图片
// @access  Private
router.post('/places/upload', auth, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有上传文件'
      })
    }

    // 构建文件URL数组
    const imageUrls = req.files.map(file => {
      // 返回相对路径，前端使用时拼接基础URL
      return `/uploads/${file.filename}`
    })

    res.json({
      success: true,
      message: '上传成功',
      data: {
        urls: imageUrls,
        count: imageUrls.length
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      success: false,
      message: '上传失败'
    })
  }
})

module.exports = router
