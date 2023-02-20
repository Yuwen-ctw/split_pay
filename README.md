# Redux 練習

參考 <a href="https://app.lightsplit.com/" target="_blank"> Lightsplit </a> 網站

<img width="1604" alt="screen" src="./public/screen.apng">

- 使用 Redux Toolkit 套件進行狀態管理
- 使用 TypeScript

* costSlice:

  1. 以 createEntityAdapter 將資料正規化
  2. 以 createAsyncThunk 執行非同步操作並回傳 payload
  3. 以 extraReducer 實現 pending、fulfilled 及 rejected 狀態渲染，及其他資料的 CRUD 功能
     <br/>
     <br/>

* distributedPriceSlice (此 slice 用於管理"自訂分配表單"狀態):
  1. createEntityAdapter 將資料正規化
  2. 在 createSlice.reducers 中，使用 "prepare" 替 actionCreator 接收的參數進行預處理，並轉為 payload 傳給 "reducer" 。

# 使用方法

須確認已安裝 node.js 與 npm

1.打開終端機，Clone 專案至本機

```
git clone https://github.com/Yuwen-ctw/parking_finder.git
```

2.進入專案資料夾

```
cd parking_finder
```

3.安裝 npm 套件

```
npm install
```

4.啟動提供測試資料的伺服器

```
npm run dev-server
```

5.啟動專案: 打開第二個終端機並進入本專案資料夾，輸入以下指令

```
npm run dev
```

成功後請參考終端機訊息並造訪指定網址，預設網址為 http://127.0.0.1:5173

<br/>
<br/>
