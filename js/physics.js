/**
 * PHYSICS SIMULATION ENGINE
 * Handles:
 * 1. Hanging lamp harmonic pendulum simulation & impulse reactions
 * 2. Slingshot with movable horizontal base & elastic pouch mechanics
 * 3. Pebble kinematics & multi-object collision resolution (lamp, bulb, switch, windows/icons)
 * 4. Glass shard dynamics and spark particle emitters
 */

window.PhysicsEngine = (function () {
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (c1, c2, t) => c1.map((v, i) => Math.round(lerp(v, c2[i], t)));
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  // Physics constants
  const G = 2600;
  const PEBBLE_G = 1550;
  const BULB_LOCAL = [0, 74];
  const BULB_R = 17;
  const PEBBLE_R = 7;
  const MAX_PULL = 145;
  const LAUNCH = 13.0;

  // Lamp state
  const lamp = {
    ax: 0,
    ay: -10,
    len: 260,
    theta: 0.05,
    omega: 0
  };

  // Light & Bulb state
  const light = {
    on: true,
    I: 1,
    fil: 1,
    heat: 0,
    warm: 0,
    popT: 0,
    broken: false,
    flash: 0
  };

  // Slingshot state (movable base across screen)
  const sling = {
    x: 160,
    y: 0,
    baseY: 0,
    rest: { x: 160, y: 0 },
    pouch: { x: 160, y: 0 },
    vel: { x: 0, y: 0 },
    loaded: true,
    reloadT: 0,
    creakAt: 0,
    creakCd: 0,
    isDraggingBase: false
  };

  // Collections
  let pebbles = [];
  let shards = [];
  let sparks = [];

  // Interaction grab tracker
  let grab = null;
  const mouse = { x: -999, y: -999 };

  // Statistics
  const stats = {
    shots: 0,
    bulbs: 0,
    hits: 0
  };

  // Callback hooks
  let onSwitchToggle = null;
  let onBulbPop = null;
  let onElementHit = null;
  let onStateChange = null;

  function setHooks(hooks) {
    if (hooks.onSwitchToggle) onSwitchToggle = hooks.onSwitchToggle;
    if (hooks.onBulbPop) onBulbPop = hooks.onBulbPop;
    if (hooks.onElementHit) onElementHit = hooks.onElementHit;
    if (hooks.onStateChange) onStateChange = hooks.onStateChange;
  }

  // Coordinate transforms for pendulum
  function lampOrigin() {
    return {
      x: lamp.ax + Math.sin(lamp.theta) * lamp.len,
      y: lamp.ay + Math.cos(lamp.theta) * lamp.len
    };
  }

  function toWorld(lx, ly) {
    const o = lampOrigin();
    const c = Math.cos(lamp.theta);
    const s = Math.sin(lamp.theta);
    return {
      x: o.x + lx * c + ly * s,
      y: o.y - lx * s + ly * c
    };
  }

  function toLocal(wx, wy) {
    const o = lampOrigin();
    const c = Math.cos(lamp.theta);
    const s = Math.sin(lamp.theta);
    const dx = wx - o.x;
    const dy = wy - o.y;
    return {
      x: dx * c - dy * s,
      y: dx * s + dy * c
    };
  }

  function dirToWorld(nx, ny) {
    const c = Math.cos(lamp.theta);
    const s = Math.sin(lamp.theta);
    return {
      x: nx * c + ny * s,
      y: -nx * s + ny * c
    };
  }

  function kickLamp(px, py, fx, fy) {
    const rx = px - lamp.ax;
    const ry = py - lamp.ay;
    lamp.omega += (ry * fx - rx * fy) / (lamp.len * lamp.len);
  }

  function resize(W, H) {
    lamp.ax = W / 2;
    lamp.len = clamp(H * (W < 640 ? 0.26 : 0.3), H < 500 ? 95 : 135, 330);
    
    // Slingshot base position
    if (sling.x === 0 || sling.x === 160) {
      sling.x = clamp(W * 0.22, 110, 300);
    } else {
      sling.x = clamp(sling.x, 95, W - 95);
    }
    sling.y = H;
    sling.baseY = H;
    sling.rest = {
      x: sling.x,
      y: H - 128
    };

    if (!grab || grab.type !== "pouch") {
      sling.pouch = { ...sling.rest };
    }
  }

  function setSlingshotX(newX, W) {
    sling.x = clamp(newX, 95, W - 95);
    sling.rest.x = sling.x;
    if (!grab || grab.type !== "pouch") {
      sling.pouch.x = sling.x;
    }
  }

  // Light bulb actions
  function setSwitch(on, fromPebble = false) {
    if (light.on === on) return;
    light.on = on;
    SoundEngine.play(on ? "switchOn" : "switchOff");

    if (onSwitchToggle) {
      onSwitchToggle(on, fromPebble);
    }

    if (light.broken || light.popT > 0) {
      if (onStateChange) onStateChange();
      return;
    }

    if (!on) {
      light.heat += 0.35;
    } else {
      light.heat += 1;
      light.warm = 0.16;
      if (light.heat > 4.4) {
        light.popT = 0.14;
      }
    }

    if (onStateChange) onStateChange();
  }

  function popBulb(vx = 0, vy = 0) {
    if (light.broken) return;
    const b = toWorld(BULB_LOCAL[0], BULB_LOCAL[1]);
    light.broken = true;
    light.popT = 0;
    light.flash = 1;
    stats.bulbs++;

    // Shatter shards
    for (let i = 0; i < 42; i++) {
      const ang = Math.random() * TAU;
      const sp = 130 + Math.random() * 500;
      const n = 3 + Math.floor(Math.random() * 2);
      const r = 2 + Math.random() * 6.5;
      const poly = [];
      for (let k = 0; k < n; k++) {
        const a = (k / n) * TAU + Math.random() * 0.8;
        poly.push([
          Math.cos(a) * r * (0.5 + Math.random()),
          Math.sin(a) * r * (0.5 + Math.random())
        ]);
      }
      shards.push({
        x: b.x + Math.cos(ang) * 8,
        y: b.y + Math.sin(ang) * 8,
        vx: Math.cos(ang) * sp + vx * 0.35,
        vy: Math.sin(ang) * sp * 0.7 + 80 + vy * 0.35,
        a: Math.random() * TAU,
        va: (Math.random() - 0.5) * 24,
        poly
      });
    }

    // Hot electrical sparks
    for (let i = 0; i < 48; i++) {
      const ang = Math.random() * TAU;
      const sp = 200 + Math.random() * 750;
      sparks.push({
        x: b.x,
        y: b.y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp,
        life: 0.35 + Math.random() * 0.65,
        max: 1.0
      });
    }

    SoundEngine.play("pop");

    if (onBulbPop) onBulbPop();
    if (onStateChange) onStateChange();
  }

  function replaceBulb() {
    if (!light.broken) return;
    light.broken = false;
    light.heat = 0;
    light.popT = 0;
    if (light.on) {
      light.warm = 0.2;
      SoundEngine.play("switchOn");
    } else {
      SoundEngine.play("tap", 0.3);
    }
    if (onStateChange) onStateChange();
  }

  function shootPebble() {
    const vx = (sling.rest.x - sling.pouch.x) * LAUNCH;
    const vy = (sling.rest.y - sling.pouch.y) * LAUNCH;
    const pull = Math.hypot(vx, vy) / LAUNCH;
    if (pull < 18) return;

    pebbles.push({
      x: sling.pouch.x,
      y: sling.pouch.y,
      vx,
      vy,
      a: 0,
      hitT: 0,
      rest: 0,
      life: 1
    });

    sling.loaded = false;
    sling.reloadT = 0.42;
    sling.vel = {
      x: vx * 0.4,
      y: vy * 0.4
    };

    stats.shots++;
    SoundEngine.play("twang");
    if (onStateChange) onStateChange();
  }

  // Hit test for user grabbing pointer
  // Half-width of the lampshade's slanted profile at a given local y,
  // shared by the grab hit-test and the shade's physical collision surface.
  function shadeHalfWidth(y) {
    return 14 + 50 * clamp((y - 12) / 50, 0, 1) + 8;
  }

  function hitTest(x, y, H) {
    // 1. Pouch grab
    if (sling.loaded && Math.hypot(x - sling.pouch.x, y - sling.pouch.y) < 32) {
      return { type: "pouch" };
    }

    // 2. Slingshot base handle (for horizontal sliding)
    if (Math.abs(x - sling.x) < 38 && y > H - 85) {
      return { type: "slingBase" };
    }

    // 3. Lamp shade grab
    const l = toLocal(x, y);
    const halfW = shadeHalfWidth(l.y);
    if (l.y > -8 && l.y < 94 && Math.abs(l.x) < halfW) {
      const tgt = Math.atan2(x - lamp.ax, y - lamp.ay);
      return {
        type: "lamp",
        offset: tgt - lamp.theta
      };
    }

    return null;
  }

  // Pebble collision with switch
  function collideSwitch(p, switchRect) {
    if (p.hitT > 0 || !switchRect) return;
    const r = PEBBLE_R;
    const cx = clamp(p.x, switchRect.left, switchRect.right);
    const cy = clamp(p.y, switchRect.top, switchRect.bottom);
    let nx = p.x - cx;
    let ny = p.y - cy;
    const d = Math.hypot(nx, ny);
    if (d > r) return;

    if (d === 0) {
      const sp = Math.hypot(p.vx, p.vy) || 1;
      nx = -p.vx / sp;
      ny = -p.vy / sp;
    } else {
      nx /= d;
      ny /= d;
    }

    const vn = p.vx * nx + p.vy * ny;
    if (vn >= 0) return;

    p.vx -= 1.4 * vn * nx;
    p.vy -= 1.4 * vn * ny;
    p.x = cx + nx * (r + 1);
    p.y = cy + ny * (r + 1);
    p.hitT = 0.1;

    SoundEngine.play("tap", -vn / 2000);
    stats.hits++;
    setSwitch(!light.on, true);
  }

  // Pebble collision with the lampshade's outer surface: bounces the pebble
  // off along the shade's slanted profile and imparts a swing impulse on the
  // lamp, proportional to how hard and where it was struck.
  function collideLampShade(p) {
    const l = toLocal(p.x, p.y);
    const r = PEBBLE_R;

    // Only the visible conical part of the shade (not the open area below
    // the rim, where pebbles should be free to fall through to the bulb).
    if (l.y < 6 || l.y > 64) return false;

    const hw = shadeHalfWidth(l.y);
    const edgeDist = Math.abs(l.x) - hw;
    // Close enough to the slanted outer surface to be touching it
    if (edgeDist < -(r + 2) || edgeDist > r) return false;

    // Local outward normal, derived from the shade profile's actual slope
    // so the bounce follows the cone's real slant rather than a flat guess.
    const dy = 0.6;
    const slope = (shadeHalfWidth(l.y + dy) - shadeHalfWidth(l.y - dy)) / (2 * dy);
    const side = l.x < 0 ? -1 : 1;
    let nx = side;
    let ny = -slope;
    const nlen = Math.hypot(nx, ny) || 1;
    nx /= nlen;
    ny /= nlen;

    const worldN = dirToWorld(nx, ny);
    const vn = p.vx * worldN.x + p.vy * worldN.y;
    if (vn >= 0) return false; // already moving away from the shade

    // Capture the original incoming velocity before we alter it below, so the
    // lamp swings in the direction the ball actually struck from.
    const impactVx = p.vx;
    const impactVy = p.vy;

    p.vx -= 1.55 * vn * worldN.x;
    p.vy -= 1.55 * vn * worldN.y;
    p.x += worldN.x * 4;
    p.y += worldN.y * 4;
    p.hitT = 0.08;

    // Swing the lamp — magnitude and direction driven by the actual impact
    kickLamp(p.x, p.y, impactVx * 0.14, impactVy * 0.14);

    SoundEngine.play("tap", clamp(Math.abs(vn) / 1400, 0.08, 0.9));
    stats.hits++;
    return true;
  }

  // Pebble collision with the lamp: bulb first, then the shade surface
  function collideLamp(p) {
    if (p.hitT > 0) return;
    const l = toLocal(p.x, p.y);
    const r = PEBBLE_R;

    // Hit bulb
    if (!light.broken && Math.hypot(l.x - BULB_LOCAL[0], l.y - BULB_LOCAL[1]) < BULB_R + r) {
      popBulb(p.vx, p.vy);
      kickLamp(p.x, p.y, p.vx * 0.08, p.vy * 0.08);
      p.vx *= 0.75;
      p.vy *= 0.75;
      p.hitT = 0.08;
      stats.hits++;
      return;
    }

    // Hit shade — bounce off and swing the lamp
    collideLampShade(p);
  }

  // Simulation step
  function step(dt, W, H, switchRect) {
    dt = Math.min(dt, 1 / 30); // guard against lag spikes causing large, tunneling-prone jumps
    // 1. Pendulum harmonic simulation
    let acc = -(G / lamp.len) * Math.sin(lamp.theta) - lamp.omega * 0.32;
    if (grab && grab.type === "lamp") {
      const tgt = clamp(Math.atan2(mouse.x - lamp.ax, mouse.y - lamp.ay) - grab.offset, -1.25, 1.25);
      acc += (tgt - lamp.theta) * 175 - lamp.omega * 16;
    }
    lamp.omega += acc * dt;
    const prevTheta = lamp.theta;
    lamp.theta = clamp(lamp.theta + lamp.omega * dt, -1.45, 1.45);

    if (Math.sign(prevTheta) !== Math.sign(lamp.theta) && Math.abs(lamp.omega) > 0.35) {
      SoundEngine.play("squeak", (Math.abs(lamp.omega) - 0.35) / 2);
    }

    // 2. Slingshot base drag
    if (grab && grab.type === "slingBase") {
      setSlingshotX(mouse.x, W);
    }

    // 3. Slingshot pouch spring simulation
    if (grab && grab.type === "pouch") {
      let dx = mouse.x - sling.rest.x;
      let dy = Math.min(mouse.y, H - 10) - sling.rest.y;
      const d = Math.hypot(dx, dy);
      if (d > MAX_PULL) {
        dx *= MAX_PULL / d;
        dy *= MAX_PULL / d;
      }
      sling.pouch = {
        x: sling.rest.x + dx,
        y: sling.rest.y + dy
      };
      sling.vel = { x: 0, y: 0 };

      const pull = Math.hypot(dx, dy);
      sling.creakCd -= dt;
      if (Math.abs(pull - sling.creakAt) > 7 && sling.creakCd <= 0) {
        SoundEngine.play("stretch", pull / MAX_PULL);
        sling.creakAt = pull;
        sling.creakCd = 0.03;
      }
    } else {
      // Elastic spring back to rest
      sling.vel.x += ((sling.rest.x - sling.pouch.x) * 920 - sling.vel.x * 12) * dt;
      sling.vel.y += ((sling.rest.y - sling.pouch.y) * 920 - sling.vel.y * 12) * dt;
      sling.pouch.x += sling.vel.x * dt;
      sling.pouch.y += sling.vel.y * dt;
    }

    // 4. Pebbles kinematics
    for (const p of pebbles) {
      p.hitT = Math.max(0, p.hitT - dt);
      if (p.rest > 0) continue;

      // Sub-step fast-moving pebbles so a single frame's movement can never
      // skip clean over a thin collision surface (the shade edge, the switch)
      const speed = Math.hypot(p.vx, p.vy);
      const maxStepDist = 4; // px — smaller than the pebble radius
      const steps = Math.max(1, Math.min(8, Math.ceil((speed * dt) / maxStepDist)));
      const subDt = dt / steps;

      for (let s = 0; s < steps; s++) {
        p.vy += PEBBLE_G * subDt;
        p.x += p.vx * subDt;
        p.y += p.vy * subDt;
        p.a += p.vx * subDt * 0.05;

        // Collisions — pebble only interacts with the switch and the bulb
        collideSwitch(p, switchRect);
        collideLamp(p);
      }

      // Floor bounce
      if (p.y > H - PEBBLE_R) {
        p.y = H - PEBBLE_R;
        if (p.vy > 120) {
          SoundEngine.play("tap", p.vy / 3000);
        }
        p.vy *= -0.35;
        p.vx *= 0.75;
        if (Math.abs(p.vy) < 40 && Math.abs(p.vx) < 20) {
          p.rest = 0.0001;
        }
      }

      // Walls bounce
      if (p.x < PEBBLE_R || p.x > W - PEBBLE_R) {
        p.x = clamp(p.x, PEBBLE_R, W - PEBBLE_R);
        p.vx *= -0.5;
      }
    }
  }

  // Update dynamic worlds (timers, reload, particles)
  function updateWorld(dt, W, H) {
    if (!sling.loaded) {
      sling.reloadT -= dt;
      if (sling.reloadT <= 0) {
        sling.loaded = true;
      }
    }

    // Pebble decay
    for (const p of pebbles) {
      if (p.rest > 0) {
        p.rest += dt;
        if (p.rest > 4) {
          p.life -= dt * 1.5;
        }
      }
    }
    const keptPebbles = pebbles.filter((p) => p.life > 0 && p.y < H + 200).slice(-12);
    pebbles.length = 0;
    pebbles.push(...keptPebbles);

    // Shards
    for (const s of shards) {
      s.vy += G * 0.75 * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.a += s.va * dt;
      if (s.y > H - 3) {
        s.y = H - 3;
        s.vy *= -0.28;
        s.vx *= 0.6;
        s.va *= 0.5;
        if (Math.abs(s.vy) < 30) {
          s.vy = 0;
        }
      }
      if (s.x < 0 || s.x > W) {
        s.vx *= -0.5;
        s.x = clamp(s.x, 0, W);
      }
    }
    if (shards.length > 240) shards.splice(0, shards.length - 240);

    // Sparks
    for (const p of sparks) {
      p.vy += G * 0.4 * dt;
      p.vx *= 0.985;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    }
    const keptSparks = sparks.filter((p) => p.life > 0);
    sparks.length = 0;
    sparks.push(...keptSparks);
  }

  // Update bulb & light properties
  function updateLight(dt) {
    light.heat = Math.max(0, light.heat - dt * 0.35);
    let target = light.on && !light.broken ? 1 : 0;

    if (light.warm > 0) {
      light.warm -= dt;
      target *= Math.random() < 0.4 ? 0.15 : 1;
    }

    if (light.on && light.heat > 2.6 && Math.random() < (light.heat - 2.6) * 0.06) {
      target *= 0.3;
    }

    if (light.popT > 0) {
      light.popT -= dt;
      target = 1.6;
      if (light.popT <= 0) {
        popBulb();
        target = 0;
      }
    }

    const upI = target > light.I ? 34 : 16;
    light.I = lerp(light.I, target, 1 - Math.exp(-upI * dt));
    const upF = target > light.fil ? 14 : 3.2;
    light.fil = lerp(light.fil, clamp(target, 0, 1), 1 - Math.exp(-upF * dt));
    if (light.broken) {
      light.fil = 0;
    }
    light.flash = Math.max(0, light.flash - dt * 3.5);
  }

  return {
    lamp,
    light,
    sling,
    pebbles,
    shards,
    sparks,
    mouse,
    stats,
    BULB_LOCAL,
    BULB_R,
    PEBBLE_R,
    MAX_PULL,
    LAUNCH,
    lampOrigin,
    toWorld,
    toLocal,
    dirToWorld,
    kickLamp,
    resize,
    setSlingshotX,
    setSwitch,
    popBulb,
    replaceBulb,
    shootPebble,
    hitTest,
    step,
    updateWorld,
    updateLight,
    setHooks,
    getGrab: () => grab,
    setGrab: (g) => { grab = g; }
  };
})();