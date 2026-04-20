<template>
  <div class="city-picker">
    <!-- 搜索栏 -->
    <div class="search-header">
      <van-search
        v-model="searchKeyword"
        placeholder="搜索城市名称"
        shape="round"
        clearable
        @input="onSearch"
      />
      <div class="mode-toggle" v-if="showCascade">
        <van-button
          size="small"
          :type="mode === 'list' ? 'primary' : 'default'"
          @click="mode = 'list'"
        >
          列表
        </van-button>
        <van-button
          size="small"
          :type="mode === 'cascade' ? 'primary' : 'default'"
          @click="mode = 'cascade'"
        >
          级联
        </van-button>
      </div>
    </div>

    <!-- 列表模式 -->
    <div v-show="mode === 'list'" class="list-mode">
      <!-- 当前定位城市 -->
      <div class="current-city-section" v-if="currentCity">
        <div class="section-title">当前定位</div>
        <div class="city-tag primary" @click="selectCity(currentCity)">
          <van-icon name="location-o" />
          {{ currentCity.name }}
        </div>
      </div>

      <!-- 热门城市 -->
      <div class="hot-cities-section">
        <div class="section-title">热门城市</div>
        <div class="city-tags">
          <div
            v-for="city in hotCities"
            :key="city.code"
            class="city-tag"
            @click="selectCity(city)"
          >
            {{ city.name }}
          </div>
        </div>
      </div>

      <!-- 字母索引列表 -->
      <div class="index-list-section">
        <div class="section-title">城市列表</div>
        
        <!-- 字母索引 + 城市列表 -->
        <div class="alphabet-list" v-if="!searchKeyword">
          <!-- 右侧字母导航 -->
          <div class="alphabet-sidebar">
            <div
              v-for="letter in indexList"
              :key="letter"
              class="alphabet-letter"
              @click="scrollToLetter(letter)"
            >
              {{ letter }}
            </div>
          </div>
          
          <!-- 城市列表 -->
          <div class="city-list-container">
            <div
              v-for="(group, letter) in cityGroups"
              :key="letter"
              :id="'letter-' + letter"
              class="letter-group"
            >
              <div class="letter-header">{{ letter }}</div>
              <div class="city-cells">
                <div
                  v-for="city in group"
                  :key="city.code"
                  class="city-cell"
                  @click="selectCity(city)"
                >
                  {{ city.name }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 搜索结果 -->
        <div v-else class="search-results">
          <van-cell
            v-for="city in filteredCities"
            :key="city.code"
            :title="city.name"
            :label="city.pinyin"
            @click="selectCity(city)"
          />
          <van-empty v-if="filteredCities.length === 0" description="未找到匹配的城市" />
        </div>
      </div>
    </div>

    <!-- 级联选择模式 -->
    <div v-show="mode === 'cascade'" class="cascade-mode">
      <van-cascader
        v-model="cascaderValue"
        title="请选择省市区"
        :options="cascadeOptions"
        @finish="onCascaderFinish"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast } from 'vant'
import { cityData, hotCities, getCityGroups, getCascadeOptions } from '@/data/cities'

const props = defineProps({
  showCascade: {
    type: Boolean,
    default: true
  },
  defaultMode: {
    type: String,
    default: 'list' // 'list' 或 'cascade'
  }
})

const emit = defineEmits(['select', 'cancel'])

// 状态
const mode = ref(props.defaultMode)
const searchKeyword = ref('')
const currentCity = ref(null)
const cascaderValue = ref([])

// 所有字母 A-Z
const ALL_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

// 计算属性
const cityGroups = computed(() => {
  const groups = getCityGroups()
  // 确保所有字母都有分组，即使没有城市
  ALL_LETTERS.forEach(letter => {
    if (!groups[letter]) {
      groups[letter] = []
    }
  })
  return groups
})
const indexList = computed(() => ALL_LETTERS)
const cascadeOptions = computed(() => getCascadeOptions())

const filteredCities = computed(() => {
  if (!searchKeyword.value) return []
  const keyword = searchKeyword.value.toLowerCase()
  return cityData.filter(city => 
    city.name.includes(keyword) || 
    city.pinyin.includes(keyword) ||
    city.code.includes(keyword)
  )
})

// 方法
const onSearch = () => {
  // 搜索逻辑在计算属性中处理
}

const selectCity = (city) => {
  emit('select', city)
}

const scrollToLetter = (letter) => {
  const element = document.getElementById('letter-' + letter)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const onCascaderFinish = ({ selectedOptions }) => {
  const selectedCity = selectedOptions[selectedOptions.length - 1]
  // 转换为统一的格式 { name, code }
  const city = {
    name: selectedCity.text,
    code: selectedCity.value,
    pinyin: ''
  }
  emit('select', city)
}

// 获取当前定位（可选）
const getLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // 这里可以根据坐标反查城市
        // 简化处理，默认设置为北京
        currentCity.value = cityData.find(c => c.code === '110100')
      },
      (error) => {
        console.error('定位失败:', error)
      }
    )
  }
}

onMounted(() => {
  getLocation()
})
</script>

<style scoped>
.city-picker {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.search-header {
  padding: 10px;
  background: #fff;
  border-bottom: 1px solid #ebedf0;
}

.mode-toggle {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  justify-content: center;
}

.list-mode {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
}

.section-title {
  font-size: 14px;
  color: #999;
  padding: 12px 16px 8px;
  font-weight: 500;
}

.current-city-section,
.hot-cities-section {
  background: #fff;
  margin-bottom: 8px;
  padding: 0 12px 12px;
}

.city-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.city-tag {
  padding: 6px 14px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}

.city-tag:hover,
.city-tag:active {
  background: #e8e8e8;
}

.city-tag.primary {
  background: #ff6b3d;
  color: #fff;
}

.city-tag.primary:hover,
.city-tag.primary:active {
  background: #e55a2b;
}

.index-list-section {
  background: #fff;
}

.search-results {
  min-height: 200px;
}

.cascade-mode {
  flex: 1;
  background: #fff;
}

/* 字母列表样式 */
.alphabet-list {
  display: flex;
  height: 100%;
  position: relative;
}

.alphabet-sidebar {
  position: fixed;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 8px 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.alphabet-letter {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s;
}

.alphabet-letter:hover,
.alphabet-letter:active {
  background: #ff6b3d;
  color: #fff;
}

.city-list-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 40px;
  padding-bottom: 20px;
}

.letter-group {
  margin-bottom: 8px;
}

.letter-header {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  padding: 8px 16px;
  background: #f8f8f8;
  border-left: 3px solid #ff6b3d;
}

.city-cells {
  background: #fff;
}

.city-cell {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 15px;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;
}

.city-cell:hover,
.city-cell:active {
  background: #f5f5f5;
}

.city-cell:last-child {
  border-bottom: none;
}
</style>
