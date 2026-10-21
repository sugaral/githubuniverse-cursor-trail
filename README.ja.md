# cursor-trail/ · GitHub Universe カーソルトレイルのデモ

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · 日本語 · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md)

**githubuniverse.com** でカーソルに追従して現れるカラーブロックの軌跡を、依存関係なしで再現したデモです。ポインターが 20px グリッドの新しいセルに入るたびに、固定プールからブロックを 1 つ再利用し、ランダムなブランドカラーと ASCII 文字を設定して、100–400ms 後に縮小させます。

ビルド不要・依存関係なし・フレームワークなし。静的ファイル 3 つとエフェクト用スクリプト 1 つだけです。

![カーソルトレイルのプレビュー](preview.png)

## 実行

`index.html` を直接開くか、フォルダー内で静的サーバーを起動します：

```powershell
python -m http.server 8000
# http://localhost:8000 を開く
```

> マウスイベントを使うため、タッチデバイスでは表示されません。

## ファイル

| ファイル | 役割 |
| --- | --- |
| `index.html` | デモページ：ヒーロー、パラメーターパネル、解説 |
| `styles.css` | ページのスタイル + 軌跡のコア CSS |
| `trail.js` | エフェクト本体。`createCursorTrail()` を公開 |
| `demo.js` | パラメーターパネルを `trail.js` に接続 |

## 動作

- `.trailAnimationArea` 要素の `mousemove` だけを監視します；
- `.trailAnimationIgnore` のサブツリー、`<a>`、`<button>`、フォーム部品、テキストのみのリーフノードはスキップします；
- ポインター位置を `grid` 単位に丸め、同じセルでは再発火しません；
- `pool` 個のブロックを循環利用し、DOM の数は一定です；
- 発火ごとに色（6 色のブランドカラー）と文字（11 種の ASCII、30% の確率で空白）をランダムに選びます；
- `minLife`–`maxLife` ミリ秒後に `is-active` を外し、縮小は CSS が担当します；
- `prefers-reduced-motion: reduce` では自動的に無効化し、設定変更も即時反映します。

## 元サイトとの対応

以下の事実は本番バンドルの静的解析によるもので、元サイトの実行は行っていません：

| 元サイト | このデモ |
| --- | --- |
| `CursorTrailAnimation` コンポーネント、`next/dynamic` による遅延読み込み（chunk `2834` + CSS `7583`） | `trail.js` の `createCursorTrail()` |
| クラス名 `trailAnimationArea` / `trailAnimationIgnore` | 同じ名前 |
| 20px グリッド、`Math.floor(clientX / 20) * 20` | 既定は `grid: 20`、パネルで変更可能 |
| 10 個の fixed 配置ブロックをローテーション | 既定は `pool: 10` |
| 6 色のブランドカラー `#ae85ff #f73678 #c05200 #583af7 #5fed83 #bba00a` | 同一 |
| 11 種の文字 `- / ) . + = > < * & (` | 同一 |
| 100–400ms のランダムな寿命 | `minLife: 100` / `maxLife: 400` |
| `.Color` の 0.1s `scale(0) → scale(1)` | 同じカーブと時間 |
| デスクトップの `mousemove`、テキスト/リンク/ボタンは無視 | 同一（リンクとボタンは `closest` で判定） |

## 再利用

`trail.js` と、`styles.css` の `.trail-layer` / `.trail-block` ルールを読み込み、次のように使います：

```html
<section class="trailAnimationArea">
  <h1 class="trailAnimationIgnore">見出しでは発火しません</h1>
  <p>この空白の背景にはブロックが現れます。</p>
</section>

<script src="trail.js"></script>
<script>
  const trail = createCursorTrail({ grid: 20, pool: 10 });
</script>
```

### `createCursorTrail(options)`

| オプション | 既定値 | 説明 |
| --- | --- | --- |
| `grid` | `20` | グリッドのサイズ（px）。ブロックの大きさにもなる |
| `pool` | `10` | ブロックプールの数 |
| `minLife` / `maxLife` | `100` / `400` | ブロックごとの寿命の範囲（ms） |
| `blankChance` | `0.3` | 文字を表示しない確率 |
| `colors` | 6 色のブランドカラー | 色プール |
| `glyphs` | 11 種の ASCII | 文字プール |
| `areaSelector` | `.trailAnimationArea` | ブロックを出してよい領域 |
| `ignoreSelector` | `.trailAnimationIgnore` | 除外するサブツリー |
| `onChange` | `null` | 状態コールバック。`{ spawned, active, reduced, paused }` を受け取る |

コントローラーを返します：

| メソッド | 説明 |
| --- | --- |
| `destroy()` | リスナー、タイマー、DOM を削除 |
| `setPaused(value)` | 軌跡を一時停止 / 再開 |
| `isReduced()` | 「視差効果を減らす」設定で無効かどうか |
| `getState()` | 現在のカウンター |

## 意図的な違い

- 元サイトは React コンポーネントですが、このデモは素の JS で、ブロックを React ツリーではなく固定レイヤーに描画します。
- 元サイトはイベント対象の `tagName` が `A`/`BUTTON` かどうかだけを見ますが、このデモは `closest` を使うため、リンク内の子要素でも発火しません。
- このデモでは文字をブロック中央に配置し、パラメーターパネル、カウンター、グリッド表示を追加しています。
- 元サイトは `River` 見出し要素も監視しますが、このデモには含まれません。必要なら見出しに `trailAnimationArea` を追加してください。

## 検証済み

headless Chrome + CDP で実際に確認しました：

- 空白領域の移動でブロックが生成され、カウンターと `is-active` の数が一致する；
- `trailAnimationIgnore` 領域（見出しや本文）では発火せず、戻ると再開する；
- 一時停止スイッチが機能し、再開後も発火する；
- `prefers-reduced-motion: reduce` をエミュレートすると、レイヤーが隠れ、リスナーが 0 になり、ページの注意書きが表示される；
- グリッドやプールのサイズを変えると、ブロック数と `--trail-size` が同時に更新される。

`preview.png` はこの検証時に撮影した軌跡です。

## 注意

- ブロックは `position: fixed` でビューポート座標に配置されるため、スクロールしても 20px グリッドに揃います。
- ブロックは領域を離れた後も寿命が切れるまで少し残ります。これは元の挙動であり、バグではありません。
- `iframe` 内のマウスイベントは外に伝わらないため、iframe 内のコンテンツ上ではブロックが出ません。
