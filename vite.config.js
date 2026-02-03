import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // GitHub Pages 部署配置
  // 如果您的仓库名是 'pinyin-worksheet'，请将这里改为 '/pinyin-worksheet/'
  // 如果是用户主页 (username.github.io)，则保持 '/' 或 './'
  // 为了通用性，'./' 通常能工作，但在某些路由模式下可能需要指定绝对路径
  base: './', 
})