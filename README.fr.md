# cursor-trail/ · Démo de traînée de blocs GitHub Universe

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · Français · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md)

Une reproduction sans dépendance de la traînée de blocs qui suit le curseur sur **githubuniverse.com** : lorsque le pointeur entre dans une nouvelle cellule d'une grille de 20 px, un bloc d'un pool fixe est réutilisé, reçoit une couleur de marque et un glyphe ASCII aléatoires, puis rétrécit après 100–400 ms.

Aucune compilation, aucune dépendance, aucun framework : trois fichiers statiques et un script d'effet.

![Aperçu de la traînée](preview.png)

## Lancer

Ouvrez `index.html` directement, ou servez le dossier :

```powershell
python -m http.server 8000
# ouvrir http://localhost:8000
```

> L'effet écoute les événements de souris ; les appareils tactiles ne le déclenchent pas.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | Page de démo : hero, panneau de paramètres, explications |
| `styles.css` | Styles de la page + le CSS principal de la traînée |
| `trail.js` | L'effet, expose `createCursorTrail()` |
| `demo.js` | Relie le panneau de paramètres à `trail.js` |

## Comportement

- écoute `mousemove` uniquement sur les éléments `.trailAnimationArea` ;
- ignore les sous-arbres `.trailAnimationIgnore`, `<a>`, `<button>`, les contrôles de formulaire et les nœuds feuilles uniquement textuels ;
- arrondit la position du pointeur à la `grid` et ne se déclenche jamais deux fois dans la même cellule ;
- recycle `pool` blocs et garde un nombre de nœuds DOM constant ;
- chaque activation choisit une couleur (6 couleurs de marque) et un glyphe (11 caractères ASCII, 30 % de chance de vide) au hasard ;
- retire `is-active` après `minLife`–`maxLife` ms ; le CSS gère la réduction ;
- se désactive avec `prefers-reduced-motion: reduce`, y compris si la préférence change en direct.

## Correspondance avec le site original

Ces faits proviennent de l'analyse statique du bundle de production (le site original n'a pas été exécuté) :

| Site original | Cette démo |
| --- | --- |
| Composant `CursorTrailAnimation`, chargé via `next/dynamic` (chunk `2834` + CSS `7583`) | `createCursorTrail()` dans `trail.js` |
| Noms de classes `trailAnimationArea` / `trailAnimationIgnore` | identiques |
| Grille de 20 px, `Math.floor(clientX / 20) * 20` | `grid: 20` par défaut, réglable dans le panneau |
| 10 blocs fixes en rotation | `pool: 10` par défaut |
| 6 couleurs de marque `#ae85ff #f73678 #c05200 #583af7 #5fed83 #bba00a` | identiques |
| 11 glyphes `- / ) . + = > < * & (` | identiques |
| Durée de vie aléatoire de 100–400 ms | `minLife: 100` / `maxLife: 400` |
| `.Color` passe de `0 → 1` en 0,1 s | même courbe et durée |
| `mousemove` desktop, texte/liens/boutons ignorés | identique (liens et boutons via `closest`) |

## Réutilisation

Incluez `trail.js` et les règles `.trail-layer` / `.trail-block` de `styles.css`, puis :

```html
<section class="trailAnimationArea">
  <h1 class="trailAnimationIgnore">Le titre ne déclenche rien</h1>
  <p>Ce fond vide fera apparaître des blocs.</p>
</section>

<script src="trail.js"></script>
<script>
  const trail = createCursorTrail({ grid: 20, pool: 10 });
</script>
```

### `createCursorTrail(options)`

| Option | Valeur par défaut | Description |
| --- | --- | --- |
| `grid` | `20` | Taille de la grille en px ; sert aussi de taille de bloc |
| `pool` | `10` | Nombre de blocs dans le pool |
| `minLife` / `maxLife` | `100` / `400` | Durée de vie par bloc (ms) |
| `blankChance` | `0.3` | Probabilité qu'un bloc n'affiche aucun glyphe |
| `colors` | 6 couleurs de marque | Pool de couleurs |
| `glyphs` | 11 caractères ASCII | Pool de glyphes |
| `areaSelector` | `.trailAnimationArea` | Zones où les blocs peuvent apparaître |
| `ignoreSelector` | `.trailAnimationIgnore` | Sous-arbres exclus |
| `onChange` | `null` | Callback d'état recevant `{ spawned, active, reduced, paused }` |

Renvoie un contrôleur :

| Méthode | Description |
| --- | --- |
| `destroy()` | Retire les écouteurs, les timers et le DOM |
| `setPaused(value)` | Met la traînée en pause ou la reprend |
| `isReduced()` | Indique si elle est désactivée par la réduction de mouvement |
| `getState()` | Compteurs actuels |

## Différences volontaires

- L'original est un composant React ; cette démo est en JS natif et dessine les blocs dans une couche fixe, pas dans l'arbre React.
- L'original vérifie seulement si le `tagName` de la cible est `A`/`BUTTON` ; cette démo utilise `closest`, donc les enfants d'un lien ne déclenchent rien non plus.
- Ici les glyphes sont centrés dans le bloc, et la démo ajoute un panneau de paramètres, des compteurs et une grille de référence.
- L'original écoute aussi les titres `River` ; cette démo ne le fait pas. Ajoutez `trailAnimationArea` à un titre si besoin.

## Vérifié

Testé avec Chrome headless + CDP :

- se déplacer sur des zones vides crée des blocs et les compteurs correspondent aux nœuds `is-active` ;
- les zones `trailAnimationIgnore` (titres, texte) ne déclenchent rien, et la traînée reprend en sortant ;
- la case pause fonctionne, et la reprise continue la traînée ;
- simuler `prefers-reduced-motion: reduce` masque la couche, retire tous les écouteurs et affiche le message de la page ;
- modifier la grille ou la taille du pool met à jour le nombre de blocs et `--trail-size` ensemble.

`preview.png` est la traînée capturée pendant cette vérification.

## Remarques

- Les blocs sont en `position: fixed` et positionnés en coordonnées de fenêtre ; ils restent donc alignés sur la grille de 20 px au défilement.
- Les blocs restent brièvement après avoir quitté leur zone, jusqu'à la fin de leur durée de vie ; c'est le comportement original, pas un bug.
- Les événements de souris dans un `iframe` ne remontent pas : le contenu intégré ne fera pas apparaître de blocs au-dessus.
