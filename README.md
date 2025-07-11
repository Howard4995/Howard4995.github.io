# Python線上執行器與聊天功能 (放棄失敗)

一個結合Python線上執行與即時聊天功能的Web應用。

## 功能特點

- **Python線上執行器**：基於Pyodide，在瀏覽器中執行Python代碼
- **即時聊天功能**：使用Socket.io實現的即時聊天室
- **代碼範例**：內置多種Python代碼範例
- **響應式設計**：適合在電腦、平板和手機上使用
- **深色/淺色模式**：支持系統主題切換

## 技術棧

- 前端：HTML, CSS, JavaScript, Pyodide
- 後端：Node.js, Express, Socket.io
- 編輯器：CodeMirror
- 容器化：Docker

## 本地開發

### 前提條件

- Node.js (v14+)
- npm 或 yarn

### 安裝與運行

1. 克隆項目：
```bash
git clone <repository-url>
cd python-runner-chat
```

2. 安裝依賴：
```bash
npm install
```

3. 啟動開發服務器：
```bash
npm run dev
```

4. 打開瀏覽器訪問 `http://localhost:3000`

## 使用Docker運行

```bash
# 構建Docker映像
docker build -t python-runner-chat .

# 運行容器
docker run -p 3000:3000 python-runner-chat
```

或使用Docker Compose：

```bash
docker-compose up -d
```

## 部署到生產環境

1. 修改 `chat.js` 中的 `socketUrl` 變數為您的服務器地址
2. 在生產環境中，建議設置環境變數來配置各種參數
3. 確保在服務器上啟用HTTPS以保護WebSocket連接

### 使用Docker進行部署

```bash
# 確保您在項目根目錄中
docker-compose -f docker-compose.yml up -d
```

## 授權

MIT 
