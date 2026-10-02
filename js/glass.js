/**
 * GLASS GLOBE — protective glass around the bulb, with cracks that grow
 * with each hit (physics.js bursts the bulb on the 3rd).
 */
(function () {
  const cv = document.createElement("canvas");
  cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:11;";
  document.body.appendChild(cv);
  const ctx = cv.getContext("2d");
  let W = 0, H = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  addEventListener("resize", resize);
  resize();

  // Deterministic jagged crack from the globe edge toward the middle
  function rnd(seed) {
    let t = seed * 9301 + 49297;
    return () => ((t = (t * 9301 + 49297) % 233280) / 233280);
  }

  function drawCrack(R, ang, idx) {
    const r = rnd(Math.floor((ang + 4) * 1000) + idx * 77);
    const path = (x, y, a, len, w, depth) => {
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(x, y);
      const steps = 5;
      for (let i = 0; i < steps; i++) {
        a += (r() - 0.5) * 0.9;
        x += Math.cos(a) * (len / steps);
        y += Math.sin(a) * (len / steps);
        ctx.lineTo(x, y);
        if (depth > 0 && r() < 0.45) path(x, y, a + (r() < 0.5 ? -1 : 1) * (0.6 + r() * 0.6), len * 0.45, w * 0.7, depth - 1);
      }
      ctx.stroke();
    };
    const sx = Math.cos(ang) * R, sy = Math.sin(ang) * R;
    path(sx, sy, ang + Math.PI, R * (1.2 + idx * 0.25), 1.4, 2);
  }

  function frame() {
    const P = window.PhysicsEngine;
    ctx.clearRect(0, 0, W, H);
    if (P && !P.light.broken) {
      const b = P.toWorld(P.BULB_LOCAL[0], P.BULB_LOCAL[1]);
      const R = P.GLASS_R;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(-P.lamp.theta);

      // glass body
      const g = ctx.createRadialGradient(-R * 0.35, -R * 0.4, R * 0.1, 0, 0, R);
      g.addColorStop(0, "rgba(255,255,255,0.16)");
      g.addColorStop(0.7, "rgba(190,220,255,0.05)");
      g.addColorStop(1, "rgba(190,220,255,0.14)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // highlight
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, R - 4, Math.PI * 1.1, Math.PI * 1.45); ctx.stroke();

      // cracks
      ctx.save();
      ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.clip();
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.shadowColor = "rgba(255,255,255,0.6)";
      ctx.shadowBlur = 3;
      ctx.lineCap = "round";
      P.light.crackPts.forEach((a, i) => drawCrack(R, a, i));
      ctx.restore();

      ctx.restore();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();