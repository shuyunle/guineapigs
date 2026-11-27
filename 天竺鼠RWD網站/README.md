# 天竺鼠新手飼主小幫手

> 天竺鼠新手飼主的口袋小幫手。在寵物店、餵食前、發現不對勁時，拿出手機馬上查。

國立陽明交通大學教育研究所「行動學習」課程作品。這是一個響應式（RWD）行動學習網站，幫助天竺鼠新手飼主學會照顧天竺鼠的基本知識，手機和電腦都能用。

---

## 功能特色

| 頁面 | 內容 |
|---|---|
| 🏠 **首頁** | 草地背景與天竺鼠照片，點一下天竺鼠牠會彈跳、換台詞，還會噴出小顆大便 |
| 🔊 **聽懂叫聲** | 8 種叫聲卡片，先猜再翻開看「代表什麼、你可以怎麼做」，附介紹影片 |
| 🥬 **能不能吃** | 維生素 C 與每日飲食原則，加上 8 張食物翻牌卡（可以／少量／避免） |
| 🩺 **健康警訊** | 8 項警訊勾選清單，勾選後提醒是否該看獸醫 |
| 📍 **找醫院** | 一鍵用 Google 地圖搜尋附近能看特殊寵物的動物醫院 |
| 🏆 **闖關測驗** | 5 題選擇題，即時對錯回饋、進度條與最後分數 |
| ✉️ **聯絡我們** | 電話、地址、服務時間（自動顯示現在是否為服務時間）、複製地址、開啟導航 |

### 小彩蛋
- **導覽列**：不同毛色的小天竺鼠會長草、跑來吃草，再在導覽列上亂跑
- **大便雨**：首頁「從這裡開始」和「聽懂叫聲」的背景會下模糊的天竺鼠大便雨
- **散步的天竺鼠**：聯絡卡片上緣和頁尾的牧草上，有小天竺鼠慢慢散步
- **回到最上面**：往下捲超過 300px，左下角會出現按鈕

### 使用體驗
- **獨立頁面切換**：用網址 `#/sounds`、`#/food`… 切換頁面，不用重新載入，也可以用瀏覽器的上一頁／下一頁
- **響應式設計**：螢幕寬度 720px 以下自動改成手機版排版
- **淺色／深色模式**：跟著系統設定自動切換
- **無障礙**：鍵盤可操作；系統開啟「減少動態效果」時，所有動畫會自動關閉

---

## 檔案結構

```
天竺鼠RWD網站/
├── index.html          # 網頁內容（所有頁面都在這一個檔案）
├── style.css           # 樣式（檔案開頭有目錄）
├── script.js           # 互動功能與資料（檔案開頭有目錄）
├── images/
│   ├── grass-bg.png    # 首頁草地背景
│   └── guinea-pig.webp # 首頁天竺鼠照片（去背）
└── README.md
```

不需要安裝任何套件，也沒有建置步驟，純 HTML、CSS、JavaScript。

---

## 如何使用

### 在自己的電腦上看
直接用瀏覽器打開 `index.html` 就可以了。

### 發布成網站（GitHub Pages）
1. 把整個資料夾上傳到 GitHub 儲存庫（記得包含 `images` 資料夾）
2. 到儲存庫的 **Settings → Pages**
3. **Source** 選 `Deploy from a branch`，Branch 選 `main`、資料夾選 `/ (root)`，按 **Save**
4. 等一兩分鐘，網址會顯示在同一頁上方，例如 `https://你的帳號.github.io/儲存庫名稱/`

---

## 如何修改內容

大部分文字資料都集中在 `script.js` 的「**2. 內容資料**」區段，照著原本的格式多加一筆就好：

| 想改的內容 | 在 `script.js` 找 |
|---|---|
| 叫聲卡片 | `SOUNDS` |
| 食物翻牌卡 | `FOODS`（`level` 填 `ok`、`few` 或 `no`） |
| 健康警訊清單 | `WARNING_SIGNS` |
| 測驗題目 | `QUESTIONS`（`answer` 是正確選項的編號，從 0 開始） |
| 小天竺鼠毛色 | `COATS` |

其他可以調整的設定：

| 設定 | 位置 | 說明 |
|---|---|---|
| `POOP_SIZE` | `script.js` 第 7 區 | 點天竺鼠噴出的大便大小 |
| `MAX_PIGS` | `script.js` 第 9 區 | 導覽列上同時最多幾隻小天竺鼠 |
| `data-drops` | `index.html` 的 `.poop-rain` | 大便雨的顆數 |
| `blur(5px)` | `style.css` 的 `.hero::before` | 首頁草地背景的模糊程度 |
| 色彩變數 | `style.css` 第 1 區 `:root` | 整個網站的配色 |

想在其他區塊也加上大便雨：在該 `<section>` 的 class 加上 `rain-band`，並在裡面放：

```html
<div class="poop-rain" data-drops="50" aria-hidden="true"></div>
```

---

## 使用技術

- HTML5、CSS3（CSS 變數、Grid、`light-dark()`、`color-mix()`、`backdrop-filter`）
- 原生 JavaScript（Web Animations API、IntersectionObserver、Clipboard API）
- 字型：[Noto Sans TC](https://fonts.google.com/noto/specimen/Noto+Sans+TC)（Google Fonts）
- 嵌入：YouTube 影片、Google 地圖

建議使用最新版的 Chrome、Edge、Safari 或 Firefox 瀏覽。

---

## 資料來源

網站內容整理自以下獸醫與官方資料：

- MSD 獸醫手冊：[Diet for a Guinea Pig](https://www.merckvetmanual.com/all-other-pets/guinea-pigs/diet-for-a-guinea-pig)
- MSD 獸醫手冊：[Nutritional Problems of Guinea Pigs](https://www.merckvetmanual.com/all-other-pets/guinea-pigs/nutritional-problems-of-guinea-pigs)
- UC Davis 獸醫學院：[Guinea Pig Care](https://healthtopics.vetmed.ucdavis.edu/node/1126)
- PetMD：[Sounds of Guinea Pigs](https://petmd.com/exotic/sounds-guinea-pigs)
- WebMD Pets：[Why Do Guinea Pigs Chatter Their Teeth](https://www.webmd.com/pets/why-do-guinea-pigs-chatter-their-teeth)
- 農業部：[哺乳類寵物飼養與照顧指南（PDF）](https://animal.moa.gov.tw/public/upload/Know_ArticleFile/251224011700058845FQRR5.pdf)

> ⚠️ 本網站為學習用途，內容無法取代獸醫診斷。天竺鼠身體不舒服時，請盡快就醫。

---

## 作者

國立陽明交通大學教育研究所　行動學習課程作品
