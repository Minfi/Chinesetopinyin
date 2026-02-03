# 汉字转拼音教学工具 (Pinyin Worksheet Generator)

一个基于 Vue 3 + Vite 开发的在线工具，用于将汉字文本转换为标准的拼音田字格练习纸。支持多音字校对、A4 打印导出、移动端适配等功能。

🔗 **在线演示**: [https://minfi.github.io/Chinesetopinyin/](https://minfi.github.io/Chinesetopinyin/)

![Preview](./public/preview.png)
*(注：请在 `public` 目录下添加一张预览截图，或者删除此行)*

## ✨ 核心功能

- **📝 汉字转拼音**：
  - 输入任意汉字/古诗/文章，自动生成带声调的拼音。
  - 支持田字格排版，一行拼音，一行汉字。

- **🎯 智能多音字校对**：
  - **自动检测**：系统会自动标记潜在的多音字（显示橙色背景和提示点）。
  - **交互式修改**：点击拼音格，弹出全局浮层，列出所有候选读音，一键纠正。
  - **智能上下文**：基于算法自动匹配最可能的读音（如“银行”匹配 `háng`）。

- **🎨 高度可定制**：
  - **每行格数**：支持 8~20 格自由调节（适合不同年龄段学生）。
  - **排版控制**：字体大小、行间距、对齐方式（居中/左对齐）。
  - **样式开关**：一键显示/隐藏田字格边框。

- **📄 打印与导出**：
  - **A4 标准分页**：精准的毫米级计算，确保打印时不切断文字，自动分页并生成页码。
  - **PDF 导出**：支持调用浏览器原生打印功能，直接另存为 PDF。
  - **预览模式**：支持切换“分页预览”和“连续滚动预览”。

- **📱 响应式设计**：
  - 完美适配手机、平板和桌面端。
  - 移动端自动切换为上下布局，预览区智能缩放。

## 🛠️ 技术栈

- **前端框架**: [Vue 3](https://vuejs.org/) (Composition API)
- **构建工具**: [Vite](https://vitejs.dev/)
- **拼音引擎**: [pinyin-pro](https://github.com/zh-lx/pinyin-pro) (专业级汉字拼音转换库)
- **部署**: GitHub Actions + GitHub Pages

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/minfi/Chinesetopinyin.git
cd Chinesetopinyin
```

### 2. 安装依赖
```bash
npm install
```

### 3. 启动开发服务器
```bash
npm run dev
```
访问 `http://localhost:5173` 即可开始开发。

### 4. 构建生产版本
```bash
npm run build
```
构建产物位于 `dist` 目录。

## 📦 部署指南 (GitHub Pages)

本项目已配置 GitHub Actions 自动化部署。

1. 修改 `vite.config.js` 中的 `base` 配置为您仓库的名称：
   ```js
   base: '/Chinesetopinyin/', 
   ```
2. 推送代码到 GitHub 仓库。
3. 在 GitHub 仓库设置中，开启 GitHub Pages，Source 选择 **GitHub Actions**。
4. 每次 push 代码，系统会自动构建并更新网站。

## 📄 许可证

MIT License
