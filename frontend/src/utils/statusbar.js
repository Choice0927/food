import { StatusBar, Style } from '@capacitor/status-bar'
import { Capacitor } from '@capacitor/core'

export async function setupStatusBar() {
  if (Capacitor.isNativePlatform()) {
    try {
      await StatusBar.setStyle({ style: Style.Light })
      await StatusBar.setBackgroundColor({ color: '#ffffff' })
      await StatusBar.show()
      
      const info = await StatusBar.getInfo()
      console.log('StatusBar info:', info)
      
      if (info.height) {
        document.documentElement.style.setProperty('--status-bar-height', `${info.height}px`)
      }
      
      console.log('StatusBar configured successfully')
    } catch (error) {
      console.warn('StatusBar setup failed:', error)
    }
  }
}

export async function setStatusBarDark() {
  if (Capacitor.isNativePlatform()) {
    try {
      await StatusBar.setStyle({ style: Style.Dark })
    } catch (error) {
      console.warn('setStatusBarDark failed:', error)
    }
  }
}

export async function setStatusBarLight() {
  if (Capacitor.isNativePlatform()) {
    try {
      await StatusBar.setStyle({ style: Style.Light })
    } catch (error) {
      console.warn('setStatusBarLight failed:', error)
    }
  }
}
