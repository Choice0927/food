import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import router from '@/router'

let backButtonListeners = []
let isInitialized = false

const HOME_ROUTES = ['/home', '/']
const STORAGE_KEY = 'app_navigation_history'

function isHomeRoute(path) {
  return HOME_ROUTES.some(route => path === route || path.startsWith(route + '?'))
}

function getNavigationHistory() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveNavigationHistory(history) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (e) {
    console.error('[BackHandler] Failed to save navigation history:', e)
  }
}

function handleBackButton(data) {
  console.log('[BackHandler] ====== BACK BUTTON PRESSED ======')
  console.log('[BackHandler] Current path:', router.currentRoute.value.path)
  
  const history = getNavigationHistory()
  console.log('[BackHandler] Navigation history:', history)
  
  for (const listener of backButtonListeners) {
    const result = listener()
    if (result === false) {
      console.log('[BackHandler] Handled by custom listener')
      return
    }
  }

  const currentPath = router.currentRoute.value.path
  
  if (history.length > 1) {
    console.log('[BackHandler] History has entries, going back')
    router.back()
  } else if (isHomeRoute(currentPath)) {
    console.log('[BackHandler] At home route, exiting app')
    App.exitApp()
  } else {
    console.log('[BackHandler] Not at home but no history, going to home')
    router.push('/home')
  }
}

export async function initBackButtonHandler() {
  console.log('[BackHandler] initBackButtonHandler called')
  console.log('[BackHandler] isNativePlatform:', Capacitor.isNativePlatform())
  console.log('[BackHandler] Platform:', Capacitor.getPlatform())
  
  if (!Capacitor.isNativePlatform()) {
    console.log('[BackHandler] Not a native platform, skipping back button handler')
    return
  }
  
  if (isInitialized) {
    console.log('[BackHandler] Already initialized, skipping')
    return
  }
  
  isInitialized = true

  let history = getNavigationHistory()
  if (history.length === 0 && router.currentRoute.value) {
    history = [router.currentRoute.value.path]
    saveNavigationHistory(history)
  }
  console.log('[BackHandler] Initial navigation history:', history)

  router.afterEach((to, from) => {
    const history = getNavigationHistory()
    const lastPath = history[history.length - 1]
    
    if (to.path !== lastPath) {
      if (history.length > 1 && history[history.length - 2] === to.path) {
        console.log('[BackHandler] Back navigation from', from?.path, 'to', to.path)
        history.pop()
      } else {
        console.log('[BackHandler] Forward navigation from', from?.path, 'to', to.path)
        history.push(to.path)
      }
      saveNavigationHistory(history)
      console.log('[BackHandler] Updated history:', history)
    }
  })

  console.log('[BackHandler] Setting up backButton listener')
  
  try {
    await App.addListener('backButton', handleBackButton)
    console.log('[BackHandler] App.addListener backButton registered successfully')
  } catch (error) {
    console.error('[BackHandler] Failed to register App.addListener:', error)
  }
}

export function addBackButtonListener(callback) {
  backButtonListeners.push(callback)
  return () => {
    const index = backButtonListeners.indexOf(callback)
    if (index > -1) {
      backButtonListeners.splice(index, 1)
    }
  }
}

export function removeBackButtonListener(callback) {
  const index = backButtonListeners.indexOf(callback)
  if (index > -1) {
    backButtonListeners.splice(index, 1)
  }
}

export function clearNavigationHistory() {
  const currentPath = router.currentRoute.value?.path || '/home'
  saveNavigationHistory([currentPath])
  console.log('[BackHandler] Navigation history cleared:', [currentPath])
}
