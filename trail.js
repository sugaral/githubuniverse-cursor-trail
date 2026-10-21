/*!
 * cursor-trail.js
 * 复刻 githubuniverse.com 的光标方块轨迹（CursorTrailAnimation）。
 *
 * 机制：
 *   - 只监听 .trailAnimationArea 上的 mousemove
 *   - 光标位置量化到 grid 像素网格，跨格才触发
 *   - 复用 pool 个 fixed 定位的小方块，随机颜色 + ASCII 字符
 *   - 每个方块激活 minLife~maxLife 毫秒后缩回
 *   - .trailAnimationIgnore 子树、链接、按钮、纯文本叶子节点不触发
 *   - 尊重 prefers-reduced-motion: reduce
 *
 * 用法：
 *   const trail = createCursorTrail({ grid: 20, pool: 10 });
 *   trail.setPaused(true);
 *   trail.destroy();
 */
(function (global) {
  "use strict";

  var DEFAULTS = {
    grid: 20,
    pool: 10,
    minLife: 100,
    maxLife: 400,
    blankChance: 0.3,
    colors: ["#ae85ff", "#f73678", "#c05200", "#583af7", "#5fed83", "#bba00a"],
    glyphs: ["-", "/", ")", ".", "+", "=", ">", "<", "*", "&", "("],
    areaSelector: ".trailAnimationArea",
    ignoreSelector: ".trailAnimationIgnore",
    onChange: null,
  };

  function createCursorTrail(options) {
    var config = Object.assign({}, DEFAULTS, options || {});
    var doc = document;

    var layer = doc.createElement("div");
    layer.className = "trail-layer";
    layer.setAttribute("aria-hidden", "true");
    layer.style.setProperty("--trail-size", config.grid + "px");
    doc.body.appendChild(layer);

    var media =
      typeof global.matchMedia === "function"
        ? global.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    var blocks = [];
    var timers = new Set();
    var areas = [];
    var ignores = [];
    var slot = 0;
    var spawned = 0;
    var lastX = null;
    var lastY = null;
    var paused = false;
    var hoveringIgnore = false;
    var reduced = !!(media && media.matches);
    var bound = false;
    var destroyed = false;

    function createBlock(index) {
      var el = doc.createElement("div");
      el.className = "trail-block";
      el.style.transform = "translate3d(" + config.grid * index + "px, 0, 0)";

      var color = doc.createElement("div");
      color.className = "trail-block__color";

      var glyph = doc.createElement("span");
      glyph.className = "trail-block__glyph";

      color.appendChild(glyph);
      el.appendChild(color);
      layer.appendChild(el);

      return { el: el, color: color, glyph: glyph, active: false, id: -1 };
    }

    function build() {
      slot = 0;
      lastX = null;
      lastY = null;
      blocks = [];
      for (var i = 0; i < config.pool; i += 1) {
        blocks.push(createBlock(i));
      }
    }

    function reset() {
      timers.forEach(function (timer) {
        clearTimeout(timer);
      });
      timers.clear();

      blocks.forEach(function (block) {
        block.el.remove();
      });
      blocks = [];
    }

    function getState() {
      var active = 0;
      for (var i = 0; i < blocks.length; i += 1) {
        if (blocks[i].active) active += 1;
      }
      return { spawned: spawned, active: active, reduced: reduced, paused: paused };
    }

    function notify() {
      if (typeof config.onChange === "function") {
        config.onChange(getState());
      }
    }

    function expire(block, id) {
      if (!block.active || block.id !== id) return;
      block.active = false;
      block.el.classList.remove("is-active");
      notify();
    }

    function activate(x, y) {
      var block = blocks[slot];
      slot = (slot + 1) % blocks.length;

      var id = (spawned += 1);
      var color = config.colors[Math.floor(Math.random() * config.colors.length)];
      var glyph =
        Math.random() < config.blankChance
          ? ""
          : config.glyphs[Math.floor(Math.random() * config.glyphs.length)];

      block.el.style.transform = "translate3d(" + x + "px," + y + "px,0)";
      block.color.style.backgroundColor = color;
      block.glyph.textContent = glyph;
      block.id = id;
      block.active = true;
      block.el.classList.add("is-active");

      var life = config.minLife + Math.random() * (config.maxLife - config.minLife);
      var timer = setTimeout(function () {
        timers.delete(timer);
        expire(block, id);
      }, life);
      timers.add(timer);

      notify();
    }

    function isEligible(target) {
      if (!target || target.nodeType !== 1) return false;
      if (target.closest(config.ignoreSelector)) return false;
      if (target.closest("a, button, input, select, textarea, label")) return false;

      // 纯文本叶子节点不触发；有子元素的容器可以触发。
      if (target.children.length === 0 && (target.textContent || "").trim() !== "") {
        return false;
      }
      return true;
    }

    function handleMove(event) {
      if (!bound || paused || hoveringIgnore) return;

      var area = event.currentTarget;
      if (!isEligible(event.target)) return;

      var rect = area.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right) return;
      if (event.clientY < rect.top || event.clientY > rect.bottom) return;

      var x = Math.floor(event.clientX / config.grid) * config.grid;
      var y = Math.floor(event.clientY / config.grid) * config.grid;
      if (x === lastX && y === lastY) return;

      lastX = x;
      lastY = y;
      activate(x, y);
    }

    function onIgnoreEnter() {
      hoveringIgnore = true;
    }

    function onIgnoreLeave() {
      hoveringIgnore = false;
    }

    function bind() {
      if (bound) return;
      bound = true;

      areas = Array.prototype.slice.call(doc.querySelectorAll(config.areaSelector));
      areas.forEach(function (area) {
        area.addEventListener("mousemove", handleMove);
      });

      ignores = Array.prototype.slice.call(doc.querySelectorAll(config.ignoreSelector));
      ignores.forEach(function (el) {
        el.addEventListener("mouseenter", onIgnoreEnter);
        el.addEventListener("mouseleave", onIgnoreLeave);
      });
    }

    function unbind() {
      areas.forEach(function (area) {
        area.removeEventListener("mousemove", handleMove);
      });
      ignores.forEach(function (el) {
        el.removeEventListener("mouseenter", onIgnoreEnter);
        el.removeEventListener("mouseleave", onIgnoreLeave);
      });
      areas = [];
      ignores = [];
      hoveringIgnore = false;
      bound = false;
    }

    function applyReducedMotion(next) {
      reduced = next;
      if (reduced) {
        unbind();
        reset();
        layer.hidden = true;
      } else {
        layer.hidden = false;
        reset();
        build();
        bind();
      }
      notify();
    }

    function onMediaChange(event) {
      applyReducedMotion(event.matches);
    }

    if (media) {
      if (typeof media.addEventListener === "function") {
        media.addEventListener("change", onMediaChange);
      } else if (typeof media.addListener === "function") {
        media.addListener(onMediaChange);
      }
    }

    if (reduced) {
      layer.hidden = true;
      build();
    } else {
      build();
      bind();
    }

    return {
      destroy: function () {
        if (destroyed) return;
        destroyed = true;
        unbind();
        reset();
        layer.remove();
        if (media) {
          if (typeof media.removeEventListener === "function") {
            media.removeEventListener("change", onMediaChange);
          } else if (typeof media.removeListener === "function") {
            media.removeListener(onMediaChange);
          }
        }
      },
      setPaused: function (value) {
        paused = !!value;
        notify();
      },
      isReduced: function () {
        return reduced;
      },
      getState: getState,
    };
  }

  global.createCursorTrail = createCursorTrail;
})(window);
