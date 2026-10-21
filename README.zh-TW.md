# cursor-trail/ · 游標方塊軌跡範例

[English](README.md) · [简体中文](README.zh-CN.md) · 繁體中文 · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md)

重現 **githubuniverse.com** 滑鼠移動時出現彩色方塊的互動：游標落到 20px 網格的新格子時，
重複使用池中的一個方塊，隨機品牌色 + 隨機 ASCII 字元，100–400ms 後縮回。

無需建置、無相依套件、無框架——三個靜態檔案加一個效果腳本。

![游標方塊軌跡預覽](preview.png)

## 執行

直接雙擊 `index.html` 即可；或在目前目錄啟動靜態伺服器：

```powershell
python -m http.server 8000
# 開啟 http://localhost:8000
```

> 效果依賴滑鼠事件，觸控裝置不會觸發。

## 檔案

| 檔案 | 用途 |
| --- | --- |
| `index.html` | 範例頁面：hero、參數面板、原理說明 |
| `styles.css` | 頁面樣式 + 方塊軌跡核心 CSS |
| `trail.js` | 效果實作，提供 `createCursorTrail()` |
| `demo.js` | 將參數面板接到 `trail.js` |

## 行為

- 只監聽 `.trailAnimationArea` 元素上的 `mousemove`；
- 命中 `.trailAnimationIgnore` 子樹、`<a>`、`<button>`、表單控制項或純文字葉節點時跳過；
- 游標位置依 `grid` 取整，同一格子不重複觸發；
- `pool` 個方塊循環重複使用，DOM 數量固定；
- 每次啟用隨機取一個顏色（6 種品牌色）和一個字元（11 種 ASCII，30% 機率為空白）；
- 啟用 `minLife`–`maxLife` 毫秒後移除 `is-active`，由 CSS 負責縮小消失；
- `prefers-reduced-motion: reduce` 時自動停用，偏好變更會即時生效。

## 與原站的對應關係

以下事實來自對線上產物的靜態分析（未執行原站）：

| 原站 | 本例 |
| --- | --- |
| `CursorTrailAnimation` 元件，`next/dynamic` 延遲載入 chunk `2834` + CSS `7583` | `trail.js` 中的 `createCursorTrail()` |
| 類別名稱 `trailAnimationArea` / `trailAnimationIgnore` | 同名 |
| 20px 網格，`Math.floor(clientX / 20) * 20` | 預設 `grid: 20`，可用控制項調整 |
| 10 個 fixed 定位方塊輪替 | 預設 `pool: 10` |
| 6 種品牌色 `#ae85ff #f73678 #c05200 #583af7 #5fed83 #bba00a` | 相同 |
| 11 種字元 `- / ) . + = > < * & (` | 相同 |
| 100–400ms 隨機存活時間 | `minLife: 100` / `maxLife: 400` |
| `.Color` 0.1s `scale(0) → scale(1)` | 相同曲線與時長 |
| 桌面端 `mousemove`，忽略文字/連結/按鈕 | 相同（連結與按鈕改用 `closest` 判斷） |

## 重複使用

引入 `trail.js` 和 `styles.css` 裡的 `.trail-layer` / `.trail-block` 規則，然後：

```html
<section class="trailAnimationArea">
  <h1 class="trailAnimationIgnore">標題不觸發</h1>
  <p>這片空白背景會出現方塊。</p>
</section>

<script src="trail.js"></script>
<script>
  const trail = createCursorTrail({ grid: 20, pool: 10 });
</script>
```

### `createCursorTrail(options)`

| 參數 | 預設值 | 說明 |
| --- | --- | --- |
| `grid` | `20` | 網格尺寸（px），同時決定方塊大小 |
| `pool` | `10` | 方塊池大小 |
| `minLife` / `maxLife` | `100` / `400` | 單一方塊存活時間範圍（ms） |
| `blankChance` | `0.3` | 方塊內不顯示字元的機率 |
| `colors` | 6 種品牌色 | 顏色池 |
| `glyphs` | 11 種 ASCII | 字元池 |
| `areaSelector` | `.trailAnimationArea` | 允許出現方塊的區域 |
| `ignoreSelector` | `.trailAnimationIgnore` | 排除的子樹 |
| `onChange` | `null` | 狀態回呼，收到 `{ spawned, active, reduced, paused }` |

回傳控制器：

| 方法 | 說明 |
| --- | --- |
| `destroy()` | 移除監聽、計時器與 DOM |
| `setPaused(value)` | 暫停 / 恢復軌跡 |
| `isReduced()` | 目前是否因「減少動態效果」而停用 |
| `getState()` | 目前統計 |

## 與原實作的有意差異

- 原站是 React 元件，本例是原生 JS；方塊由固定圖層承載，而非 React 樹；
- 原站只判斷事件目標的 `tagName` 是否為 `A`/`BUTTON`，本例用 `closest`，連結內子元素也不會觸發；
- 本例將字元在方塊內置中，並額外提供參數面板、統計與網格基準線開關；
- 原站還會監聽 `River` 標題元素，本例未包含；需要時可為標題加上 `trailAnimationArea`。

## 已驗證

用 headless Chrome + CDP 實際執行過：

- 空白區域移動會觸發方塊，統計與 `is-active` 數量同步；
- 標題、正文等 `trailAnimationIgnore` 區域不觸發，移回空白處恢復；
- 暫停開關有效，恢復後繼續觸發；
- 模擬 `prefers-reduced-motion: reduce` 時圖層隱藏、監聽器數量為 0、頁面提示可見；
- 調整網格 / 池大小後，方塊數量與 `--trail-size` 同步更新。

`preview.png` 就是這次驗證中截取的軌跡畫面。

## 注意

- 方塊是 `position: fixed`，依視窗座標定位，因此捲動後仍與 20px 網格對齊；
- 方塊離開所屬區域後會短暫殘留到存活時間結束，這是原始行為，不是 bug；
- `iframe` 內的滑鼠事件不會傳出來，嵌入 iframe 的內容上方不會出現方塊。
