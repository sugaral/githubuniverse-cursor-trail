# cursor-trail/ · GitHub Universe 커서 트레일 데모

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · 한국어 · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md)

**githubuniverse.com**에서 커서를 따라 나타나는 색색의 블록 궤적을 의존성 없이 재현한 데모입니다. 포인터가 20px 그리드의 새 칸에 들어갈 때마다 고정 풀에서 블록 하나를 재사용하고, 무작위 브랜드 색상과 ASCII 문자를 넣은 뒤 100–400ms 후에 줄어들게 합니다.

빌드 없음, 의존성 없음, 프레임워크 없음 — 정적 파일 3개와 효과 스크립트 1개뿐입니다.

![커서 트레일 미리보기](preview.png)

## 실행

`index.html`을 바로 열거나, 폴더에서 정적 서버를 실행합니다:

```powershell
python -m http.server 8000
# http://localhost:8000 열기
```

> 마우스 이벤트를 사용하므로 터치 기기에서는 동작하지 않습니다.

## 파일

| 파일 | 역할 |
| --- | --- |
| `index.html` | 데모 페이지: 히어로, 파라미터 패널, 설명 |
| `styles.css` | 페이지 스타일 + 궤적 핵심 CSS |
| `trail.js` | 효과 구현. `createCursorTrail()` 제공 |
| `demo.js` | 파라미터 패널을 `trail.js`에 연결 |

## 동작

- `.trailAnimationArea` 요소의 `mousemove`만 감지합니다;
- `.trailAnimationIgnore` 하위 트리, `<a>`, `<button>`, 폼 컨트롤, 텍스트만 있는 리프 노드는 건너뜁니다;
- 포인터 위치를 `grid` 단위로 반올림하며, 같은 칸에서는 다시 발생하지 않습니다;
- `pool`개의 블록을 순환 재사용해 DOM 개수를 일정하게 유지합니다;
- 발생할 때마다 색상(브랜드 색 6종)과 문자(ASCII 11종, 30% 확률로 공백)를 무작위로 고릅니다;
- `minLife`–`maxLife` 밀리초 후 `is-active`를 제거하고, 축소는 CSS가 담당합니다;
- `prefers-reduced-motion: reduce`에서는 자동으로 비활성화되며, 설정 변경도 즉시 반영됩니다.

## 원본 사이트와의 대응

아래 사실은 프로덕션 번들의 정적 분석에서 나온 것이며, 원본 사이트를 실행한 것은 아닙니다:

| 원본 사이트 | 이 데모 |
| --- | --- |
| `CursorTrailAnimation` 컴포넌트, `next/dynamic` 지연 로딩(chunk `2834` + CSS `7583`) | `trail.js`의 `createCursorTrail()` |
| 클래스 이름 `trailAnimationArea` / `trailAnimationIgnore` | 동일 |
| 20px 그리드, `Math.floor(clientX / 20) * 20` | 기본 `grid: 20`, 패널에서 조정 가능 |
| fixed 블록 10개 순환 | 기본 `pool: 10` |
| 브랜드 색 6종 `#ae85ff #f73678 #c05200 #583af7 #5fed83 #bba00a` | 동일 |
| 문자 11종 `- / ) . + = > < * & (` | 동일 |
| 100–400ms 무작위 수명 | `minLife: 100` / `maxLife: 400` |
| `.Color` 0.1s `scale(0) → scale(1)` | 동일한 곡선과 시간 |
| 데스크톱 `mousemove`, 텍스트/링크/버튼 무시 | 동일(링크와 버튼은 `closest`로 판정) |

## 재사용

`trail.js`와 `styles.css`의 `.trail-layer` / `.trail-block` 규칙을 포함한 뒤 다음과 같이 사용합니다:

```html
<section class="trailAnimationArea">
  <h1 class="trailAnimationIgnore">제목에서는 발생하지 않습니다</h1>
  <p>이 빈 배경에는 블록이 나타납니다.</p>
</section>

<script src="trail.js"></script>
<script>
  const trail = createCursorTrail({ grid: 20, pool: 10 });
</script>
```

### `createCursorTrail(options)`

| 옵션 | 기본값 | 설명 |
| --- | --- | --- |
| `grid` | `20` | 그리드 크기(px). 블록 크기도 됨 |
| `pool` | `10` | 블록 풀 개수 |
| `minLife` / `maxLife` | `100` / `400` | 블록별 수명 범위(ms) |
| `blankChance` | `0.3` | 문자를 표시하지 않을 확률 |
| `colors` | 브랜드 색 6종 | 색상 풀 |
| `glyphs` | ASCII 11종 | 문자 풀 |
| `areaSelector` | `.trailAnimationArea` | 블록이 나타날 수 있는 영역 |
| `ignoreSelector` | `.trailAnimationIgnore` | 제외할 하위 트리 |
| `onChange` | `null` | 상태 콜백. `{ spawned, active, reduced, paused }` 전달 |

컨트롤러를 반환합니다:

| 메서드 | 설명 |
| --- | --- |
| `destroy()` | 리스너, 타이머, DOM 제거 |
| `setPaused(value)` | 궤적 일시정지 / 재개 |
| `isReduced()` | 현재 "동작 줄이기" 설정으로 비활성화되었는지 |
| `getState()` | 현재 카운터 |

## 의도적인 차이

- 원본은 React 컴포넌트지만, 이 데모는 순수 JS이며 블록을 React 트리가 아닌 고정 레이어에 렌더링합니다.
- 원본은 이벤트 대상의 `tagName`이 `A`/`BUTTON`인지만 확인하지만, 이 데모는 `closest`를 사용하므로 링크 내부의 자식 요소에서도 발생하지 않습니다.
- 이 데모는 문자를 블록 가운데에 배치하고, 파라미터 패널, 카운터, 그리드 오버레이를 추가했습니다.
- 원본은 `River` 제목 요소도 감지하지만 이 데모에는 포함되지 않습니다. 필요하면 제목에 `trailAnimationArea`를 추가하세요.

## 검증

headless Chrome + CDP로 실제 확인했습니다:

- 빈 영역에서 이동하면 블록이 생성되고, 카운터가 `is-active` 개수와 일치합니다;
- `trailAnimationIgnore` 영역(제목, 본문)에서는 발생하지 않으며, 벗어나면 다시 시작됩니다;
- 일시정지 스위치가 동작하고, 재개하면 다시 발생합니다;
- `prefers-reduced-motion: reduce`를 에뮬레이션하면 레이어가 숨겨지고 리스너가 0이 되며 페이지 안내가 표시됩니다;
- 그리드나 풀 크기를 바꾸면 블록 개수와 `--trail-size`가 함께 갱신됩니다.

`preview.png`는 이 검증 중에 캡처한 궤적입니다.

## 참고

- 블록은 `position: fixed`이며 뷰포트 좌표로 배치되므로, 스크롤해도 20px 그리드에 정렬됩니다.
- 블록은 영역을 벗어난 뒤에도 수명이 끝날 때까지 잠시 남습니다. 원본 동작이며 버그가 아닙니다.
- `iframe` 안의 마우스 이벤트는 밖으로 전달되지 않으므로, iframe 콘텐츠 위에서는 블록이 생기지 않습니다.
