// 全域變數
let pyodide = null;
let editor = null;
let isRunning = false;
const loadingIndicator = document.getElementById('loadingIndicator');
const outputArea = document.getElementById('outputArea');
const runButton = document.getElementById('runButton');
const resetButton = document.getElementById('resetButton');
const clearOutputButton = document.getElementById('clearOutputButton');
const statusIndicator = document.getElementById('statusIndicator');
const exampleSelector = document.getElementById('exampleSelector');
//3373
// 程式碼範例
//););!
const codeExamples = {
    default: `print("Hello, Python!")

# 嘗試一些簡單的計算
result = 0
for i in range(1, 11):
    result += i

print(f"1 到 10 的總和是: {result}")`,

    loops: `# 各種Python迴圈示例

# 基本for迴圈
print("基本for迴圈:")
for i in range(5):
    print(f"索引: {i}")

# while迴圈
print("\\nwhile迴圈:")
count = 0
while count < 5:
    print(f"計數: {count}")
    count += 1

# 巢狀迴圈
print("\\n巢狀迴圈:")
for i in range(3):
    for j in range(3):
        print(f"座標: ({i}, {j})")

# 使用enumerate
print("\\n使用enumerate:")
fruits = ["蘋果", "香蕉", "橘子"]
for index, fruit in enumerate(fruits):
    print(f"{index}: {fruit}")

# 使用break和continue
print("\\nbreak和continue:")
for i in range(10):
    if i == 3:
        continue  # 跳過3
    if i == 7:
        break     # 到7時停止
    print(f"數字: {i}")`,

    functions: `# Python函數示例

# 基本函數
def say_hello(name):
    return f"Hello, {name}!"

# 呼叫函數
result = say_hello("Python使用者")
print(result)

# 預設參數
def greeting(name, message="歡迎來到Python世界"):
    return f"{message}, {name}!"

print(greeting("小明"))
print(greeting("小華", "你好"))

# 可變參數
def sum_numbers(*args):
    return sum(args)

print(f"1 + 2 + 3 = {sum_numbers(1, 2, 3)}")
print(f"5 + 10 + 15 + 20 = {sum_numbers(5, 10, 15, 20)}")

# 遞迴函數 - 計算階乘
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(f"5! = {factorial(5)}")

# Lambda函數
double = lambda x: x * 2
print(f"10的兩倍是: {double(10)}")`,

    lists: `# Python列表處理

# 創建列表
numbers = [1, 2, 3, 4, 5]
print(f"原始列表: {numbers}")

# 列表切片
print(f"前三個元素: {numbers[:3]}")
print(f"後兩個元素: {numbers[-2:]}")

# 列表推導式
squares = [x**2 for x in numbers]
print(f"平方後: {squares}")

even_numbers = [x for x in range(10) if x % 2 == 0]
print(f"0到9中的偶數: {even_numbers}")

# 列表操作
numbers.append(6)
print(f"添加6後: {numbers}")

numbers.insert(0, 0)
print(f"在開頭添加0後: {numbers}")

numbers.remove(3)
print(f"移除3後: {numbers}")

# 排序
random_numbers = [5, 2, 8, 1, 9]
print(f"排序前: {random_numbers}")

random_numbers.sort()
print(f"升序排序後: {random_numbers}")

random_numbers.sort(reverse=True)
print(f"降序排序後: {random_numbers}")

# 二維列表
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
print("\\n矩陣:")
for row in matrix:
    print(row)`,

    turtle: `# Turtle繪圖
# 注意: 這是Pyodide的特殊實現，可能與標準Python有所不同

import turtle
from turtle import *

# 清除畫布並設置速度
reset()
speed(0)  # 最快速度

# 繪製彩色螺旋
colors = ['red', 'purple', 'blue', 'green', 'yellow', 'orange']
for i in range(360):
    pencolor(colors[i % 6])
    width(i / 100 + 1)
    forward(i / 4)
    left(59)

# 回到原點
penup()
goto(0, 0)
pendown()

print("繪圖完成!")
print("提示: 右側輸出區域應該顯示了一個彩色螺旋圖案。")
print("Turtle模式下可能會看到繪圖產生的輸出訊息。")`
};

// 初始化 CodeMirror 編輯器
function initEditor() {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dracula' : 'eclipse';
    editor = CodeMirror.fromTextArea(document.getElementById('pythonCode'), {
        mode: 'python',
        theme: theme,
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false,
        extraKeys: {"Tab": function(cm) {
            if (cm.somethingSelected()) {
                cm.indentSelection("add");
            } else {
                cm.replaceSelection("    ", "end", "+input");
            }
        }},
    });
    
    // 監聽主題變化以更新編輯器主題
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.attributeName === 'data-theme') {
                const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dracula' : 'eclipse';
                editor.setOption('theme', newTheme);
            }
        });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    // 載入範例程式碼選擇器事件
    exampleSelector.addEventListener('change', loadCodeExample);
}

// 載入程式碼範例
function loadCodeExample() {
    const example = exampleSelector.value;
    if (codeExamples[example]) {
        editor.setValue(codeExamples[example]);
        // 如果是turtle範例，需要預先載入turtle模組
        if (example === 'turtle' && pyodide) {
            prepareForTurtle();
        }
    }
}

// 準備Turtle繪圖環境
async function prepareForTurtle() {
    try {
        updateStatus('running', '準備Turtle環境...');
        await pyodide.loadPackagesFromImports('import turtle');
        updateStatus('idle', '準備就緒');
    } catch (error) {
        updateStatus('error', '載入Turtle失敗');
        outputArea.textContent = `Error: ${error.message}`;
    }
}

// 初始化 Pyodide
async function initPyodide() {
    try {
        // 加載 Pyodide
        pyodide = await loadPyodide();
        
        // 創建stdout和stderr的捕獲器
        pyodide.runPython(`
            import sys
            from io import StringIO

            class PyodideOutput:
                def __init__(self, output_type):
                    self.output_type = output_type
                    self.buffer = StringIO()
                
                def write(self, text):
                    self.buffer.write(text)
                    return len(text)
                
                def flush(self):
                    pass
                
                def getvalue(self):
                    return self.buffer.getvalue()

            sys.stdout = PyodideOutput('stdout')
            sys.stderr = PyodideOutput('stderr')
        `);

        // 初始化完成後隱藏加載指示器
        loadingIndicator.style.opacity = '0';
        setTimeout(() => {
            loadingIndicator.style.display = 'none';
        }, 500);
        
        // 更新狀態
        updateStatus('idle', '準備就緒');
    } catch (error) {
        console.error('Pyodide 加載失敗:', error);
        outputArea.textContent = `錯誤: Python環境加載失敗。請檢查您的網絡連接或稍後再試。`;
        loadingIndicator.style.display = 'none';
    }
}

// 執行 Python 程式碼
async function runPythonCode() {
    if (isRunning || !pyodide) return;
    
    isRunning = true;
    updateStatus('running', '執行中...');
    
    const code = editor.getValue();
    outputArea.textContent = '執行中...';
    
    try {
        // 重置輸出流
        pyodide.runPython(`
            sys.stdout.buffer = StringIO()
            sys.stderr.buffer = StringIO()
        `);
        
        // 執行使用者代碼
        await pyodide.runPythonAsync(code);
        
        // 獲取輸出
        const stdout = pyodide.runPython('sys.stdout.getvalue()');
        const stderr = pyodide.runPython('sys.stderr.getvalue()');
        
        // 顯示輸出
        let output = '';
        if (stdout) {
            output += `<span class="output-stdout">${escapeHtml(stdout)}</span>`;
        }
        if (stderr) {
            output += `<span class="output-stderr">${escapeHtml(stderr)}</span>`;
        }
        
        outputArea.innerHTML = output || '執行完成，沒有輸出結果';
        updateStatus('success', '執行成功');
    } catch (error) {
        // 處理執行錯誤
        outputArea.innerHTML = `<span class="output-stderr">錯誤: ${escapeHtml(error.message)}</span>`;
        updateStatus('error', '執行失敗');
        console.error(error);
    } finally {
        isRunning = false;
    }
}

// HTML特殊字元轉義
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 重置程式碼到默認例子
function resetCode() {
    exampleSelector.value = 'default';
    loadCodeExample();
    updateStatus('idle', '程式碼已重置');
}

// 清除輸出區域
function clearOutput() {
    outputArea.textContent = '輸出已清除';
    updateStatus('idle', '輸出已清除');
}

// 更新執行狀態
function updateStatus(status, message) {
    statusIndicator.className = `status-${status}`;
    statusIndicator.textContent = message;
}

// 本地存儲程式碼 - 保存代碼到localStorage
function saveCodeToLocalStorage() {
    if (editor) {
        const code = editor.getValue();
        localStorage.setItem('python-code', code);
        localStorage.setItem('python-example', exampleSelector.value);
    }
}

// 從localStorage載入代碼
function loadCodeFromLocalStorage() {
    const savedCode = localStorage.getItem('python-code');
    const savedExample = localStorage.getItem('python-example');
    
    if (savedExample) {
        exampleSelector.value = savedExample;
    }
    
    if (savedCode && editor) {
        editor.setValue(savedCode);
    } else {
        loadCodeExample();
    }
}

// 頁面載入時初始化
window.addEventListener('load', async () => {
    // 初始化編輯器
    initEditor();
    
    // 加載Pyodide
    await initPyodide();
    
    // 從本地存儲加載代碼
    loadCodeFromLocalStorage();
    
    // 設置事件監聽器
    runButton.addEventListener('click', runPythonCode);
    resetButton.addEventListener('click', resetCode);
    clearOutputButton.addEventListener('click', clearOutput);
    
    // 添加定期保存功能
    setInterval(saveCodeToLocalStorage, 10000); // 每10秒保存一次
    
    // 頁面關閉前保存
    window.addEventListener('beforeunload', saveCodeToLocalStorage);
});

// 為移動設備適配鍵盤彈出時的布局調整
if (navigator.userAgent.match(/Android|iPhone|iPad|iPod|Mobile/i)) {
    const editorContainer = document.querySelector('.editor-container');
    const outputContainer = document.querySelector('.output-container');
    
    if (editorContainer && outputContainer) {
        // 監聽視窗大小變化以調整布局
        window.addEventListener('resize', () => {
            const viewportHeight = window.innerHeight;
            const headerHeight = document.querySelector('header').offsetHeight;
            const editorControlsHeight = document.querySelector('.editor-controls').offsetHeight;
            const availableHeight = viewportHeight - headerHeight - editorControlsHeight - 80;
            
            // 分配空間
            editorContainer.style.height = `${availableHeight * 0.6}px`;
            outputContainer.style.maxHeight = `${availableHeight * 0.4}px`;
        });
        
        // 初始調整
        setTimeout(() => {
            const event = new Event('resize');
            window.dispatchEvent(event);
        }, 500);
    }
}
