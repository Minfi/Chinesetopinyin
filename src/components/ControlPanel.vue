<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue';

const props = defineProps({
  text: String,
  config: Object
});

const emit = defineEmits(['update:text', 'update:config', 'print']);

const localConfig = ref({ ...props.config });

watch(() => props.config, (newVal) => {
  localConfig.value = { ...newVal };
}, { deep: true });

watch(localConfig, (newVal) => {
  emit('update:config', newVal);
}, { deep: true });

const EXAMPLE_TEXT = `二年级下册课内古诗 
1. 咏柳 
唐 贺知章 
碧玉妆成一树高， 
万条垂下绿丝绦。 
不知细叶谁裁出， 
二月春风似剪刀。 

2. 村居 
清 高鼎 
草长莺飞二月天， 
拂堤杨柳醉春烟。 
儿童散学归来早， 
忙趁东风放纸鸢。`;

const setExample = () => {
  emit('update:text', EXAMPLE_TEXT);
};

const clearText = () => {
  emit('update:text', '');
};

const triggerPrint = () => {
  emit('print');
};
</script>

<template>
  <div class="controls no-print">
    <div class="input-section">
      <label for="chineseText">输入汉字内容：</label>
      <textarea 
        id="chineseText" 
        :value="text"
        @input="$emit('update:text', $event.target.value)"
        placeholder="在此输入需要注音的汉字、古诗或文章..."
      ></textarea>
      <div class="button-group">
        <button id="exampleBtn" @click="setExample">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          一键示例
        </button>
        <button id="clearBtn" @click="clearText">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          清空内容
        </button>
        <button id="printBtn" @click="triggerPrint">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          打印 / 导出PDF
        </button>
      </div>
    </div>

    <div class="config-section">
      <div class="slider-controls">
        <div class="control-item">
          <div class="control-header">
            <label for="fontSize">字体大小</label>
            <span id="fontSizeDisplay" style="color: var(--primary-color); font-weight: bold;">{{ localConfig.fontSize }}px</span>
          </div>
          <input 
            type="range" 
            id="fontSize" 
            min="12" 
            max="28" 
            v-model.number="localConfig.fontSize"
          >
        </div>
        
        <div class="control-item">
          <div class="control-header">
            <label for="spacing">行间距</label>
            <span id="spacingDisplay" style="color: var(--primary-color); font-weight: bold;">{{ localConfig.lineHeight }}</span>
          </div>
          <input 
            type="range" 
            id="spacing" 
            min="1" 
            max="3" 
            step="0.1" 
            v-model.number="localConfig.lineHeight"
          >
        </div>

        <div class="control-item">
          <div class="control-header">
            <label for="gridSize">每行格数</label>
            <span style="color: var(--primary-color); font-weight: bold;">{{ localConfig.gridSize }}</span>
          </div>
          <input 
            type="range" 
            id="gridSize" 
            min="8" 
            max="20" 
            step="1" 
            v-model.number="localConfig.gridSize"
          >
        </div>

        <div class="control-item">
            <div class="control-header">
                <label>对齐方式</label>
            </div>
            <div class="radio-group">
                <label class="radio-label">
                    <input 
                        type="radio" 
                        name="textAlign" 
                        value="center" 
                        v-model="localConfig.textAlign"
                    >
                    <span>居中</span>
                </label>
                <label class="radio-label">
                    <input 
                        type="radio" 
                        name="textAlign" 
                        value="left" 
                        v-model="localConfig.textAlign"
                    >
                    <span>左对齐</span>
                </label>
            </div>
        </div>
      </div>

      <div class="checkbox-wrapper">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            id="paginationToggle" 
            v-model="localConfig.showPagination"
          >
          <span>A4 分页预览</span>
        </label>
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            id="borderToggle" 
            v-model="localConfig.showBorder"
          >
          <span>显示田字格边框</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex: 1; /* 让输入框占据剩余空间 */
}

.config-section {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: var(--border-radius);
  border: 1px solid #e9ecef;
  flex-shrink: 0; /* 配置区域不压缩 */
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.9rem;
}

#chineseText {
  width: 100%;
  flex: 1; /* 输入框自动填充高度 */
  min-height: 200px;
  padding: 15px;
  font-size: 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  resize: none; /* 禁止手动调整，依靠 flex 自适应 */
  box-sizing: border-box;
  transition: all 0.3s ease;
  font-family: inherit;
}

#chineseText:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.button-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

button {
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* ... existing button styles ... */
#exampleBtn {
  background-color: #fff;
  color: var(--warning-color);
  border: 2px solid var(--warning-color);
}

#exampleBtn:hover {
  background-color: #fff8e1;
}

#clearBtn {
  background-color: #fff;
  color: var(--danger-color);
  border: 2px solid var(--danger-color);
}

#clearBtn:hover {
  background-color: #ffebee;
}

#printBtn {
  background-color: var(--success-color);
  color: white;
  grid-column: span 2;
}

#printBtn:hover {
  background-color: #27ae60;
}

.slider-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* ... existing styles ... */
.control-item {
  display: flex;
  flex-direction: column;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

input[type="range"] {
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.1s;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.radio-group {
    display: flex;
    gap: 15px;
    margin-top: 5px;
}

.radio-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 13px;
}

.radio-label input {
    margin-right: 6px;
    accent-color: var(--primary-color);
}

.checkbox-wrapper {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
}

.checkbox-label input {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  accent-color: var(--primary-color);
}

@media (max-width: 768px) {
  .controls {
    height: auto;
    overflow-y: visible;
    gap: 20px;
    padding: 15px;
  }
  
  #chineseText {
    min-height: 120px;
  }
  
  .config-section {
    padding: 15px;
  }
}
</style>