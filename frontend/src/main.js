import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { pinia } from '@/stores'
import { setupStatusBar } from '@/utils/statusbar'
import { initBackButtonHandler } from '@/utils/back-handler'

// Vant 组件库
import {
  Button,
  Cell,
  CellGroup,
  Field,
  Form,
  Icon,
  Image as VanImage,
  List,
  NavBar,
  PullRefresh,
  Rate,
  Search,
  Skeleton,
  Tabbar,
  TabbarItem,
  Tag,
  Toast,
  Empty,
  Picker,
  Popup,
  Swipe,
  SwipeItem,
  SwipeCell,
  ImagePreview,
  Dialog,
  Checkbox,
  Radio,
  Uploader,
  Cascader,
  IndexBar,
  IndexAnchor,
} from 'vant'

// Vant 样式
import 'vant/lib/index.css'

// 全局样式
import './style.css'
// 移动端适配样式
import './styles/mobile-adapter.css'

const app = createApp(App)

// 注册 Vant 组件
const vantComponents = [
  Button,
  Cell,
  CellGroup,
  Field,
  Form,
  Icon,
  VanImage,
  List,
  NavBar,
  PullRefresh,
  Rate,
  Search,
  Skeleton,
  Tabbar,
  TabbarItem,
  Tag,
  Toast,
  Empty,
  Picker,
  Popup,
  Swipe,
  SwipeItem,
  SwipeCell,
  ImagePreview,
  Dialog,
  Checkbox,
  Radio,
  Uploader,
  Cascader,
  IndexBar,
  IndexAnchor,
]

vantComponents.forEach((component) => {
  app.use(component)
})

app.use(pinia)
app.use(router)

app.mount('#app')

router.isReady().then(() => {
  console.log('[Main] Router is ready, initializing back button handler')
  setupStatusBar()
  initBackButtonHandler()
})
