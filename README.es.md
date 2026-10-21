# cursor-trail/ · Demo del rastro de bloques de GitHub Universe

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · Español · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md)

Una recreación sin dependencias del rastro de bloques que sigue al cursor en **githubuniverse.com**: cuando el puntero entra en una nueva celda de una cuadrícula de 20 px, se reutiliza un bloque de un grupo fijo, recibe un color de marca y un glifo ASCII aleatorios, y se encoge tras 100–400 ms.

Sin compilación, sin dependencias y sin frameworks: tres archivos estáticos y un script de efecto.

![Vista previa del rastro](preview.png)

## Ejecutar

Abre `index.html` directamente o sirve la carpeta:

```powershell
python -m http.server 8000
# abre http://localhost:8000
```

> El efecto escucha eventos de ratón, así que los dispositivos táctiles no lo activan.

## Archivos

| Archivo | Función |
| --- | --- |
| `index.html` | Página de demo: hero, panel de parámetros, explicación |
| `styles.css` | Estilos de la página + el CSS principal del rastro |
| `trail.js` | El efecto; expone `createCursorTrail()` |
| `demo.js` | Conecta el panel de parámetros con `trail.js` |

## Comportamiento

- escucha `mousemove` solo en los elementos `.trailAnimationArea`;
- omite los subárboles `.trailAnimationIgnore`, `<a>`, `<button>`, controles de formulario y nodos hoja solo de texto;
- redondea la posición del puntero a la `grid` y no se dispara dos veces en la misma celda;
- recicla `pool` bloques y mantiene constante el número de nodos del DOM;
- cada activación elige un color (6 colores de marca) y un glifo (11 caracteres ASCII, 30 % de probabilidad de quedar en blanco);
- quita `is-active` tras `minLife`–`maxLife` ms; el CSS se encarga de la reducción;
- se desactiva con `prefers-reduced-motion: reduce`, incluso si la preferencia cambia en caliente.

## Correspondencia con el sitio original

Estos datos provienen del análisis estático del bundle de producción (no se ejecutó el sitio original):

| Sitio original | Esta demo |
| --- | --- |
| Componente `CursorTrailAnimation`, cargado con `next/dynamic` (chunk `2834` + CSS `7583`) | `createCursorTrail()` en `trail.js` |
| Nombres de clase `trailAnimationArea` / `trailAnimationIgnore` | los mismos |
| Cuadrícula de 20 px, `Math.floor(clientX / 20) * 20` | `grid: 20` por defecto, ajustable en el panel |
| 10 bloques fijos en rotación | `pool: 10` por defecto |
| 6 colores de marca `#ae85ff #f73678 #c05200 #583af7 #5fed83 #bba00a` | idénticos |
| 11 glifos `- / ) . + = > < * & (` | idénticos |
| Vida aleatoria de 100–400 ms | `minLife: 100` / `maxLife: 400` |
| `.Color` escala de `0 → 1` en 0,1 s | misma curva y duración |
| `mousemove` de escritorio, ignorando texto/enlaces/botones | igual (enlaces y botones usan `closest`) |

## Reutilización

Incluye `trail.js` y las reglas `.trail-layer` / `.trail-block` de `styles.css`, y luego:

```html
<section class="trailAnimationArea">
  <h1 class="trailAnimationIgnore">El título no dispara</h1>
  <p>Este fondo vacío generará bloques.</p>
</section>

<script src="trail.js"></script>
<script>
  const trail = createCursorTrail({ grid: 20, pool: 10 });
</script>
```

### `createCursorTrail(options)`

| Opción | Valor por defecto | Descripción |
| --- | --- | --- |
| `grid` | `20` | Tamaño de la cuadrícula en px; también el tamaño del bloque |
| `pool` | `10` | Número de bloques del grupo |
| `minLife` / `maxLife` | `100` / `400` | Rango de vida por bloque (ms) |
| `blankChance` | `0.3` | Probabilidad de que un bloque no muestre glifo |
| `colors` | 6 colores de marca | Grupo de colores |
| `glyphs` | 11 caracteres ASCII | Grupo de glifos |
| `areaSelector` | `.trailAnimationArea` | Zonas donde pueden aparecer bloques |
| `ignoreSelector` | `.trailAnimationIgnore` | Subárboles excluidos |
| `onChange` | `null` | Callback de estado; recibe `{ spawned, active, reduced, paused }` |

Devuelve un controlador:

| Método | Descripción |
| --- | --- |
| `destroy()` | Elimina listeners, temporizadores y DOM |
| `setPaused(value)` | Pausa o reanuda el rastro |
| `isReduced()` | Indica si está desactivado por reducción de movimiento |
| `getState()` | Contadores actuales |

## Diferencias intencionadas

- El original es un componente React; esta demo es JS puro y dibuja los bloques en una capa fija, no en el árbol de React.
- El original solo comprueba si el `tagName` del objetivo es `A`/`BUTTON`; esta demo usa `closest`, así que los hijos dentro de un enlace tampoco disparan.
- Aquí los glifos se centran en el bloque y la demo añade panel de parámetros, contadores y una cuadrícula de referencia.
- El original también escucha los encabezados `River`; esta demo no. Añade `trailAnimationArea` a un encabezado si lo necesitas.

## Verificado

Probado con Chrome headless + CDP:

- moverse por zonas vacías genera bloques y los contadores coinciden con los nodos `is-active`;
- las zonas `trailAnimationIgnore` (títulos, texto) no disparan y, al salir, el rastro se reanuda;
- la casilla de pausa funciona y, al reanudar, el rastro continúa;
- al emular `prefers-reduced-motion: reduce` se oculta la capa, se eliminan los listeners y aparece el aviso de la página;
- cambiar la cuadrícula o el tamaño del grupo actualiza el número de bloques y `--trail-size` a la vez.

`preview.png` es el rastro capturado durante esa prueba.

## Notas

- Los bloques son `position: fixed` y se colocan en coordenadas de la ventana, así que siguen alineados a la cuadrícula de 20 px al hacer scroll.
- Los bloques permanecen brevemente tras salir de su zona hasta que termina su vida; es el comportamiento original, no un fallo.
- Los eventos de ratón dentro de un `iframe` no salen, así que el contenido incrustado no generará bloques encima.
