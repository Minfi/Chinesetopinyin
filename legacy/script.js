// 获取DOM元素
const chineseText = document.getElementById('chineseText');
const convertBtn = document.getElementById('convertBtn');
const printBtn = document.getElementById('printBtn');
const exampleBtn = document.getElementById('exampleBtn');
const clearBtn = document.getElementById('clearBtn');
const resultTable = document.getElementById('resultTable');
const fontSizeControl = document.getElementById('fontSize');
const spacingControl = document.getElementById('spacing');
const fontSizeDisplay = document.getElementById('fontSizeDisplay');
const spacingDisplay = document.getElementById('spacingDisplay');
const borderToggle = document.getElementById('borderToggle');
const textAlignRadios = document.getElementsByName('textAlign');
let currentAlignment = 'center'; // 默认为居中对齐

// 古诗示例
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

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// 自动转换逻辑
const autoConvert = debounce(() => {
    const text = chineseText.value;
    if (text) {
        const pinyinArray = convertToPinyin(text);
        displayResult(text, pinyinArray);
    } else {
        resultTable.innerHTML = '';
    }
}, 500); // 500ms 延迟

// 监听输入框变化，实现实时预览
chineseText.addEventListener('input', autoConvert);

// 更新字体大小显示
fontSizeControl.addEventListener('input', () => {
    fontSizeDisplay.textContent = `${fontSizeControl.value}px`;
    updateResultFontSize();
});

// 更新行间距显示
spacingControl.addEventListener('input', () => {
    spacingDisplay.textContent = spacingControl.value;
    updateSpacing();
});

// 边框显示切换
borderToggle.addEventListener('change', () => {
    if (borderToggle.checked) {
        resultTable.classList.remove('no-border');
    } else {
        resultTable.classList.add('no-border');
    }
});

// 对齐方式切换
textAlignRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentAlignment = e.target.value;
        // 重新渲染以应用新的对齐方式
        const text = chineseText.value;
        if (text) {
            const pinyinArray = convertToPinyin(text);
            displayResult(text, pinyinArray);
        }
    });
});

// 转换为拼音 (手动点击)
convertBtn.addEventListener('click', () => {
    const text = chineseText.value;
    if (!text) {
        alert('请输入汉字！');
        return;
    }
    const pinyinArray = convertToPinyin(text);
    displayResult(text, pinyinArray);
});

// 一键填入示例
exampleBtn.addEventListener('click', () => {
    chineseText.value = EXAMPLE_TEXT;
    const pinyinArray = convertToPinyin(EXAMPLE_TEXT);
    displayResult(EXAMPLE_TEXT, pinyinArray);
});

// 清空
clearBtn.addEventListener('click', () => {
    chineseText.value = '';
    resultTable.innerHTML = '';
    chineseText.focus();
});

// 打印/导出PDF
printBtn.addEventListener('click', () => {
    window.print();
});

// 汉字转拼音（使用 pinyin-pro 库）
function convertToPinyin(text) {
    return pinyinPro.pinyin(text, {
        toneType: 'symbol', // 带声调
        type: 'array',     // 返回数组
    });
}

// 显示结果
function displayResult(chineseText, pinyinArray) {
    resultTable.innerHTML = '';
    
    // 创建 colgroup 以强制控制列宽
    const colGroup = document.createElement('colgroup');
    const cols = 12; // 每行字符数调整为 12，使格子更大更美观
    for(let i=0; i<cols; i++) {
        const col = document.createElement('col');
        colGroup.appendChild(col);
    }
    resultTable.appendChild(colGroup);

    let charCount = 0;
    const maxCharsPerLine = cols;
    let currentPinyinRow = null;
    let currentChineseRow = null;

    // 填充行末空格子，确保网格整齐
    const fillRemainingCells = (pRow, cRow, currentCount) => {
        const remaining = maxCharsPerLine - currentCount;
        if (remaining > 0) {
            // 根据对齐方式决定填充逻辑
            if (currentAlignment === 'center') {
                // 居中对齐：两边填充
                const leftPadding = Math.floor(remaining / 2);
                const rightPadding = remaining - leftPadding;

                // 插入左侧填充
                for (let k = 0; k < leftPadding; k++) {
                    const pCell = createEmptyCell('pinyin-cell empty-pinyin');
                    const cCell = createEmptyCell('chinese-cell');
                    pRow.insertBefore(pCell, pRow.firstChild);
                    cRow.insertBefore(cCell, cRow.firstChild);
                }
                
                // 插入右侧填充
                for (let k = 0; k < rightPadding; k++) {
                    const pCell = createEmptyCell('pinyin-cell empty-pinyin');
                    const cCell = createEmptyCell('chinese-cell');
                    pRow.appendChild(pCell);
                    cRow.appendChild(cCell);
                }
            } else {
                // 左对齐（默认）：只在右侧填充
                for (let k = 0; k < remaining; k++) {
                    const pCell = createEmptyCell('pinyin-cell empty-pinyin');
                    const cCell = createEmptyCell('chinese-cell');
                    pRow.appendChild(pCell);
                    cRow.appendChild(cCell);
                }
            }
        }
    };
    
    // 辅助函数：创建空单元格
    function createEmptyCell(className) {
        const cell = document.createElement('td');
        cell.className = className;
        cell.innerHTML = '&nbsp;';
        return cell;
    }

    for (let i = 0; i < chineseText.length; i++) {
        const char = chineseText[i];

        // 处理换行符
        if (char === '\n') {
            if (currentPinyinRow && currentPinyinRow.children.length > 0) {
                fillRemainingCells(currentPinyinRow, currentChineseRow, charCount); // 补齐当前行
                resultTable.appendChild(currentPinyinRow);
                resultTable.appendChild(currentChineseRow);
                currentPinyinRow = null;
                currentChineseRow = null;
                charCount = 0;
            } else {
                // 如果当前行是空的（即遇到连续换行，或刚开始就换行），则创建一个完整的空白行
                const pRow = document.createElement('tr');
                const cRow = document.createElement('tr');
                fillRemainingCells(pRow, cRow, 0); // 填充整行空白格
                resultTable.appendChild(pRow);
                resultTable.appendChild(cRow);
                currentPinyinRow = null;
                currentChineseRow = null;
                charCount = 0;
            }
            continue;
        }

        // 自动换行处理
        if (charCount >= maxCharsPerLine) {
            if (currentPinyinRow && currentPinyinRow.children.length > 0) {
                // 此时行已满，无需补齐
                resultTable.appendChild(currentPinyinRow);
                resultTable.appendChild(currentChineseRow);
            }
            charCount = 0;
            currentPinyinRow = null;
            currentChineseRow = null;
        }

        // 创建新行
        if (!currentPinyinRow) {
            currentPinyinRow = document.createElement('tr');
            currentChineseRow = document.createElement('tr');
        }

        // 检查是否为中文字符
        if (/[\u4e00-\u9fa5]/.test(char)) {
            const pinyin = pinyinArray[i] || '';

            // 创建拼音单元格
            const pinyinCell = document.createElement('td');
            pinyinCell.className = 'pinyin-cell';
            pinyinCell.textContent = pinyin;
            
            // --- 点击修改拼音逻辑 ---
            pinyinCell.title = '点击修改拼音';
            pinyinCell.addEventListener('click', function() {
                // 如果已经在编辑中，不处理
                if (this.querySelector('input')) return;

                const currentText = this.textContent;
                this.textContent = '';
                
                const input = document.createElement('input');
                input.type = 'text';
                input.value = currentText;
                // 简单样式，使其融入
                input.style.width = '60px';
                input.style.textAlign = 'center';
                input.style.border = '1px solid #2196F3';
                input.style.borderRadius = '2px';
                input.style.outline = 'none';
                input.style.fontSize = 'inherit';
                
                // 阻止点击冒泡，防止触发其他可能的事件
                input.addEventListener('click', (e) => e.stopPropagation());

                // 失焦或回车确认
                const confirmEdit = () => {
                    this.textContent = input.value;
                };

                input.addEventListener('blur', confirmEdit);
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        input.blur();
                    }
                });

                this.appendChild(input);
                input.focus();
            });
            // -----------------------

            currentPinyinRow.appendChild(pinyinCell);

            // 创建汉字单元格
            const chineseCell = document.createElement('td');
            chineseCell.className = 'chinese-cell';
            chineseCell.textContent = char;
            currentChineseRow.appendChild(chineseCell);
        } else {
            // 非中文字符（标点符号、空格等），不创建拼音单元格
            const punctuationCell = document.createElement('td');
            punctuationCell.className = 'punctuation-cell';
            punctuationCell.textContent = char;
            currentChineseRow.appendChild(punctuationCell);

            // 为保持对齐，添加一个空的拼音单元格
            const emptyPinyinCell = document.createElement('td');
            emptyPinyinCell.className = 'pinyin-cell empty-pinyin';
            currentPinyinRow.appendChild(emptyPinyinCell);
        }

        charCount++;
    }

    // 添加最后一行
    if (currentPinyinRow && currentPinyinRow.children.length > 0) {
        fillRemainingCells(currentPinyinRow, currentChineseRow, charCount); // 补齐最后一行
        resultTable.appendChild(currentPinyinRow);
        resultTable.appendChild(currentChineseRow);
    }

    updateResultFontSize();
    updateSpacing();
}

// 更新字体大小
function updateResultFontSize() {
    const fontSize = fontSizeControl.value;
    document.querySelectorAll('.pinyin-cell').forEach(cell => {
        // 如果正在编辑（包含 input），不改变样式，或者需要处理 input 的字体
        if (!cell.querySelector('input')) {
             cell.style.fontSize = `${fontSize * 0.8}px`;
        }
    });
    document.querySelectorAll('.chinese-cell').forEach(cell => {
        cell.style.fontSize = `${fontSize}px`;
    });

}

// 更新行间距
function updateSpacing() {
    const spacing = spacingControl.value;
    document.querySelectorAll('.result-table tr').forEach(row => {
        row.style.lineHeight = `${spacing}em`;
    });
}