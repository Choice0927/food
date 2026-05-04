#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🍽️  食mini App 开始设置...')

// 步骤 1：安装依赖
console.log('📦 安装 Capacitor 依赖...')
execSync('npm install @capacitor/core @capacitor/cli @capacitor/android', {
  stdio: 'inherit'
})

// 步骤 2：初始化 Capacitor
console.log('⚙️  初始化 Capacitor...')
if (!fs.existsSync('capacitor.config.ts')) {
  execSync('npx cap init 食mini com.eatmini.app', {
    stdio: 'inherit'
  })
}

// 步骤 3：创建配置文件
console.log('📝 创建配置文件...')
const configContent = `import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eatmini.app',
  appName: '食mini',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  }
};

export default config;
`;

fs.writeFileSync('capacitor.config.ts', configContent)

// 步骤 4：添加 Android 平台
console.log('📱 添加 Android 平台...')
if (!fs.existsSync('android')) {
  execSync('npx cap add android', { stdio: 'inherit' })
}

console.log('✅ 食mini App 设置完成！')
console.log('\n下一步：')
console.log('1. 准备图标: public/icon.png (1024×1024)')
console.log('2. 准备启动页: public/splash.png (2732×2732)')
console.log('3. 运行 npm run build')
console.log('4. 运行 npx cap assets')
console.log('5. 运行 npx cap sync android')
console.log('6. 运行 npx cap open android')
console.log('\n配置信息：')
console.log('应用名称: 食mini')
console.log('App ID: com.eatmini.app')
console.log('包名: com.eatmini.app')