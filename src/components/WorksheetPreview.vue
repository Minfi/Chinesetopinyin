<script setup>
import { defineProps, defineEmits, onMounted, ref, onUnmounted, nextTick } from 'vue';

const props = defineProps({
  pages: {
    type: Array,
    required: true
  },
  showBorder: {
    type: Boolean,
    default: true
  },
  showPagination: {
    type: Boolean,
    default: false
  },
  textAlign: {
    type: String,
    default: 'center'
  },
  fontSize: {
    type: Number,
    default: 12
  },
  lineHeight: {
    type: Number,
    default: 1
  },
  gridSize: {
    type: Number,
    default: 16
  }
});

const emit = defineEmits(['update:pinyin']);
const previewSectionRef = ref(null);

// 编辑相关状态
const isModalOpen = ref(false);
const editingCell = ref(null);
const editingText = ref('');
const editingChinese = ref(''); // 当前编辑的汉字（用于提示）
const editingOptions = ref([]);

const startEdit = (cell, chineseChar) => {
  if (cell.isEmpty) return;
  
  editingCell.value = cell;
  editingText.value = cell.text;
  editingChinese.value = chineseChar || '';
  editingOptions.value = cell.options || [];
  isModalOpen.value = true;
  
  // 自动聚焦输入框
  nextTick(() => {
    const input = document.getElementById('pinyin-modal-input');
    if (input) input.select();
  });
};

const saveEdit = () => {
  if (editingCell.value) {
    editingCell.value.text = editingText.value;
  }
  closeModal();
};

const selectOption = (opt) => {
  editingText.value = opt;
  saveEdit(); // 选择后直接保存
};

const closeModal = () => {
  isModalOpen.value = false;
  editingCell.value = null;
  editingOptions.value = [];
};

// 自动缩放逻辑：让A4纸在屏幕上完整显示
const autoScale = () => {
  if (!previewSectionRef.value) return;
  // 如果是数组 refs (v-for)，previewSectionRef.value 可能是数组
  const sections = Array.isArray(previewSectionRef.value) ? previewSectionRef.value : [previewSectionRef.value];
  
  if (sections.length === 0) return;
  
  const container = sections[0].parentElement;
  if (!container) return;
  
  const containerWidth = container.clientWidth;
  // A4 宽度 210mm ≈ 794px (96dpi)
  // 这里我们留一点边距
  const a4WidthPx = 800; 
  const scale = Math.min(1, (containerWidth - 40) / a4WidthPx); // 减去padding
  
  sections.forEach(section => {
      section.style.transform = `scale(${scale})`;
      
      // 修复移动端缩放后的大片空白问题
      if (scale < 1) {
          // 获取元素实际高度
          const height = section.offsetHeight;
          // 计算缩放后节省的空间
          const spaceSaved = height * (1 - scale);
          // 使用负边距向上拉
          section.style.marginBottom = `-${spaceSaved}px`;
          
          // 同时可能需要调整 x 轴的占位，防止左右撑开滚动条
          // 但由于 transform-origin 是 center，且父容器 align-items: center
          // 视觉上是居中的。如果父容器 overflow-x: hidden 就可以解决
      } else {
          section.style.marginBottom = '0';
      }
  });
};

onMounted(() => {
  window.addEventListener('resize', autoScale);
  // 延迟一下确保DOM渲染
  setTimeout(autoScale, 100);
});

onUnmounted(() => {
  window.removeEventListener('resize', autoScale);
});
</script>

<template>
  <div class="preview-wrapper" style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 40px; overflow-x: hidden;">
    <div v-for="(pageRows, pageIndex) in pages" :key="pageIndex" class="preview-section" ref="previewSectionRef">
      <div class="a4-container" :class="{ 'no-pagination': !showPagination }">
        <!-- ... (表格内容) ... -->
        <div class="result-container">
          <table class="result-table" :class="{ 'no-border': !showBorder }">
            <colgroup>
              <col v-for="n in gridSize" :key="n" :style="{ width: (100/gridSize) + '%' }" />
            </colgroup>
            <template v-for="(row, rowIndex) in pageRows" :key="rowIndex">
              <!-- 拼音行：高度较小 -->
              <tr class="pinyin-row" :style="{ height: (lineHeight * 6) + 'mm' }"> 
                <td v-for="(cell, cellIndex) in row.pinyin" :key="'p-'+cellIndex" 
                    class="pinyin-cell" 
                    :class="{ 'empty-pinyin': cell.isEmpty, 'polyphone-cell': cell.isPolyphone }"
                    @click="startEdit(cell, row.chinese[cellIndex] ? row.chinese[cellIndex].text : '')"
                >
                  <span>{{ cell.text }}</span>
                  <!-- 多音字提示标 -->
                  <span v-if="cell.isPolyphone" class="polyphone-mark"></span>
                </td>
              </tr>
              <!-- 汉字行：高度较大 -->
              <tr class="chinese-row">
                <td v-for="(cell, cellIndex) in row.chinese" :key="'c-'+cellIndex" 
                    class="chinese-cell"
                    :class="{ 'punctuation-cell': cell.isPunctuation }"
                    :style="{ fontSize: (fontSize / 1.6) + 'mm' }" 
                >
                  {{ cell.text }}
                </td>
              </tr>
            </template>
          </table>
        </div>
        <!-- ... -->
      </div>
    </div>

    <!-- 全局编辑弹窗 (放在这里确保在最外层) -->
    <div v-if="isModalOpen" class="pinyin-modal-overlay" @click.self="closeModal">
      <div class="pinyin-modal">
        <div class="pinyin-modal-header">
          修改拼音 <span v-if="editingChinese">({{ editingChinese }})</span>
        </div>
        <div class="pinyin-modal-body">
          <div v-if="editingOptions.length > 1" class="modal-options">
            <div class="modal-label">检测到多音字：</div>
            <div class="option-buttons">
              <button 
                v-for="opt in editingOptions" 
                :key="opt"
                @click="selectOption(opt)"
                :class="{ 'active': opt === editingText }"
              >
                {{ opt }}
              </button>
            </div>
          </div>
          
          <div class="modal-input-group">
            <div class="modal-label">手动输入：</div>
            <input 
              id="pinyin-modal-input"
              v-model="editingText" 
              @keydown.enter="saveEdit"
              placeholder="输入拼音"
            />
          </div>
        </div>
        <div class="pinyin-modal-footer">
          <button @click="closeModal" class="btn-cancel">取消</button>
          <button @click="saveEdit" class="btn-confirm">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 屏幕预览样式 */
.preview-section {
  /* 使用 scale 进行缩放，而不是让内容自适应 */
  transform-origin: top center;
  /* 初始比例，JS 可以动态计算 */
}

.a4-container {
  /* 核心：直接使用毫米单位，模拟真实纸张 */
  width: 210mm;
  min-height: 297mm;
  padding: 20mm 20mm 15mm 20mm; /* 底部留一点空间给页码 */
  margin: 0 auto;
  background-color: white;
  box-sizing: border-box;
  box-shadow: 0 8px 30px rgba(0,0,0,0.08);
  
  /* 确保内容不溢出 */
  /* overflow: hidden;  <-- 移除这个，因为它会截断下拉菜单 */
  position: relative; /* 为页码定位 */
}

/* 非分页模式：解除高度限制，允许内容自然生长 */
.a4-container.no-pagination {
  min-height: auto;
  height: auto;
  /* 增加底部 padding，替代页码的位置 */
  padding-bottom: 20mm;
}

/* 非分页模式下隐藏页码 */
.a4-container.no-pagination .page-footer {
  display: none;
}

.page-footer {
  position: absolute;
  bottom: 10mm;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 12px;
  color: #666;
}

/* 统一的表格样式（打印和屏幕完全共用） */
.result-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* 关键：强制列宽由 colgroup 控制 */
}

/* 防止表格行在打印时被切断 */
.result-table tr {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* 拼音行：高度较小 */
.pinyin-row {
    /* 移除 flex 布局，回归 table-row */
}

/* 汉字行：高度较大 */
.chinese-row {
    /* 移除 flex 布局，回归 table-row */
}

.result-table td {
  /* width: 14.16mm;  移除固定宽度，让 colgroup 控制 */
  border: 1px solid #999;
  box-sizing: border-box;
  text-align: center;
}

/* 无边框模式：只隐藏线条，不改变尺寸 */
.result-table.no-border td {
  border: 1px solid transparent !important;
}

/* 汉字格：严格正方形 */
.chinese-cell,
.punctuation-cell {
  /* 使用 aspect-ratio 确保始终是正方形 */
  aspect-ratio: 1 / 1;
  height: auto;
  
  /* 恢复 table-cell 默认显示，利用 vertical-align 居中 */
  /* display: flex; 移除 flex，因为它会破坏 table-cell 的宽度计算 */
  vertical-align: middle;
  
  font-size: 10mm; 
  padding: 0;
  overflow: hidden;
  font-family: "Kaiti SC", "STKaiti", "AR PL UKai CN", "KaiTi", "KaiTi_GB2312", "SimSun", "Songti SC", serif !important;
  color: #000 !important;
}

/* 拼音格 */
  .pinyin-cell {
    height: 8mm;
    font-size: 3.5mm;
    border-bottom: none; 
    
    /* 恢复 table-cell 默认显示 */
    /* display: flex; 移除 flex */
    vertical-align: bottom; /* 底部对齐 */
    
    font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
    color: #000 !important;
    position: relative; /* 为下拉菜单定位 */
    
    /* 允许子元素溢出显示 (下拉菜单) */
    overflow: visible !important;
    
    /* 确保 z-index 上下文，防止被相邻格子遮挡 */
    z-index: 1;
  }
  
  /* 当处于编辑状态时，提升层级，确保弹出层在最上面 */
  .pinyin-cell:has(.edit-container) {
    z-index: 100;
  }

  /* 弹窗样式 */
  .pinyin-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 99999;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .pinyin-modal {
    background: white;
    border-radius: 8px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.2);
    width: 320px;
    max-width: 90vw;
    animation: modal-fade-in 0.2s ease-out;
  }
  
  @keyframes modal-fade-in {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  .pinyin-modal-header {
    padding: 16px;
    font-size: 18px;
    font-weight: bold;
    border-bottom: 1px solid #eee;
    color: #333;
  }

  .pinyin-modal-body {
    padding: 20px;
  }

  .modal-options {
    margin-bottom: 20px;
  }

  .modal-label {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }

  .option-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .option-buttons button {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #f8f9fa;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s;
  }

  .option-buttons button:hover {
    background: #e3f2fd;
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  .option-buttons button.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }

  .modal-input-group input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    box-sizing: border-box;
    outline: none;
  }

  .modal-input-group input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
  }

  .pinyin-modal-footer {
    padding: 12px 16px;
    background: #f8f9fa;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  .btn-cancel {
    padding: 8px 16px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    color: #666;
  }

  .btn-confirm {
    padding: 8px 16px;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .btn-cancel:hover { background: #f5f5f5; }
  .btn-confirm:hover { background: #1565c0; }

  .polyphone-cell {
    background-color: rgba(255, 243, 224, 0.5); /* 淡淡的橙色背景提示多音字 */
    cursor: pointer; /* 提示可点击 */
  }

  .polyphone-mark {
    position: absolute;
    top: 1px;
    right: 1px;
    width: 4px;
    height: 4px;
    background-color: #ff9800;
    border-radius: 50%;
  }

  .edit-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .pinyin-input {
    width: 100%;
    text-align: center;
    border: 1px solid var(--primary-color);
    border-radius: 2px;
    outline: none;
    font-size: inherit;
    font-family: inherit;
    background: white;
    z-index: 10;
  }

  .pinyin-options {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    border: 1px solid #ddd;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    border-radius: 4px;
    z-index: 9999; /* 确保层级足够高 */
    min-width: 80px;
    max-height: 150px;
    overflow-y: auto;
    display: block;
    
    /* 解决部分浏览器 z-index 失效问题 */
    isolation: isolate;
  }

  /* 增加一个全局的 overlay 确保下拉菜单能显示 */
  .edit-container {
    /* overflow: visible !important; 已在 cell 层级设置，这里保持默认 */
  }

  .pinyin-option {
    padding: 4px 8px;
    cursor: pointer;
    text-align: center;
    font-size: 14px;
    color: #333;
  }

  .pinyin-option:hover {
    background-color: #f0f7ff;
    color: var(--primary-color);
  }

  /* 打印特有修正 */
  @media print {
    /* 隐藏所有多音字标记 */
    .polyphone-mark {
        display: none !important;
    }
    .polyphone-cell {
        background-color: transparent !important;
    }
    /* 隐藏弹窗 */
    .pinyin-modal-overlay {
        display: none !important;
    }
    @page {
      size: A4;
      margin: 0; /* 浏览器打印边距清零，由 .a4-container padding 控制 */
    }

    body {
      background: white;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* 确保文字在打印时绝对可见 */
    .chinese-cell, .punctuation-cell, .pinyin-cell {
       color: #000 !important;
       opacity: 1 !important;
       visibility: visible !important;
    }

    .preview-section {
      transform: none !important; /* 打印时不缩放 */
      margin: 0;
    }

    .a4-container {
      box-shadow: none;
      margin: 0;
      width: 210mm;
      min-height: 297mm;
      page-break-after: always; /* 强制分页 */
    }
    
    /* 最后一页不强制分页，避免多出一张白纸 */
    .preview-section:last-child .a4-container {
      page-break-after: auto;
    }
    
    /* 打印时隐藏不需要的页码（浏览器自带页眉页脚可能冲突），或者保留自定义页码 */
    /* 这里我们保留自定义页码 */
    .page-footer {
        color: #000 !important;
    }
  }

</style>