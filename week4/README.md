# Node.js + TypeORM 訓練

## 功能

- 使用 Node.js 原生 HTTP 模組建立 API 伺服器
- 使用 TypeORM 操作 PostgreSQL 資料庫
- 支援 API CRUD 操作

## 開發指令

- `npm run dev` - 啟動開發伺服器
- `npm run start` - 啟動伺服器與資料庫
- `npm run restart` - 重新啟動伺服器與資料庫
- `npm run stop` - 關閉啟動伺服器與資料庫
- `npm run clean` - 關閉伺服器與資料庫並清除所有資料

## 環境安裝、NPM 指令

- 先 fork repo 後，再 clone 下來
- npm install：安裝套件
- 檢視 .env 設定，調整為 localhost
- npm run start： 運作 Docker，將資料庫環境在本地端運作
- npm run dev：開啟 Node 應用程式
- 使用 DBeaver 觀看資料庫狀態
  - Host：localhost
  - Database：test
  - DB_USERNAME：testHexschool
  - DB_PASSWORD：pgStartkit4test
