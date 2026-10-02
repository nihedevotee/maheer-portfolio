/**
 * DUST MOTES — floating dust, visible only while the lamp is on.
 * Brightest near the bulb, fading out with distance.
 */
(function () {
  const cv = document.createElement("canvas");
  cv.id = "dustCanvas";
  cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:12;";
  document.body.appendChild(cv);
  const ctx = cv.getContext("2d");
  let W = 0, H = 0, dpr = 1;
  const N = 140;
  const motes = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn(m) {
    m.x = Math.random() * W;
    m.y = Math.random() * H;
    m.r = 0.6 + Math.random() * 1.6;
    m.vx = (Math.random() - 0.5) * 8;
    m.vy = 2 + Math.random() * 6;
    m.ph = Math.random() * 6.283;
    m.sp = 0.4 + Math.random() * 0.8;
    return m;
  }

  addEventListener("resize", resize);
  resize();
  for (let i = 0; i < N; i++) motes.push(spawn({}));

  let last = performance.now(), fade = 0;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const L = window.PhysicsEngine && PhysicsEngine.light;
    const on = L && L.on && !L.broken;
    fade += ((on ? 1 : 0) - fade) * (1 - Math.exp(-3 * dt));

    ctx.clearRect(0, 0, W, H);
    if (fade > 0.01) {
      const b = PhysicsEngine.toWorld(PhysicsEngine.BULB_LOCAL[0], PhysicsEngine.BULB_LOCAL[1]);
      const R = Math.max(W, H) * 0.55;
      for (const m of motes) {
        m.ph += dt * m.sp;
        m.x += (m.vx + Math.sin(m.ph) * 6) * dt;
        m.y += m.vy * dt;
        if (m.y > H + 4 || m.x < -4 || m.x > W + 4) { spawn(m); m.y = -4; }
        const d = Math.hypot(m.x - b.x, m.y - b.y) / R;
        const a = Math.max(0, 1 - d) * (0.45 + 0.55 * Math.sin(m.ph * 2)) * fade;
        if (a <= 0.01) continue;
        ctx.fillStyle = "rgba(255,226,170," + (a * 0.75).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, 6.283);
        ctx.fill();
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();