# cursor-trail/ · GitHub-Universe-Cursor-Spur-Demo

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · Deutsch · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md)

Eine Nachbildung ohne Abhängigkeiten der Blockspur, die auf **githubuniverse.com** dem Cursor folgt: Sobald der Zeiger in eine neue Zelle eines 20-px-Rasters eintritt, wird ein Block aus einem festen Pool wiederverwendet, erhält eine zufällige Markenfarbe und ein ASCII-Zeichen und schrumpft nach 100–400 ms.

Kein Build, keine Abhängigkeiten, kein Framework – drei statische Dateien und ein Effekt-Skript.

![Vorschau der Cursor-Spur](preview.png)

## Ausführen

Öffnen Sie `index.html` direkt oder starten Sie einen statischen Server im Ordner:

```powershell
python -m http.server 8000
# http://localhost:8000 öffnen
```

> Der Effekt reagiert auf Mausereignisse; auf Touch-Geräten wird er nicht ausgelöst.

## Dateien

| Datei | Zweck |
| --- | --- |
| `index.html` | Demo-Seite: Hero, Parameterpanel, Erklärung |
| `styles.css` | Seitenstyles + das Kern-CSS der Spur |
| `trail.js` | Der Effekt; stellt `createCursorTrail()` bereit |
| `demo.js` | Verbindet das Parameterpanel mit `trail.js` |

## Verhalten

- lauscht nur auf `mousemove` an `.trailAnimationArea`-Elementen;
- überspringt `.trailAnimationIgnore`-Teilbäume, `<a>`, `<button>`, Formularelemente und reine Text-Blattknoten;
- rundet die Zeigerposition auf das `grid` und löst pro Zelle nur einmal aus;
- verwendet `pool` Blöcke im Kreis wieder und hält die DOM-Größe konstant;
- wählt pro Auslösung zufällig eine Farbe (6 Markenfarben) und ein Zeichen (11 ASCII-Zeichen, 30 % Chance auf leer);
- entfernt `is-active` nach `minLife`–`maxLife` ms; das Schrumpfen übernimmt CSS;
- deaktiviert sich bei `prefers-reduced-motion: reduce`, auch bei Änderung der Einstellung zur Laufzeit.

## Zuordnung zur Originalseite

Diese Angaben stammen aus der statischen Analyse des Produktions-Bundles (die Originalseite wurde nicht ausgeführt):

| Originalseite | Diese Demo |
| --- | --- |
| `CursorTrailAnimation`-Komponente, per `next/dynamic` nachgeladen (Chunk `2834` + CSS `7583`) | `createCursorTrail()` in `trail.js` |
| Klassennamen `trailAnimationArea` / `trailAnimationIgnore` | identisch |
| 20-px-Raster, `Math.floor(clientX / 20) * 20` | standardmäßig `grid: 20`, im Panel anpassbar |
| 10 fest positionierte Blöcke im Wechsel | standardmäßig `pool: 10` |
| 6 Markenfarben `#ae85ff #f73678 #c05200 #583af7 #5fed83 #bba00a` | identisch |
| 11 Zeichen `- / ) . + = > < * & (` | identisch |
| zufällige Lebensdauer von 100–400 ms | `minLife: 100` / `maxLife: 400` |
| `.Color` skaliert in 0,1 s von `0 → 1` | gleiche Kurve und Dauer |
| Desktop-`mousemove`, Text/Links/Buttons ignoriert | identisch (Links und Buttons über `closest`) |

## Wiederverwendung

Binden Sie `trail.js` und die Regeln `.trail-layer` / `.trail-block` aus `styles.css` ein, dann:

```html
<section class="trailAnimationArea">
  <h1 class="trailAnimationIgnore">Die Überschrift löst nichts aus</h1>
  <p>Dieser leere Hintergrund erzeugt Blöcke.</p>
</section>

<script src="trail.js"></script>
<script>
  const trail = createCursorTrail({ grid: 20, pool: 10 });
</script>
```

### `createCursorTrail(options)`

| Option | Standard | Beschreibung |
| --- | --- | --- |
| `grid` | `20` | Rastergröße in px; zugleich Blockgröße |
| `pool` | `10` | Anzahl der Blöcke im Pool |
| `minLife` / `maxLife` | `100` / `400` | Lebensdauer pro Block (ms) |
| `blankChance` | `0.3` | Wahrscheinlichkeit, dass ein Block kein Zeichen zeigt |
| `colors` | 6 Markenfarben | Farbpool |
| `glyphs` | 11 ASCII-Zeichen | Zeichenpool |
| `areaSelector` | `.trailAnimationArea` | Bereiche, in denen Blöcke erscheinen dürfen |
| `ignoreSelector` | `.trailAnimationIgnore` | Ausgeschlossene Teilbäume |
| `onChange` | `null` | Status-Callback mit `{ spawned, active, reduced, paused }` |

Gibt einen Controller zurück:

| Methode | Beschreibung |
| --- | --- |
| `destroy()` | Entfernt Listener, Timer und DOM |
| `setPaused(value)` | Pausiert die Spur oder setzt sie fort |
| `isReduced()` | Ob sie wegen reduzierter Bewegung deaktiviert ist |
| `getState()` | Aktuelle Zähler |

## Bewusste Unterschiede

- Das Original ist eine React-Komponente; diese Demo ist reines JS und zeichnet die Blöcke in einer festen Ebene statt im React-Baum.
- Das Original prüft nur, ob `tagName` des Ziels `A`/`BUTTON` ist; diese Demo nutzt `closest`, daher lösen auch Kinder innerhalb eines Links nichts aus.
- Hier sind die Zeichen im Block zentriert; die Demo ergänzt ein Parameterpanel, Zähler und ein Raster-Overlay.
- Das Original lauscht zusätzlich auf `River`-Überschriften; diese Demo nicht. Ergänzen Sie bei Bedarf `trailAnimationArea` an einer Überschrift.

## Verifiziert

Mit headless Chrome + CDP getestet:

- Bewegung über leere Bereiche erzeugt Blöcke, und die Zähler stimmen mit den `is-active`-Knoten überein;
- `trailAnimationIgnore`-Bereiche (Überschriften, Fließtext) lösen nichts aus; beim Verlassen läuft die Spur weiter;
- der Pause-Schalter funktioniert, und nach dem Fortsetzen werden wieder Blöcke erzeugt;
- bei emuliertem `prefers-reduced-motion: reduce` wird die Ebene ausgeblendet, alle Listener entfernt und der Seitenhinweis angezeigt;
- Änderungen an Raster oder Poolgröße aktualisieren Blockanzahl und `--trail-size` gemeinsam.

`preview.png` zeigt die Spur aus diesem Testlauf.

## Hinweise

- Die Blöcke sind `position: fixed` und werden in Viewport-Koordinaten platziert; sie bleiben beim Scrollen am 20-px-Raster ausgerichtet.
- Blöcke bleiben nach dem Verlassen ihres Bereichs kurz bis zum Ende ihrer Lebensdauer sichtbar; das ist Originalverhalten, kein Bug.
- Mausereignisse in einem `iframe` werden nicht nach außen gereicht; eingebettete Inhalte erzeugen darüber keine Blöcke.
