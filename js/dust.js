/**
 * DUST MOTES — floating dust, visible only while the lamp is on.
 * Realistic look: soft, slightly out-of-focus specks at different depths,
 * drifting on slow air currents. Brightest near the bulb, fading with distance.
 * A few motes are shinier: they slowly tumble and catch the light, brightening
 * and dimming smoothly (no flashes, no star shapes).
 */
(function () {
  const cv = document.createElement("canvas");
  cv.id = "dustCanvas";
  cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:12;";
  document.body.appendChild(cv);
  const ctx = cv.getContext("2d");
  let W = 0, H = 0, dpr = 1;
  const N = 235;
  const SHINY_SHARE = 0.14; // ~14% of motes are reflective
  const FALL_SHARE = 0.7;   // ~70% of motes fall, the rest float
  const TAU = 6.283185;
  const motes = [];

  // Pre-rendered soft sprites (much cheaper than a gradient per mote per frame)
  function makeSprite(r, g, b, core) {
    const s = 64, c = document.createElement("canvas");
    c.width = c.height = s;
    const x = c.getContext("2d");
    const gr = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gr.addColorStop(0, `rgba(${r},${g},${b},1)`);
    gr.addColorStop(core, `rgba(${r},${g},${b},0.75)`);
    gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
    x.fillStyle = gr;
    x.fillRect(0, 0, s, s);
    return c;
  }
  const warm = makeSprite(255, 224, 168, 0.35);  // normal dust, warm lamp colour
  const bright = makeSprite(255, 246, 225, 0.25); // light catching a flake

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Radius of the lit zone around the bulb where dust is visible
  function litRadius() {
    return Math.max(240, Math.min(470, Math.min(W, H) * 0.6));
  }

  // The light spreads down into a wide cone, so the dusty zone reaches
  // further below the bulb than above it.
  const DOWN = 1.7;
  function lightDist(x, y, b, R) {
    let dy = y - b.y;
    if (dy > 0) dy /= DOWN;
    return Math.hypot(x - b.x, dy) / R;
  }

  function spawn(m, b) {
    const R = litRadius();
    const cx = b ? b.x : W / 2, cy = b ? b.y : H * 0.3;
    for (let tries = 0; tries < 6; tries++) {
      const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * R * 1.05;
      let oy = Math.sin(a) * d;
      if (oy > 0) oy *= DOWN; // stretch the lower half into the cone
      m.x = cx + Math.cos(a) * d;
      m.y = cy + oy;
      if (m.y < H - 8) break; // keep new motes on screen
    }
    m.age = 0;
    // depth: 0 = far (small, dim, slow), 1 = near (bigger, softer, a bit faster)
    m.z = Math.pow(Math.random(), 1.6);
    m.shiny = Math.random() < SHINY_SHARE;
    m.r = (0.5 + m.z * 1.5) * (m.shiny ? 1.15 : 1);
    const speed = 0.5 + m.z * 0.9;
    // most motes visibly fall; the rest hang and float in the air
    m.faller = Math.random() < FALL_SHARE;
    m.vx = (Math.random() - 0.5) * (m.faller ? 2 : 3) * speed;
    m.vy = m.faller
      ? (7 + Math.random() * 14) * speed        // falling: steady downward drift
      : (-1.5 + Math.random() * 3) * speed;      // floating: hovers, can rise a little
    m.ph = Math.random() * TAU;          // drift/shimmer phase
    m.sp = 0.15 + Math.random() * 0.35;  // slow wander
    m.tp = Math.random() * TAU;          // tumble angle (for glints)
    m.ts = 0.35 + Math.random() * 0.8;   // tumble speed
    m.base = 0.35 + m.z * 0.5;           // base brightness
    return m;
  }

  addEventListener("resize", resize);
  resize();
  for (let i = 0; i < N; i++) {
    const m = spawn({}, null);
    m.age = 10; // no fade-in for the initial batch
    motes.push(m);
  }

  let last = performance.now(), fade = 0, T = 0;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    T += dt;
    const L = window.PhysicsEngine && PhysicsEngine.light;
    const on = L && L.on && !L.broken;
    fade += ((on ? 1 : 0) - fade) * (1 - Math.exp(-3 * dt));

    ctx.clearRect(0, 0, W, H);
    if (fade > 0.01) {
      const b = PhysicsEngine.toWorld(PhysicsEngine.BULB_LOCAL[0], PhysicsEngine.BULB_LOCAL[1]);
      const R = litRadius();
      for (const m of motes) {
        m.ph += dt * m.sp;
        m.tp += dt * m.ts;
        m.age += dt;

        // gentle, slowly changing air currents (varies with position and time)
        const wx = Math.sin(T * 0.21 + m.y * 0.009 + m.ph) * 4 + Math.sin(T * 0.11 + m.x * 0.006) * 2.5;
        const wy = Math.sin(T * 0.17 + m.x * 0.008 + m.ph * 1.3) * 2.5;
        m.x += (m.vx + wx) * dt;
        m.y += (m.vy + wy) * dt;

        let d = lightDist(m.x, m.y, b, R);
        // Drifted out of the light (or lamp swung away): respawn inside the lit area
        if (d > 1.1 || m.y > H + 4) { spawn(m, b); d = lightDist(m.x, m.y, b, R); }

        const falloff = Math.pow(Math.max(0, 1 - d), 1.3);
        const fadeIn = Math.min(1, m.age / 1.5);
        // soft, slow natural shimmer as the speck drifts through the beam
        const shimmer = 0.75 + 0.25 * Math.sin(m.ph * 2.3);
        const a = falloff * fadeIn * fade * m.base * shimmer;
        if (a <= 0.008) continue;

        // body of the mote: a soft, slightly blurry speck
        const size = m.r * (2.6 + (1 - m.z) * 0.4);
        ctx.globalAlpha = Math.min(1, a);
        ctx.drawImage(warm, m.x - size, m.y - size, size * 2, size * 2);

        // shiny motes: a flake slowly rotating into the light and back out.
        // Smooth rise and fall (several seconds), only a modest brightening.
        if (m.shiny) {
          const s = Math.max(0, Math.sin(m.tp));
          const glint = s * s * s; // eased, no sudden flash
          if (glint > 0.02) {
            const ga = falloff * fadeIn * fade * glint * 0.85;
            const gs = m.r * (1.8 + glint * 1.4);
            ctx.globalAlpha = Math.min(1, ga);
            ctx.drawImage(bright, m.x - gs, m.y - gs, gs * 2, gs * 2);
          }
        }
      }
      ctx.globalAlpha = 1;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();