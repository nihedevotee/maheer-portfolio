/**
 * AUDIO SYNTHESIZER (Web Audio API)
 * Procedural sound effects for the lamp, slingshot, switch, and desktop windows.
 * Zero external audio files required.
 */

window.SoundEngine = (function () {
  let ac = null;
  let noise = null;
  let muted = false;

  function getAudioContext() {
    if (ac) return ac;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ac = new AudioCtx();

      // Pre-generate 1-second white noise buffer
      noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      return ac;
    } catch (e) {
      console.warn("AudioContext initialization error:", e);
      return null;
    }
  }

  function resume() {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume();
    }
  }

  function burst(t, dur, type, freq, gain, q = 1) {
    if (!ac || !noise) return;
    const s = ac.createBufferSource();
    s.buffer = noise;
    const f = ac.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ac.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(ac.destination);
    s.start(t, Math.random() * 0.5);
    s.stop(t + dur + 0.02);
  }

  function tone(t, f0, f1, dur, gain, type = "sine") {
    if (!ac) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(10, f1), t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ac.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function play(name, amt = 1, level = 1) {
    const ambient = name === "squeak";
    if (muted || (ambient && (!ac || ac.state !== "running"))) return;
    if (!getAudioContext()) return;
    resume();

    const t = ac.currentTime + 0.005;

    switch (name) {
      case "squeak": {
        const g = Math.max(0, Math.min(1, amt));
        const dur = 0.14 + g * 0.16;
        const base = 1400 + Math.random() * 350;
        const o = ac.createOscillator();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(base * 0.8, t);
        o.frequency.linearRampToValueAtTime(base * 1.15, t + dur * 0.4);
        o.frequency.linearRampToValueAtTime(base * 0.9, t + dur);

        const lfo = ac.createOscillator();
        const depth = ac.createGain();
        lfo.frequency.value = 26 + Math.random() * 12;
        depth.gain.value = base * 0.07;
        lfo.connect(depth).connect(o.frequency);

        const f = ac.createBiquadFilter();
        f.type = "bandpass";
        f.frequency.value = base * 1.2;
        f.Q.value = 4;

        const v = ac.createGain();
        v.gain.setValueAtTime(0.0001, t);
        v.gain.exponentialRampToValueAtTime(0.03 + 0.07 * g, t + 0.03);
        v.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        o.connect(f).connect(v).connect(ac.destination);
        o.start(t);
        lfo.start(t);
        o.stop(t + dur + 0.02);
        lfo.stop(t + dur + 0.02);
        break;
      }

      case "stretch": {
        const f0 = 80 + amt * 240;
        const o = ac.createOscillator();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(f0, t);
        o.frequency.linearRampToValueAtTime(f0 * 1.1, t + 0.05);

        const f = ac.createBiquadFilter();
        f.type = "bandpass";
        f.frequency.value = f0 * 4;
        f.Q.value = 3;

        const v = ac.createGain();
        v.gain.setValueAtTime(0.05 + amt * 0.05, t);
        v.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

        o.connect(f).connect(v).connect(ac.destination);
        o.start(t);
        o.stop(t + 0.07);
        burst(t, 0.02, "bandpass", 1200 + amt * 1600, 0.05, 2);
        break;
      }

      case "switchOn":
      case "on": {
        burst(t, 0.012, "highpass", 2600, 0.5);
        burst(t + 0.025, 0.014, "bandpass", 1900, 0.4, 2);
        tone(t, 160, 65, 0.06, 0.22);
        break;
      }

      case "switchOff":
      case "off": {
        burst(t, 0.012, "highpass", 2200, 0.45);
        burst(t + 0.025, 0.014, "bandpass", 1300, 0.35, 2);
        tone(t, 140, 50, 0.06, 0.20);
        break;
      }

      case "twang": {
        burst(t, 0.03, "bandpass", 900, 0.35, 3);
        tone(t, 190, 110, 0.16, 0.18, "triangle");
        break;
      }

      case "clank": {
        const g = Math.max(0.15, Math.min(1, amt));
        [1320, 2210, 3470].forEach((freq, idx) => {
          tone(t, freq, freq * 0.98, 0.35 - idx * 0.08, 0.09 * g, "triangle");
        });
        burst(t, 0.02, "highpass", 3000, 0.4 * g);
        break;
      }

      case "shadeHit": {
        // Pebble hits the metal lampshade: a short ringing clang
        const g = Math.max(0.2, Math.min(1, amt));
        const base = 420 + Math.random() * 80;
        [1, 2.32, 3.67, 5.4].forEach((r, i) => {
          tone(t, base * r, base * r * 0.985, 0.5 - i * 0.08, (0.2 / (1 + i * 0.6)) * g, "sine");
        });
        burst(t, 0.02, "highpass", 2500, 0.35 * g);
        break;
      }

      case "ropeHit": {
        // Pebble hits the lamp cord: dull thwack plus a short string twang
        const g = Math.max(0.2, Math.min(1, amt));
        tone(t, 240 + Math.random() * 40, 100, 0.18, 0.32 * g, "sine");
        tone(t, 540 + Math.random() * 100, 470, 0.3, 0.1 * g, "triangle");
        burst(t, 0.05, "lowpass", 1400, 0.25 * g);
        break;
      }

      case "glassCrack": {
        // New crack in the glass globe: bright tink + crackle (louder on later cracks)
        const g = Math.max(0.3, Math.min(1, amt));
        const lv = Math.max(1, Math.min(3, level));
        tone(t, 3200 + Math.random() * 800, 2200, 0.14, 0.2 * g, "triangle");
        const ticks = 5 + lv * 3;
        for (let i = 0; i < ticks; i++) {
          burst(
            t + Math.random() * 0.22,
            0.008 + Math.random() * 0.014,
            "bandpass",
            2500 + Math.random() * 5500,
            (0.25 + Math.random() * 0.4) * g * (0.8 + lv * 0.15),
            1.2
          );
        }
        break;
      }

      case "tap": {
        burst(t, 0.03, "lowpass", 500, Math.max(0.05, Math.min(0.5, amt)));
        break;
      }

      case "pop": {
        burst(t, 0.14, "lowpass", 900, 0.9);
        tone(t, 220, 40, 0.12, 0.3);
        for (let i = 0; i < 18; i++) {
          burst(
            t + 0.02 + Math.random() * 0.7,
            0.02 + Math.random() * 0.06,
            "bandpass",
            3000 + Math.random() * 5000,
            0.12 + Math.random() * 0.2,
            9
          );
        }
        break;
      }

      case "windowOpen": {
        // Pleasant ascending major triad chime
        tone(t, 523.25, 523.25, 0.12, 0.12, "sine"); // C5
        tone(t + 0.06, 659.25, 659.25, 0.12, 0.12, "sine"); // E5
        tone(t + 0.12, 783.99, 783.99, 0.18, 0.14, "sine"); // G5
        burst(t, 0.05, "highpass", 4000, 0.08);
        break;
      }

      case "windowClose": {
        // Soft descending tone
        tone(t, 783.99, 523.25, 0.15, 0.12, "sine");
        burst(t, 0.04, "bandpass", 1500, 0.06);
        break;
      }

      case "iconClick": {
        tone(t, 800, 400, 0.04, 0.15, "triangle");
        burst(t, 0.015, "highpass", 3000, 0.1);
        break;
      }

      case "targetHit": {
        // Celebratory target ding
        tone(t, 880, 880, 0.15, 0.2, "sine");
        tone(t + 0.08, 1318.5, 1318.5, 0.22, 0.22, "sine");
        burst(t, 0.02, "highpass", 6000, 0.15);
        break;
      }
    }
  }

  function setMuted(state) {
    muted = !!state;
    return muted;
  }

  function toggleMute() {
    muted = !muted;
    return muted;
  }

  function isMuted() {
    return muted;
  }

  return {
    play,
    resume,
    setMuted,
    toggleMute,
    isMuted
  };
})();