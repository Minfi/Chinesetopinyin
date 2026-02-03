import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // GitHub Pages 部署配置
  // 必须与您的 GitHub 仓库名称一致，前后都要加斜杠
  base: '/Chinesetopinyin/', 
})