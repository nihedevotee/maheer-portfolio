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

    // Keep slider in sync if slingshot base was dragged
    if (slingSlider && PhysicsEngine.getGrab() && PhysicsEngine.getGrab().type === "slingBase") {
      slingSlider.value = PhysicsEngine.sling.x;
    }

    LightingEngine.render(PhysicsEngine, dt);

    requestAnimationFrame(loop);
  }
})();