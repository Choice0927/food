/**
 * Vant 组件移动端适配工具
 * 提供适用于 App 环境的 Vant 组件配置和样式
 */

import { Toast, Dialog, Notify, Loading } from 'vant'

/**
 * Toast 提示封装
 * 在 App 环境中提供更好的体验
 */
export const showToast = (message, options = {}) => {
  return Toast({
    message,
    position: 'bottom',
    duration: 2000,
    forbidClick: false,
    iconSize: '20px',
    fontSize: '16px',
    ...options
  })
}

/**
 * Dialog 弹窗封装
 * 适配移动端的触摸和尺寸
 */
export const showDialog = (options) => {
  return Dialog.confirm({
    title: options.title || '提示',
    message: options.message,
    confirmButtonText: options.confirmButtonText || '确定',
    cancelButtonText: options.cancelButtonText || '取消',
    confirmButtonColor: '#ff6b3d',
    cancelButtonColor: '#666',
    showConfirmButton: true,
    showCancelButton: options.showCancelButton !== false,
    closeOnClickOverlay: true,
    overlay: true,
    overlayStyle: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)'
    },
    ...options
  })
}

/**
 * Loading 提示封装
 * 在 App 环境中显示加载状态
 */
export const showLoading = (message = '加载中...') => {
  return Loading.show({
    message,
    forbidClick: true,
    duration: 0,
    overlay: true
  })
}

export const hideLoading = () => {
  return Loading.clear()
}

/**
 * Notify 通知封装
 * 用于显示状态更新通知
 */
export const showNotify = (message, type = 'success') => {
  return Notify({
    type,
    message,
    duration: 3000,
    position: 'top'
  })
}

/**
 * 移动端组件配置
 * 返回适用于移动端的 Vant 组件配置对象
 */
export const getMobileComponentConfig = () => {
  return {
    // 按钮配置
    button: {
      round: true,
      block: false,
      size: 'normal',
      hairline: true
    },
    
    // 输入框配置
    field: {
      placeholder: '请输入',
      clearable: true,
      clearTrigger: 'always'
    },
    
    // 弹窗配置
    dialog: {
      round: true,
      showConfirmButton: true,
      closeOnPopstate: true,
      overlay: true
    },
    
    // 列表配置
    list: {
      border: false,
      inset: true
    },
    
    // 卡片配置
    card: {
      round: true,
      shadow: true
    },
    
    // 标签配置
    tag: {
      round: true,
      plain: false
    }
  }
}