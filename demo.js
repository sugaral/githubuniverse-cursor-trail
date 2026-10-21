/* 把 trail.js 接到页面控件上；无框架依赖。 */
(function () {
  "use strict";

  var root = document.documentElement;

  var gridSelect = document.getElementById("grid-size");
  var gridValue = document.getElementById("grid-value");
  var poolRange = document.getElementById("pool-size");
  var poolValue = document.getElementById("pool-value");
  var pauseToggle = document.getElementById("pause");
  var overlayToggle = document.getElementById("grid-overlay");
  var resetButton = document.getElementById("reset");
  var reducedNote = document.getElementById("reduced-motion-note");
  var spawnedOut = document.getElementById("stat-spawned");
  var activeOut = document.getElementById("stat-active");

  var trail = null;

  function renderStats(state) {
    spawnedOut.textContent = String(state.spawned);
    activeOut.textContent = String(state.active);
    activeOut.classList.toggle("is-live", state.active > 0);
  }

  function mount() {
    var grid = Number(gridSelect.value);
    var pool = Number(poolRange.value);

    if (trail) trail.destroy();

    root.style.setProperty("--trail-grid", grid + "px");

    trail = window.createCursorTrail({
      grid: grid,
      pool: pool,
      onChange: renderStats,
    });
    trail.setPaused(pauseToggle.checked);
    renderStats(trail.getState());

    reducedNote.hidden = !trail.isReduced();
  }

  gridSelect.addEventListener("change", function () {
    gridValue.textContent = gridSelect.value + " px";
    mount();
  });

  poolRange.addEventListener("input", function () {
    poolValue.textContent = poolRange.value;
  });

  poolRange.addEventListener("change", mount);

  pauseToggle.addEventListener("change", function () {
    if (trail) trail.setPaused(pauseToggle.checked);
  });

  overlayToggle.addEventListener("change", function () {
    document.body.classList.toggle("show-grid", overlayToggle.checked);
  });

  resetButton.addEventListener("click", mount);

  if (window.matchMedia) {
    var media = window.matchMedia("(prefers-reduced-motion: reduce)");
    var syncNote = function () {
      reducedNote.hidden = !media.matches;
    };
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", syncNote);
    }
  }

  gridValue.textContent = gridSelect.value + " px";
  poolValue.textContent = poolRange.value;
  mount();
})();
