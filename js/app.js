/**
 * MAIN APPLICATION ENTRY POINT & EVENT COORDINATOR
 * Ties together:
 * - Canvas & Window resizing
 * - Dual-layer pointer management:
 *     - If mouse/touch is over lamp or slingshot, canvas has pointer-events: auto.
 *     - Otherwise, canvas has pointer-events: none so desktop windows have 100% native clicks, dragging & scrolling!
 * - Slingshot horizontal slider positioning
 * - Pebble collision interactions with desktop icons & windows
 * - Fixed-timestep requestAnimationFrame game loop
 */

(function () {
  const STEP = 1 / 120;
  let canvas;
  let switchEl;
  let resetBtn;
  let soundBtn;
  let stateEl;
  let shotsEl;
  let bulbsEl;
  let hitsEl;
  let slingSlider;

  // Challenge: break the bulb with 3 glass hits within 5 shots
  const CH_HITS = 3, CH_SHOTS = 5;
  let chBaseShots = 0;      // shots counter for the current 5-shot round
  let chBulbBaseShots = 0;  // shots fired since this bulb was installed (for the win message)
  let chWasBroken = false;
  let chEls = null;

  let W = 0, H = 0, DPR = 1;
  let lastTime = performance.now();
  let accT = 0;
  let switchRect = null;

  // Initial startup
  window.addEventListener("DOMContentLoaded", () => {
    initDOMElements();
    initEngines();
    setupEventListeners();
    handleResize();

    // Start with switch OFF for the dramatic atmospheric reveal!
    PhysicsEngine.setSwitch(false);
    chReset();
    syncUI();

    requestAnimationFrame(loop);
  });

  function initDOMElements() {
    canvas = document.getElementById("mainCanvas");
    switchEl = document.getElementById("wallSwitch");
    resetBtn = document.getElementById("replaceBulbBtn");
    soundBtn = document.getElementById("soundToggleBtn");
    stateEl = document.getElementById("hudState");
    shotsEl = document.getElementById("hudShots");
    bulbsEl = document.getElementById("hudBulbs");
    hitsEl = document.getElementById("hudHits");
    slingSlider = document.getElementById("slingSlider");
    chEls = {
      hits: document.getElementById("chHits"),
      shots: document.getElementById("chShots"),
      hitsBar: document.getElementById("chHitsBar"),
      shotsBar: document.getElementById("chShotsBar"),
      msg: document.getElementById("chMsg")
    };
  }

  /* ---------------------------------------------------------------
   * CHALLENGE
   * - Shots refill to 0/5 the moment the 5th shot is fired.
   * - Hits follow the glass: they stay at 1 or 2 across rounds and
   *   only go back to 0 once the bulb bursts.
   * --------------------------------------------------------------- */
  function chReset() {
    const P = PhysicsEngine;
    chBaseShots = P.stats.shots;
    chBulbBaseShots = P.stats.shots;
    if (chEls && chEls.msg) { chEls.msg.textContent = ""; chEls.msg.className = "hud-challenge-msg"; }
  }

  function updateChallenge() {
    if (!chEls || !chEls.hits) return;
    const P = PhysicsEngine, L = P.light;

    if (chWasBroken && !L.broken) chReset(); // bulb replaced -> fresh start
    if (!chWasBroken && L.broken) {
      const total = Math.max(1, P.stats.shots - chBulbBaseShots);
      chEls.msg.textContent = "Bulb broken in " + total + (total === 1 ? " shot!" : " shots!");
      chEls.msg.className = "hud-challenge-msg win";
    }
    chWasBroken = L.broken;

    // 5th shot fired: shots refill right away (the pebble in flight can still hit)
    if (!L.broken && P.stats.shots - chBaseShots >= CH_SHOTS) {
      chBaseShots = P.stats.shots;
    }

    const shots = Math.max(0, Math.min(CH_SHOTS, P.stats.shots - chBaseShots));
    // hits = cracks on the glass; back to 0 once the bulb has burst
    const hits = L.broken ? 0 : Math.max(0, Math.min(CH_HITS, L.cracks));

    chEls.hits.textContent = hits + "/" + CH_HITS;
    chEls.shots.textContent = shots + "/" + CH_SHOTS;
    chEls.hitsBar.style.width = (hits / CH_HITS) * 100 + "%";
    chEls.shotsBar.style.width = (shots / CH_SHOTS) * 100 + "%";
  }

  function initEngines() {
    LightingEngine.init(canvas);
    DesktopManager.init();

    // Wire physics event hooks
    PhysicsEngine.setHooks({
      onSwitchToggle: (on, fromPebble) => {
        switchEl.setAttribute("aria-checked", String(on));
        if (fromPebble) {
          knockSwitchPlate(1, 0.5);
        }
        syncUI();
      },
      onBulbPop: () => {
        syncUI();
      },
      onElementHit: (elem, pebble) => {
        const appBtn = elem.closest("[data-app]");
        if (appBtn) {
          const appId = appBtn.getAttribute("data-app");
          DesktopManager.openApp(appId);
        } else if (elem.classList.contains("app-window") || elem.closest(".app-window")) {
          const win = elem.closest(".app-window") || elem;
          DesktopManager.nudgeWindow(win);
        }
        syncUI();
      },
      onStateChange: () => {
        syncUI();
      }
    });
  }

  function handleResize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;

    LightingEngine.resize(W, H, DPR);
    PhysicsEngine.resize(W, H);

    if (slingSlider) {
      slingSlider.max = W - 80;
      slingSlider.value = PhysicsEngine.sling.x;
    }

    updateSwitchRect();
  }

  function updateSwitchRect() {
    if (!switchEl) return;
    const r = switchEl.getBoundingClientRect();
    switchRect = {
      left: r.left,
      right: r.right,
      top: r.top,
      bottom: r.bottom
    };
  }

  function knockSwitchPlate(nx = 1, ny = 0) {
    if (!switchEl) return;
    switchEl.style.setProperty("--kx", `${-nx * 7}px`);
    switchEl.style.setProperty("--ky", `${-ny * 7}px`);
    switchEl.style.setProperty("--kr", `${(Math.random() - 0.5) * 8}deg`);
    switchEl.classList.remove("knock");
    void switchEl.offsetWidth; // reflow
    switchEl.classList.add("knock");
  }

  function syncUI() {
    const { light, stats } = PhysicsEngine;
    if (resetBtn) {
      resetBtn.hidden = !light.broken;
    }
    if (shotsEl) shotsEl.textContent = stats.shots;
    if (bulbsEl) bulbsEl.textContent = stats.bulbs;
    if (hitsEl) hitsEl.textContent = stats.hits;

    if (stateEl) {
      if (light.broken) {
        stateEl.textContent = light.on ? "blown (switch on)" : "blown";
        stateEl.style.color = "#ff6b6b";
      } else {
        stateEl.textContent = light.on ? "on" : "off";
        stateEl.style.color = light.on ? "#ffcc80" : "#888";
      }
    }
  }

  function setupEventListeners() {
    window.addEventListener("resize", handleResize);

    // Global pointer move to dynamically toggle canvas pointer-events
    window.addEventListener("pointermove", (e) => {
      PhysicsEngine.mouse.x = e.clientX;
      PhysicsEngine.mouse.y = e.clientY;

      const currentGrab = PhysicsEngine.getGrab();
      if (currentGrab) {
        canvas.style.pointerEvents = "auto";
        return;
      }

      const hover = PhysicsEngine.hitTest(e.clientX, e.clientY, H);
      if (hover) {
        canvas.style.pointerEvents = "auto";
        canvas.style.cursor = hover.type === "slingBase" ? "ew-resize" : "grab";
      } else {
        canvas.style.pointerEvents = "none";
        canvas.style.cursor = "default";
      }
    });

    // Canvas pointerdown for lamp or slingshot
    canvas.addEventListener("pointerdown", (e) => {
      SoundEngine.resume();
      PhysicsEngine.mouse.x = e.clientX;
      PhysicsEngine.mouse.y = e.clientY;

      const grab = PhysicsEngine.hitTest(e.clientX, e.clientY, H);
      if (!grab) return;

      PhysicsEngine.setGrab(grab);
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
      canvas.style.pointerEvents = "auto";
    });

    function releasePointer() {
      const grab = PhysicsEngine.getGrab();
      if (grab && grab.type === "pouch") {
        PhysicsEngine.shootPebble();
        PhysicsEngine.sling.creakAt = 0;
      }
      PhysicsEngine.setGrab(null);
      canvas.style.cursor = "default";

      // Re-evaluate hover
      const hover = PhysicsEngine.hitTest(PhysicsEngine.mouse.x, PhysicsEngine.mouse.y, H);
      canvas.style.pointerEvents = hover ? "auto" : "none";
    }

    canvas.addEventListener("pointerup", releasePointer);
    canvas.addEventListener("pointercancel", releasePointer);

    // Slingshot horizontal position slider track
    if (slingSlider) {
      slingSlider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        PhysicsEngine.setSlingshotX(val, W);
      });
    }

    // Wall switch interactions
    switchEl.addEventListener("click", () => {
      SoundEngine.resume();
      PhysicsEngine.setSwitch(!PhysicsEngine.light.on);
    });

    switchEl.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        SoundEngine.resume();
        PhysicsEngine.setSwitch(!PhysicsEngine.light.on);
      }
    });

    // Replace bulb button
    resetBtn.addEventListener("click", () => {
      PhysicsEngine.replaceBulb();
    });

    // Sound toggle button
    soundBtn.addEventListener("click", () => {
      const muted = SoundEngine.toggleMute();
      soundBtn.textContent = muted ? "sound: off" : "sound: on";
      soundBtn.setAttribute("aria-label", muted ? "Sound is off" : "Sound is on");
    });

    // Global keyboard shortcuts
    window.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.key === "r" || e.key === "R") {
        if (PhysicsEngine.light.broken) {
          PhysicsEngine.replaceBulb();
        }
      } else if (e.key === "m" || e.key === "M") {
        const muted = SoundEngine.toggleMute();
        soundBtn.textContent = muted ? "sound: off" : "sound: on";
      } else if (e.key === " " || e.key === "Enter") {
        if (document.activeElement !== switchEl) {
          PhysicsEngine.setSwitch(!PhysicsEngine.light.on);
        }
      }
    });
  }

  // Main fixed-timestep animation loop
  function loop(now) {
    updateSwitchRect();

    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    accT += dt;

    while (accT >= STEP) {
      PhysicsEngine.step(STEP, W, H, switchRect);
      accT -= STEP;
    }

    PhysicsEngine.updateWorld(dt, W, H);
    PhysicsEngine.updateLight(dt);
    updateChallenge();

    // Keep slider in sync if slingshot base was dragged
    if (slingSlider && PhysicsEngine.getGrab() && PhysicsEngine.getGrab().type === "slingBase") {
      slingSlider.value = PhysicsEngine.sling.x;
    }

    LightingEngine.render(PhysicsEngine, dt);

    requestAnimationFrame(loop);
  }
})();