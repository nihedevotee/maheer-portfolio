/**
 * LIGHTING & RENDERING ENGINE
 * Handles:
 * 1. Double-buffered canvas volumetric cone & radial glow rendering
 * 2. Visual rendering of the hanging lamp (cord, collar, shade, filament, bulb)
 * 3. Visual rendering of the slingshot (wooden fork, leather pouch, bands, trajectory preview)
 * 4. Shard and spark rendering
 * 5. Floating ambient dust particles inside the light cone
 * 6. Dynamic DOM lighting synchronization via CSS custom properties
 */

window.LightingEngine = (function () {
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (c1, c2, t) => c1.map((v, i) => Math.round(lerp(v, c2[i], t)));
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  const LIGHT_SCALE = 0.25;

  let canvas, ctx;
  let glow, gctx;
  let dark, dctx;
  let W = 0, H = 0, DPR = 1;

  // Floating dust motes inside the light cone
  let dustMotes = [];
  const NUM_MOTES = 0; // dust is handled by dust.js

  function init(mainCanvas) {
    canvas = mainCanvas;
    ctx = canvas.getContext("2d");

    glow = document.createElement("canvas");
    gctx = glow.getContext("2d");

    dark = document.createElement("canvas");
    dctx = dark.getContext("2d");

    // Initialize dust motes
    dustMotes = [];
    for (let i = 0; i < NUM_MOTES; i++) {
      dustMotes.push({
        x: Math.random(),
        y: Math.random(),
        r: 0.8 + Math.random() * 1.6,
        spX: (Math.random() - 0.5) * 0.04,
        spY: 0.02 + Math.random() * 0.05,
        alpha: 0.2 + Math.random() * 0.6,
        phase: Math.random() * TAU
      });
    }
  }

  function resize(newW, newH, newDPR) {
    W = newW;
    H = newH;
    DPR = newDPR;

    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);

    glow.width = dark.width = Math.ceil(W * LIGHT_SCALE);
    glow.height = dark.height = Math.ceil(H * LIGHT_SCALE);
  }

  // Render the volumetric cone and darkness mask
  function renderLight(physics) {
    const { lamp, light, toWorld, BULB_LOCAL } = physics;
    const I = clamp(light.I, 0, 1);

    gctx.setTransform(1, 0, 0, 1, 0, 0);
    gctx.clearRect(0, 0, glow.width, glow.height);

    if (I > 0.002) {
      gctx.setTransform(LIGHT_SCALE, 0, 0, LIGHT_SCALE, 0, 0);
      gctx.filter = "blur(6px)";

      const apex = toWorld(0, 2);
      const rl = toWorld(-70, 62);
      const rr = toWorld(70, 62);
      const far = Math.max(W, H) * 2.6;

      const nl = Math.hypot(rl.x - apex.x, rl.y - apex.y);
      const nr = Math.hypot(rr.x - apex.x, rr.y - apex.y);
      const dl = { x: (rl.x - apex.x) / nl, y: (rl.y - apex.y) / nl };
      const dr = { x: (rr.x - apex.x) / nr, y: (rr.y - apex.y) / nr };

      const b = toWorld(BULB_LOCAL[0], BULB_LOCAL[1]);
      const reach = Math.max(W, H) * 1.15;

      // Neutral conical beam (grayscale, matching reference lighting)
      const grd = gctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, reach);
      grd.addColorStop(0, `rgba(238, 238, 235, ${I * 0.95})`);
      grd.addColorStop(0.35, `rgba(214, 214, 211, ${I * 0.82})`);
      grd.addColorStop(0.7, `rgba(150, 150, 149, ${I * 0.35})`);
      grd.addColorStop(1, "rgba(150, 150, 149, 0)");

      gctx.fillStyle = grd;
      gctx.beginPath();
      gctx.moveTo(rl.x, rl.y);
      gctx.lineTo(rr.x, rr.y);
      gctx.lineTo(rr.x + dr.x * far, rr.y + dr.y * far);
      gctx.lineTo(rl.x + dl.x * far, rl.y + dl.y * far);
      gctx.closePath();
      gctx.fill();

      // Soft ambient bulb halo (neutral)
      const halo = gctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 140);
      halo.addColorStop(0, `rgba(226, 226, 223, ${I * 0.55})`);
      halo.addColorStop(0.6, `rgba(196, 196, 193, ${I * 0.22})`);
      halo.addColorStop(1, "rgba(196, 196, 193, 0)");
      gctx.fillStyle = halo;
      gctx.fillRect(b.x - 140, b.y - 140, 280, 280);

      gctx.filter = "none";
    }

    // Render darkness mask with destination-out
    dctx.setTransform(1, 0, 0, 1, 0, 0);
    dctx.globalCompositeOperation = "source-over";
    dctx.clearRect(0, 0, dark.width, dark.height);

    // Deep atmospheric ambient room darkness
    dctx.fillStyle = `rgba(5, 7, 9, ${0.985 - I * 0.12})`;
    dctx.fillRect(0, 0, dark.width, dark.height);

    if (I > 0.002) {
      dctx.globalCompositeOperation = "destination-out";
      dctx.drawImage(glow, 0, 0);
      dctx.globalCompositeOperation = "source-over";
    }

    // Blit darkness mask to main canvas
    ctx.drawImage(dark, 0, 0, W, H);

    // Subtle neutral bloom over illuminated areas
    if (I > 0.002) {
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.16;
      ctx.drawImage(glow, 0, 0, W, H);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    // Update CSS variables on document for seamless DOM illumination
    const bWorld = toWorld(BULB_LOCAL[0], BULB_LOCAL[1]);
    document.documentElement.style.setProperty("--light-cx", `${bWorld.x}px`);
    document.documentElement.style.setProperty("--light-cy", `${bWorld.y}px`);
    document.documentElement.style.setProperty("--light-intensity", I.toFixed(3));
    document.documentElement.style.setProperty("--light-angle", `${lamp.theta}rad`);
    document.documentElement.style.setProperty("--light-broken", light.broken ? "1" : "0");
  }

  // Draw light bulb and filament
  function drawBulb(physics, I) {
    const { light, BULB_LOCAL, BULB_R } = physics;
    const [bx, by] = BULB_LOCAL;

    if (light.broken) {
      ctx.fillStyle = "rgba(200, 220, 235, 0.08)";
      ctx.strokeStyle = "rgba(220, 232, 245, 0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      const jag = [
        [-10, 60], [-11, 67], [-8, 64], [-6, 71],
        [-3, 65], [0, 69], [3, 64], [6, 72],
        [8, 65], [11, 68], [10, 60]
      ];
      jag.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Jagged broken filament remnants
      ctx.strokeStyle = "rgba(130, 115, 95, 0.85)";
      ctx.beginPath();
      ctx.moveTo(-3, 60);
      ctx.lineTo(-5, 70);
      ctx.lineTo(-9, 73);
      ctx.moveTo(3, 60);
      ctx.lineTo(6, 69);
      ctx.lineTo(4, 76);
      ctx.stroke();
      return;
    }

    // Intact glowing glass bulb
    const heatTint = clamp((light.heat - 2) / 2.5, 0, 1);
    const gg = ctx.createRadialGradient(bx, by + 2, 0, bx, by, 17);
    gg.addColorStop(0, rgba(mix([255, 246, 225], [255, 255, 248], heatTint), 0.06 + 0.92 * I));
    gg.addColorStop(0.55, rgba([255, 210, 145], 0.04 + 0.62 * I));
    gg.addColorStop(1, rgba([255, 170, 95], 0.07 + 0.3 * I));
    ctx.fillStyle = gg;
    ctx.beginPath();
    ctx.arc(bx, by, BULB_R, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = `rgba(255, 255, 255, ${0.16 + 0.25 * I})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Lead wires
    ctx.strokeStyle = "rgba(175, 162, 145, 0.55)";
    ctx.beginPath();
    ctx.moveTo(-3, 60);
    ctx.lineTo(-6, 76);
    ctx.moveTo(3, 60);
    ctx.lineTo(6, 76);
    ctx.stroke();

    // Tungsten coiled filament with glow
    const f = light.fil;
    ctx.save();
    ctx.strokeStyle = rgba(mix([96, 78, 56], [255, 246, 216], f), 1);
    ctx.lineWidth = 1.25;
    if (f > 0.03) {
      ctx.shadowColor = `rgba(255, 175, 85, ${f})`;
      ctx.shadowBlur = 14 * f;
    }
    ctx.beginPath();
    ctx.moveTo(-6, 76);
    for (let k = 1; k <= 10; k++) {
      const x = -6 + (12 * k) / 10;
      const sag = Math.sin((k / 10) * Math.PI) * 2.5;
      ctx.lineTo(x, 76 + sag + (k % 2 ? -1.4 : 1.4));
    }
    ctx.stroke();
    ctx.restore();

    // Specular glass highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.beginPath();
    ctx.ellipse(-7, 69, 2.2, 5, -0.5, 0, TAU);
    ctx.fill();
  }

  // Draw the entire hanging lamp — matte black cone pendant.
  // Silhouette matches the collision profile in physics.js (neck ±14, flaring to ±72 at y=62).
  function drawLamp(physics) {
    const { lamp, light, lampOrigin, toWorld, BULB_LOCAL } = physics;
    const o = lampOrigin();
    const I = clamp(light.I, 0, 1);

    // Matte black metal: soft vertical-edge shading, subtle highlight
    const brass = (x0, x1) => {
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, "#050505");
      g.addColorStop(0.3, "#23242a");
      g.addColorStop(0.45, "#2e3037");
      g.addColorStop(0.7, "#121316");
      g.addColorStop(1, "#050505");
      return g;
    };

    // Braided cloth cord
    const top = toWorld(0, -14);
    ctx.lineCap = "round";
    ctx.strokeStyle = "#151618";
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(lamp.ax, lamp.ay);
    ctx.lineTo(top.x, top.y);
    ctx.stroke();
    ctx.save();
    ctx.setLineDash([2.5, 3.5]);
    ctx.strokeStyle = "#51545a";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(lamp.ax, lamp.ay);
    ctx.lineTo(top.x, top.y);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate(-lamp.theta);

    // Cord grommet + socket housing
    ctx.fillStyle = brass(-6, 6);
    ctx.beginPath(); ctx.roundRect(-6, -18, 12, 7, 2); ctx.fill();
    ctx.fillStyle = brass(-17, 17);
    ctx.beginPath(); ctx.roundRect(-17, -12, 34, 6, 3); ctx.fill();
    ctx.fillStyle = brass(-14, 14);
    ctx.beginPath(); ctx.roundRect(-14, -8, 28, 20, 3); ctx.fill();

    // Cone shade body (outer surface)
    const shade = new Path2D();
    shade.moveTo(-14, 12);
    shade.quadraticCurveTo(-45.6, 34, -72, 62);
    shade.ellipse(0, 62, 72, 8, 0, Math.PI, 0, true); // front lip curve
    shade.quadraticCurveTo(45.6, 34, 14, 12);
    shade.closePath();
    ctx.fillStyle = brass(-72, 72);
    ctx.fill(shade);

    // Clean, simple sheen on the shade
    ctx.save();
    ctx.clip(shade);
    const sheen = ctx.createLinearGradient(0, 12, 0, 70);
    sheen.addColorStop(0, "rgba(255, 255, 255, 0.07)");
    sheen.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(-80, 10, 160, 62);
    if (I > 0.01) { // warm light spilling over the lower shade
      const wl = ctx.createLinearGradient(0, 40, 0, 70);
      wl.addColorStop(0, "rgba(255, 190, 110, 0)");
      wl.addColorStop(1, `rgba(255, 190, 110, ${0.28 * I})`);
      ctx.fillStyle = wl;
      ctx.fillRect(-80, 40, 160, 32);
    }
    ctx.restore();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.stroke(shade);

    // Collar where the cone meets the housing
    ctx.fillStyle = brass(-16, 16);
    ctx.beginPath(); ctx.roundRect(-16, 9, 32, 5, 2); ctx.fill();

    // Inner reflector dish (the opening, lit when on)
    const ug = ctx.createRadialGradient(0, 64, 0, 0, 62, 72);
    ug.addColorStop(0, rgba(mix([30, 22, 12], [255, 238, 205], I), 1));
    ug.addColorStop(1, rgba(mix([12, 9, 5], [214, 140, 70], I), 1));
    ctx.fillStyle = ug;
    ctx.beginPath(); ctx.ellipse(0, 62, 70, 7, 0, 0, TAU); ctx.fill();

    // Socket
    ctx.fillStyle = brass(-7, 7);
    ctx.beginPath(); ctx.roundRect(-7, 52, 14, 11, 2); ctx.fill();

    drawBulb(physics, I);

    // Brass front lip
    const lip = ctx.createLinearGradient(-72, 0, 72, 0);
    lip.addColorStop(0, "#08080a");
    lip.addColorStop(0.4, "#3a3c44");
    lip.addColorStop(1, "#08080a");
    ctx.strokeStyle = lip;
    ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.ellipse(0, 62, 72, 8, 0, 0, Math.PI); ctx.stroke();
    ctx.strokeStyle = `rgba(255, 220, 170, ${0.06 + I * 0.3})`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(0, 62, 72, 8, 0, Math.PI, TAU); ctx.stroke();

    ctx.restore();

    // Immediate bulb flare
    if (I > 0.01) {
      const b = toWorld(BULB_LOCAL[0], BULB_LOCAL[1]);
      const h = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 85);
      h.addColorStop(0, `rgba(255, 205, 135, ${0.48 * I})`);
      h.addColorStop(1, "rgba(255, 205, 135, 0)");
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = h;
      ctx.fillRect(b.x - 85, b.y - 85, 170, 170);
      ctx.globalCompositeOperation = "source-over";
    }
  }

  // Draw single pebble
  function drawPebble(x, y, a, alpha = 1, PEBBLE_R = 7) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(a);
    const g = ctx.createRadialGradient(-2.5, -2.5, 0, 0, 0, PEBBLE_R + 1);
    g.addColorStop(0, "#b0aba2");
    g.addColorStop(0.6, "#706a63");
    g.addColorStop(1, "#36332f");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, PEBBLE_R + 0.8, PEBBLE_R - 0.8, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // Draw slingshot and aiming trajectory
  function drawSlingshot(physics) {
    const { sling, MAX_PULL, LAUNCH, PEBBLE_R, getGrab } = physics;
    const { x, y } = sling;
    const grab = getGrab();

    const tipL = { x: x - 28, y: y - 140 };
    const tipR = { x: x + 28, y: y - 140 };
    const p = sling.pouch;
    const aiming = grab && grab.type === "pouch";
    const stretch = clamp(Math.hypot(p.x - sling.rest.x, p.y - sling.rest.y) / MAX_PULL, 0, 1);
    const bandW = 4 - stretch * 2;

    // Left elastic band
    ctx.lineCap = "round";
    ctx.strokeStyle = "#823226";
    ctx.lineWidth = bandW;
    ctx.beginPath();
    ctx.moveTo(tipL.x, tipL.y);
    ctx.lineTo(p.x - 6, p.y);
    ctx.stroke();

    // Wooden handle & fork with rich grain gradient
    const wood = ctx.createLinearGradient(x - 30, 0, x + 30, 0);
    wood.addColorStop(0, "#3e2817");
    wood.addColorStop(0.45, "#8e5d36");
    wood.addColorStop(1, "#3b2515");
    ctx.strokeStyle = wood;
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(x, y + 4);
    ctx.lineTo(x, y - 72);
    ctx.quadraticCurveTo(x - 4, y - 96, tipL.x, tipL.y);
    ctx.moveTo(x, y - 72);
    ctx.quadraticCurveTo(x + 4, y - 96, tipR.x, tipR.y);
    ctx.stroke();

    // Wooden highlight ridge
    ctx.strokeStyle = "rgba(255, 225, 185, 0.15)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 2, y);
    ctx.lineTo(x - 2, y - 70);
    ctx.stroke();

    // Fork tip leather attachments
    ctx.fillStyle = "#2d1c10";
    for (const t of [tipL, tipR]) {
      ctx.beginPath();
      ctx.ellipse(t.x, t.y, 6, 3, 0, 0, TAU);
      ctx.fill();
    }

    // Base slider track hint
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.fillRect(x - 35, y - 10, 70, 6);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 35, y - 10, 70, 6);

    // Aiming trajectory prediction dots
    if (aiming) {
      const vx = (sling.rest.x - p.x) * LAUNCH;
      const vy = (sling.rest.y - p.y) * LAUNCH;
      ctx.fillStyle = "#f0eae0";
      for (let i = 1; i <= 10; i++) {
        const t = i * 0.035;
        ctx.globalAlpha = 0.55 * (1 - i / 11);
        ctx.beginPath();
        ctx.arc(p.x + vx * t, p.y + vy * t + 0.5 * 1550 * t * t, 2.2, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Leather pouch
    ctx.fillStyle = "#4e2f1e";
    ctx.beginPath();
    ctx.ellipse(
      p.x,
      p.y,
      11,
      7,
      Math.atan2(p.y - sling.rest.y, p.x - sling.rest.x),
      0,
      TAU
    );
    ctx.fill();

    // Loaded pebble in pouch
    if (sling.loaded) {
      drawPebble(p.x, p.y, 0, 1, PEBBLE_R);
    }

    // Right elastic band
    ctx.strokeStyle = "#94392a";
    ctx.lineWidth = bandW;
    ctx.beginPath();
    ctx.moveTo(tipR.x, tipR.y);
    ctx.lineTo(p.x + 6, p.y);
    ctx.stroke();
  }

  // Draw the pebble while it's actually flying — bigger, glowing, with a short
  // motion trail so it reads clearly against the dark room instead of being
  // a tiny flat-gray dot that disappears the instant it moves.
  function drawFlyingPebble(x, y, a, vx, vy, alpha, PEBBLE_R) {
    const R = PEBBLE_R * 1.4; // slightly bigger than the loaded pebble, visually only

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    // Short motion streak behind the ball, proportional to speed
    const speed = Math.hypot(vx, vy);
    if (speed > 30) {
      const tx = x - vx * 0.035;
      const ty = y - vy * 0.035;
      const grad = ctx.createLinearGradient(x, y, tx, ty);
      grad.addColorStop(0, `rgba(255, 248, 235, ${0.55 * alpha})`);
      grad.addColorStop(1, "rgba(255, 248, 235, 0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = R * 1.1;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
    }

    // Soft glow halo so it pops even in a fully dark room
    const glowR = R * 3;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, glowR);
    glow.addColorStop(0, `rgba(255, 250, 235, ${0.55 * alpha})`);
    glow.addColorStop(1, "rgba(255, 250, 235, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, glowR, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Solid body
    drawPebble(x, y, a, alpha, R);

    // Bright rim so its edge stays crisp against dark or busy backgrounds
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(x, y, R + 0.6, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  // Draw active flying pebbles, glass shards, and sparks
  function drawParticles(physics) {
    const { pebbles, shards, sparks, PEBBLE_R } = physics;

    // Flying pebbles — visible for their whole flight
    for (const p of pebbles) {
      drawFlyingPebble(p.x, p.y, p.a, p.vx, p.vy, clamp(p.life, 0, 1), PEBBLE_R);
    }

    for (const s of shards) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.a);
      ctx.fillStyle = "rgba(215, 230, 245, 0.18)";
      ctx.strokeStyle = "rgba(235, 242, 252, 0.55)";
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      s.poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    if (!sparks.length) return;
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    for (const p of sparks) {
      const t = clamp(p.life / p.max, 0, 1);
      ctx.strokeStyle = `rgba(255, ${Math.round(155 + 90 * t)}, ${Math.round(80 * t)}, ${t})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 0.012, p.y - p.vy * 0.012);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
  }

  // Main render pass
  function render(physics, dt) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    renderLight(physics);
    drawLamp(physics);
    drawSlingshot(physics);
    drawParticles(physics);

    // Temporary flash when bulb explodes
    if (physics.light.flash > 0) {
      ctx.fillStyle = `rgba(255, 238, 205, ${physics.light.flash * 0.5})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  return {
    init,
    resize,
    render
  };
})();