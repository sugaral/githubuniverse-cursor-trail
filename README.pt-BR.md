# cursor-trail/ · Demo do rastro de blocos do GitHub Universe

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · Português (Brasil) · [Русский](README.ru.md)

Uma recriação sem dependências do rastro de blocos que segue o cursor em **githubuniverse.com**: quando o ponteiro entra em uma nova célula de uma grade de 20 px, um bloco de um pool fixo é reutilizado, recebe uma cor de marca e um glifo ASCII aleatórios e encolhe após 100–400 ms.

Sem build, sem dependências e sem framework: três arquivos estáticos e um script de efeito.

![Prévia do rastro](preview.png)

## Execução

Abra `index.html` diretamente ou sirva a pasta:

```powershell
python -m http.server 8000
# abra http://localhost:8000
```

> O efeito escuta eventos de mouse, então dispositivos de toque não o acionam.

## Arquivos

| Arquivo | Função |
| --- | --- |
| `index.html` | Página de demo: hero, painel de parâmetros, explicação |
| `styles.css` | Estilos da página + o CSS principal do rastro |
| `trail.js` | O efeito; expõe `createCursorTrail()` |
| `demo.js` | Liga o painel de parâmetros ao `trail.js` |

## Comportamento

- escuta `mousemove` apenas em elementos `.trailAnimationArea`;
- ignora subárvores `.trailAnimationIgnore`, `<a>`, `<button>`, controles de formulário e nós-folha só de texto;
- arredonda a posição do ponteiro para a `grid` e nunca dispara duas vezes na mesma célula;
- recicla `pool` blocos e mantém o número de nós do DOM constante;
- cada ativação escolhe uma cor (6 cores de marca) e um glifo (11 caracteres ASCII, 30% de chance de ficar vazio);
- remove `is-active` após `minLife`–`maxLife` ms; o CSS cuida da redução;
- desativa-se com `prefers-reduced-motion: reduce`, inclusive se a preferência mudar em tempo real.

## Correspondência com o site original

Estes fatos vêm da análise estática do bundle de produção (o site original não foi executado):

| Site original | Esta demo |
| --- | --- |
| Componente `CursorTrailAnimation`, carregado via `next/dynamic` (chunk `2834` + CSS `7583`) | `createCursorTrail()` em `trail.js` |
| Nomes de classe `trailAnimationArea` / `trailAnimationIgnore` | os mesmos |
| Grade de 20 px, `Math.floor(clientX / 20) * 20` | `grid: 20` por padrão, ajustável no painel |
| 10 blocos fixos em rotação | `pool: 10` por padrão |
| 6 cores de marca `#ae85ff #f73678 #c05200 #583af7 #5fed83 #bba00a` | idênticas |
| 11 glifos `- / ) . + = > < * & (` | idênticos |
| Vida aleatória de 100–400 ms | `minLife: 100` / `maxLife: 400` |
| `.Color` escala de `0 → 1` em 0,1 s | mesma curva e duração |
| `mousemove` no desktop, ignorando texto/links/botões | igual (links e botões usam `closest`) |

## Reutilização

Inclua `trail.js` e as regras `.trail-layer` / `.trail-block` de `styles.css`, depois:

```html
<section class="trailAnimationArea">
  <h1 class="trailAnimationIgnore">O título não dispara</h1>
  <p>Este fundo vazio vai gerar blocos.</p>
</section>

<script src="trail.js"></script>
<script>
  const trail = createCursorTrail({ grid: 20, pool: 10 });
</script>
```

### `createCursorTrail(options)`

| Opção | Padrão | Descrição |
| --- | --- | --- |
| `grid` | `20` | Tamanho da grade em px; também o tamanho do bloco |
| `pool` | `10` | Número de blocos no pool |
| `minLife` / `maxLife` | `100` / `400` | Faixa de vida por bloco (ms) |
| `blankChance` | `0.3` | Chance de o bloco não mostrar glifo |
| `colors` | 6 cores de marca | Pool de cores |
| `glyphs` | 11 caracteres ASCII | Pool de glifos |
| `areaSelector` | `.trailAnimationArea` | Áreas onde blocos podem aparecer |
| `ignoreSelector` | `.trailAnimationIgnore` | Subárvores excluídas |
| `onChange` | `null` | Callback de estado recebendo `{ spawned, active, reduced, paused }` |

Retorna um controlador:

| Método | Descrição |
| --- | --- |
| `destroy()` | Remove listeners, timers e DOM |
| `setPaused(value)` | Pausa ou retoma o rastro |
| `isReduced()` | Se está desativado por redução de movimento |
| `getState()` | Contadores atuais |

## Diferenças intencionais

- O original é um componente React; esta demo é JS puro e desenha os blocos em uma camada fixa, não na árvore React.
- O original só verifica se o `tagName` do alvo é `A`/`BUTTON`; esta demo usa `closest`, então filhos dentro de um link também não disparam.
- Aqui os glifos ficam centralizados no bloco, e a demo adiciona painel de parâmetros, contadores e uma grade de referência.
- O original também escuta os títulos `River`; esta demo não. Adicione `trailAnimationArea` a um título se precisar.

## Verificado

Testado com Chrome headless + CDP:

- mover sobre áreas vazias gera blocos, e os contadores batem com os nós `is-active`;
- áreas `trailAnimationIgnore` (títulos, texto) não disparam, e o rastro volta ao sair;
- a caixa de pausa funciona, e ao retomar o rastro continua;
- emular `prefers-reduced-motion: reduce` esconde a camada, remove os listeners e mostra o aviso da página;
- mudar a grade ou o tamanho do pool atualiza a contagem de blocos e `--trail-size` juntos.

`preview.png` é o rastro capturado nessa verificação.

## Observações

- Os blocos usam `position: fixed` e são posicionados em coordenadas da viewport, então continuam alinhados à grade de 20 px ao rolar.
- Os blocos permanecem brevemente após sair da área até o fim da vida; é o comportamento original, não um bug.
- Eventos de mouse dentro de um `iframe` não sobem, então conteúdo embutido não gera blocos por cima.
