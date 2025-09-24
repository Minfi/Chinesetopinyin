// 获取DOM元素
const chineseText = document.getElementById('chineseText');
const convertBtn = document.getElementById('convertBtn');
const printBtn = document.getElementById('printBtn');
const resultTable = document.getElementById('resultTable');
const fontSizeControl = document.getElementById('fontSize');
const spacingControl = document.getElementById('spacing');
const fontSizeDisplay = document.getElementById('fontSizeDisplay');
const spacingDisplay = document.getElementById('spacingDisplay');

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

// 转换为拼音
convertBtn.addEventListener('click', () => {
    const text = chineseText.value;
    if (!text) {
        alert('请输入汉字！');
        return;
    }
    const pinyinArray = convertToPinyin(text);
    displayResult(text, pinyinArray);
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

    let charCount = 0;
    const maxCharsPerLine = 30;
    let currentPinyinRow = null;
    let currentChineseRow = null;

    for (let i = 0; i < chineseText.length; i++) {
        const char = chineseText[i];

        // 处理换行符
        if (char === '\n') {
            if (currentPinyinRow && currentPinyinRow.children.length > 0) {
                resultTable.appendChild(currentPinyinRow);
                resultTable.appendChild(currentChineseRow);
            }
            charCount = 0;
            currentPinyinRow = document.createElement('tr');
            currentChineseRow = document.createElement('tr');
            resultTable.appendChild(currentPinyinRow);
            resultTable.appendChild(currentChineseRow);
            currentPinyinRow = null;
            currentChineseRow = null;
            continue;
        }

        // 自动换行处理
        if (charCount >= maxCharsPerLine) {
            if (currentPinyinRow && currentPinyinRow.children.length > 0) {
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
        cell.style.fontSize = `${fontSize * 0.8}px`;
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

