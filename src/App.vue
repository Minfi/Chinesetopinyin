<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { pinyin } from 'pinyin-pro';
import ControlPanel from './components/ControlPanel.vue';
import WorksheetPreview from './components/WorksheetPreview.vue';

// State
const chineseText = ref('');
const config = reactive({
  fontSize: 12,
  lineHeight: 1,
  showBorder: true,
  showPagination: false,
  textAlign: 'center',
  gridSize: 16
});

// Grid Generation Logic
// const MAX_CHARS_PER_LINE = 12; // 废弃常量，改用 config.gridSize

const createEmptyCell = () => ({ text: '', isEmpty: true });

const generateRows = (text) => {
  const MAX_CHARS_PER_LINE = config.gridSize; // 动态获取
  if (!text) return [];

  // Robust Pinyin Generation
  // 1. Extract Chinese characters to preserve context for pinyin generation
  // (Removed here, moved to after preprocessing)
  
  // 2. Generate pinyin for the Chinese-only string
  // (Removed here, moved to after preprocessing)
  
  // (Variable zhIndex moved to after preprocessing)
  
  const pages = [];
  let currentPageRows = [];
  let currentPageHeight = 0;
  
  // A4 纸可用高度 = 297mm - 20mm(上) - 15mm(下) = 262mm
   const MAX_PAGE_HEIGHT = 260; // 调大至接近物理极限，充分利用页面空间
   const contentWidth = 170; // mm
   const cellHeight = contentWidth / config.gridSize;
   
   // 修正拼音行高度计算
   const pinyinRowHeight = Math.max(config.lineHeight * 6, 8);
   
   // 稍微减小缓冲值，避免因缓冲过大导致本能放下的行被挤到下一页
   const rowTotalHeight = pinyinRowHeight + cellHeight + 0.5;
   
   const flushPage = () => {
    if (currentPageRows.length > 0) {
      pages.push(currentPageRows);
    }
    currentPageRows = [];
    currentPageHeight = 0;
  };
  
  const allRows = [];
  let currentPinyinRow = [];
  let currentChineseRow = [];
  let charCount = 0;

  // 预处理文本：按行分割，每行去除首尾空格
  const lines = text.split('\n');
  const processedText = lines.map(line => line.trim()).join('\n');

  // Robust Pinyin Generation
  // 1. Extract Chinese characters to preserve context for pinyin generation
  const zhChars = [];
  for (let char of processedText) {
    if (/[\u4e00-\u9fa5]/.test(char)) {
      zhChars.push(char);
    }
  }
  const zhText = zhChars.join('');
  
  // 2. Generate pinyin for the Chinese-only string
  // 我们需要两份数据：
  // 1. 带上下文的正确拼音（用于默认显示）
  const contextPinyin = zhText ? pinyin(zhText, { 
    toneType: 'symbol', 
    type: 'array'
  }) : [];
  
  // (移除 multiplePinyin 的整体生成，改为在循环中单字查询，以确保获取所有字典读音)

  let zhIndex = 0;

  const flushRow = () => {
    if (currentPinyinRow.length > 0 || currentChineseRow.length > 0) {
       // Fill remaining
       const remaining = MAX_CHARS_PER_LINE - charCount;
       if (remaining > 0) {
         if (config.textAlign === 'center') {
           const left = Math.floor(remaining / 2);
           const right = remaining - left;
           for(let k=0; k<left; k++) {
             currentPinyinRow.unshift(createEmptyCell());
             currentChineseRow.unshift(createEmptyCell());
           }
           for(let k=0; k<right; k++) {
             currentPinyinRow.push(createEmptyCell());
             currentChineseRow.push(createEmptyCell());
           }
         } else {
           for(let k=0; k<remaining; k++) {
             currentPinyinRow.push(createEmptyCell());
             currentChineseRow.push(createEmptyCell());
           }
         }
       }
       allRows.push({ pinyin: currentPinyinRow, chinese: currentChineseRow });
    }
    currentPinyinRow = [];
    currentChineseRow = [];
    charCount = 0;
  };

  const addEmptyRow = () => {
     const pRow = [];
     const cRow = [];
     for(let k=0; k<MAX_CHARS_PER_LINE; k++) {
       pRow.push(createEmptyCell());
       cRow.push(createEmptyCell());
     }
     allRows.push({ pinyin: pRow, chinese: cRow });
  };
  
  // 遍历处理后的文本
  for (let i = 0; i < processedText.length; i++) {
    const char = processedText[i];
    
    if (char === '\n') {
      if (charCount > 0) {
        flushRow();
      } else {
        addEmptyRow();
      }
      continue;
    }

    if (charCount >= MAX_CHARS_PER_LINE) {
      flushRow();
    }

    const isChinese = /[\u4e00-\u9fa5]/.test(char);

    if (isChinese) {
       const currentBest = contextPinyin[zhIndex] || '';
       
       // 核心修复：直接查询该单字的所有字典读音
       // 即使在词组中（如"银行"），我们也想知道"行"字本身是不是多音字
       const allReadingsStr = pinyin(char, {
           toneType: 'symbol',
           type: 'string',
           multiple: true
       });
       const allPossible = allReadingsStr ? allReadingsStr.split(' ') : [];
       
       zhIndex++;
       
       // 确保当前最合适的读音在选项列表的第一位，或者至少在列表中
       let options = [...allPossible];
       if (currentBest && !options.includes(currentBest)) {
         options.unshift(currentBest);
       }
       // 去重
       options = [...new Set(options)];
       
       // 调试日志：检查多音字判断逻辑
       if (options.length > 1) {
           console.log(`多音字检测: ${char} -> ${options.join(', ')}`);
       }
       
       const isPolyphone = options.length > 1;
       
       currentPinyinRow.push({ 
         text: currentBest, 
         options: options, 
         isPolyphone: isPolyphone,
         isEditing: false, 
         isEmpty: false 
       });
       currentChineseRow.push({ text: char, isPunctuation: false, isEmpty: false });
    } else {
       currentPinyinRow.push(createEmptyCell()); 
       currentChineseRow.push({ text: char, isPunctuation: true, isEmpty: false });
    }
    charCount++;
  }

  // Flush last row
  if (charCount > 0) {
    flushRow();
  }
  
  // Pagination
  if (config.showPagination) {
    for (const row of allRows) {
      if (currentPageHeight + rowTotalHeight > MAX_PAGE_HEIGHT) {
        flushPage();
      }
      currentPageRows.push(row);
      currentPageHeight += rowTotalHeight;
    }
    flushPage();
  } else {
    // 不分页模式：所有内容放入第一页
    pages.push(allRows);
  }
  
  return pages;
};

// Reactive Pages
const pages = computed(() => generateRows(chineseText.value));

// Debounce is handled by Vue's reactivity system effectively for local state, 
// but if calculation is heavy, we can debounce the input update.
// For now, computed is fast enough for typical text lengths.
// If needed, we can use a custom debounceRef.

const handlePrint = () => {
  window.print();
};
</script>

<template>
  <div class="app-container">
    <!-- 左侧侧边栏：控制面板 -->
    <div class="sidebar no-print">
      <h1>拼音教学工具</h1>
      <ControlPanel 
      :text="chineseText"
      :config="config"
      @update:text="chineseText = $event"
      @update:config="Object.assign(config, $event)"
      @print="handlePrint"
    />
    </div>

    <!-- 右侧主区域：预览 -->
    <div class="main-content">
      <WorksheetPreview 
      :pages="pages"
      :showBorder="config.showBorder"
      :showPagination="config.showPagination"
      :textAlign="config.textAlign"
      :fontSize="config.fontSize"
      :lineHeight="config.lineHeight"
      :gridSize="config.gridSize"
    />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.sidebar {
  width: 400px;
  background-color: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0,0,0,0.05);
  z-index: 10;
}

.sidebar h1 {
  text-align: center;
  color: var(--primary-color);
  margin: 0;
  padding: 20px;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 1px;
  border-bottom: 1px solid #f0f0f0;
}

.main-content {
  flex: 1;
  background-color: #f0f4f8; /* 预览区背景色 */
  overflow: auto; /* 允许预览区滚动 */
  padding: 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

@media print {
  .app-container {
    display: block;
    height: auto;
    width: auto;
    overflow: visible;
  }
  
  .sidebar {
    display: none;
  }

  .main-content {
    padding: 0;
    margin: 0;
    overflow: visible;
    display: block;
    background-color: white;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
    box-shadow: none;
    z-index: 20;
    flex-shrink: 0;
  }
  
  .sidebar h1 {
    font-size: 1.2rem;
    padding: 15px;
  }

  .main-content {
    width: 100%;
    height: auto;
    padding: 20px 10px;
    display: block;
    overflow: visible;
    flex: 1;
  }
}
</style>