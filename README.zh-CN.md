# cursor-trail/ · 光标方块轨迹示例

[English](README.md) · 简体中文 · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md)

复刻 **githubuniverse.com** 鼠标移动时出现彩色方块的交互：光标落到 20px 网格的新格子上时，
复用池里的一个方块，随机品牌色 + 随机 ASCII 字符，100–400ms 后缩回。

无构建、无依赖、无框架——三个静态文件加一个效果脚本。

![光标方块轨迹预览](preview.png)

## 运行

直接双击 `index.html` 即可；或在当前目录起一个静态服务器：

```powershell
python -m http.server 8000
# 打开 http://localhost:8000
```

> 效果依赖鼠标事件，触屏设备不会触发。

## 文件

| 文件 | 作用 |
| --- | --- |
| `index.html` | 示例页面：hero、参数面板、原理说明 |
| `styles.css` | 页面样式 + 方块轨迹核心 CSS |
| `trail.js` | 效果实现，暴露 `createCursorTrail()` |
| `demo.js` | 把参数面板接到 `trail.js` 上 |

## 行为

- 只监听 `.trailAnimationArea` 元素上的 `mousemove`；
- 命中 `.trailAnimationIgnore` 子树、`<a>`、`<button>`、表单控件或纯文本叶子节点时跳过；
- 光标位置按 `grid` 取整，同一格子不重复触发；
- `pool` 个方块循环复用，DOM 数量恒定；
- 每次激活随机取一个颜色（6 种品牌色）和一个字符（11 种 ASCII，30% 概率为空格）；
- 激活 `minLife`–`maxLife` 毫秒后移除 `is-active`，CSS 负责缩小消失；
- `prefers-reduced-motion: reduce` 时自动禁用，偏好变化会实时生效。

## 与原站的对应关系

以下事实来自对线上产物的静态分析（未运行原站）：

| 原站 | 本例 |
| --- | --- |
| `CursorTrailAnimation` 组件，`next/dynamic` 懒加载 chunk `2834` + CSS `7583` | `trail.js` 中的 `createCursorTrail()` |
| 类名 `trailAnimationArea` / `trailAnimationIgnore` | 同名 |
| 20px 网格，`Math.floor(clientX / 20) * 20` | 默认 `grid: 20`，可按控件调整 |
| 10 个 fixed 定位方块轮换 | 默认 `pool: 10` |
| 6 种品牌色 `#ae85ff #f73678 #c05200 #583af7 #5fed83 #bba00a` | 相同 |
| 11 种字符 `- / ) . + = > < * & (` | 相同 |
| 100–400ms 随机寿命 | `minLife: 100` / `maxLife: 400` |
| `.Color` 0.1s `scale(0) → scale(1)` | 相同曲线与时长 |
| 桌面端 `mousemove`，忽略文字/链接/按钮 | 相同（链接和按钮改用 `closest` 判断） |

## 复用

引入 `trail.js` 和 `styles.css` 里的 `.trail-layer` / `.trail-block` 规则，然后：

```html
<section class="trailAnimationArea">
  <h1 class="trailAnimationIgnore">标题不触发</h1>
  <p>这片空白背景会出方块。</p>
</section>

<script src="trail.js"></script>
<script>
  const trail = createCursorTrail({ grid: 20, pool: 10 });
</script>
```

### `createCursorTrail(options)`

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `grid` | `20` | 网格尺寸（px），同时决定方块大小 |
| `pool` | `10` | 方块池大小 |
| `minLife` / `maxLife` | `100` / `400` | 单个方块存活时间范围（ms） |
| `blankChance` | `0.3` | 方块内不显示字符的概率 |
| `colors` | 6 种品牌色 | 颜色池 |
| `glyphs` | 11 种 ASCII | 字符池 |
| `areaSelector` | `.trailAnimationArea` | 允许出现方块的区域 |
| `ignoreSelector` | `.trailAnimationIgnore` | 排除的子树 |
| `onChange` | `null` | 状态回调，收到 `{ spawned, active, reduced, paused }` |

返回控制器：

| 方法 | 说明 |
| --- | --- |
| `destroy()` | 移除监听、定时器和 DOM |
| `setPaused(value)` | 暂停 / 恢复轨迹 |
| `isReduced()` | 当前是否因“减少动态效果”而禁用 |
| `getState()` | 当前统计 |

## 与原实现的有意差异

- 原站是 React 组件，本例是原生 JS；方块由固定层承载，而非 React 树；
- 原站只判断事件目标的 `tagName` 是否为 `A`/`BUTTON`，本例用 `closest`，链接内的子元素也不会触发；
- 本例把字符在方块内居中，并额外提供参数面板、统计和网格基准线开关；
- 原站还监听 `River` 标题元素，本例未包含；需要时可给标题加 `trailAnimationArea`。

## 已验证

用 headless Chrome + CDP 实际跑过一遍：

- 空白区域移动会触发方块，统计与 `is-active` 数量同步；
- 标题、正文等 `trailAnimationIgnore` 区域不触发，移回空白处恢复；
- 暂停开关生效，恢复后继续触发；
- 模拟 `prefers-reduced-motion: reduce` 时图层隐藏、监听器数量为 0、页面提示可见；
- 改网格 / 池大小后，方块数量与 `--trail-size` 同步更新。

`preview.png` 就是这次验证中截取的轨迹画面。

## 注意

- 方块是 `position: fixed`，按视口坐标定位，因此滚动后仍与 20px 网格对齐；
- 方块离开所属区域后会短暂残留到寿命结束，这是原始行为，不是 bug；
- `iframe` 内的鼠标事件不会传出来，嵌在 iframe 里的内容上方不会出方块。
