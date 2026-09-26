// static/js/effects.js
// Purely decorative UI effects: floating emoji background, confetti, tilt,
// ripples, typewriter tagline, toasts and a Konami-code easter egg.
// Exposes window.MemeFX so script.js can trigger effects on events.
(() => {
  const EMOJIS = ["😂", "🔥", "💀", "🐸", "🗿", "👀", "💯", "🤡", "😎", "🥲", "🚀", "🤣", "😭", "🙃", "🍕"];
  const TAGLINES = [
    "Create classic memes, generate unique posters, or browse popular templates",
    "Certified dank since page load 💯",
    "Stonks only go up 📈",
    "One does not simply skip the bottom text",
    "Your group chat isn't ready 👀",
    "AI-powered shitposting, responsibly 🤖",
  ];

  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let motionEnabled = !reduceMotionQuery.matches;
  try {
    const saved = localStorage.getItem("meme-effects");
    if (saved !== null) motionEnabled = saved === "on";
  } catch {
    /* storage unavailable: keep default */
  }

  // 0..1 multiplier on all looping motion; eased when effects are toggled
  let speedScale = motionEnabled ? 1 : 0;

  const bgCanvas = document.getElementById("bg-canvas");
  const fxCanvas = document.getElementById("fx-canvas");
  const bgCtx = bgCanvas.getContext("2d");
  const fxCtx = fxCanvas.getContext("2d");
  const pointer = { x: -9999, y: -9999 };
  let width = 0;
  let height = 0;
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    for (const canvas of [bgCanvas, fxCanvas]) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
    bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  });
  document.addEventListener("pointerleave", () => {
    pointer.x = pointer.y = -9999;
  });

  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Drawing emoji with fillText re-rasterises the glyph on every call, which
  // is far too slow to do per particle per frame. Render each emoji once to
  // an offscreen sprite and blit it with drawImage instead.
  const SPRITE_SIZE = 96;
  const sprites = new Map();
  function sprite(emoji) {
    let canvas = sprites.get(emoji);
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.width = canvas.height = SPRITE_SIZE;
      const ctx = canvas.getContext("2d");
      ctx.font = `${SPRITE_SIZE * 0.78}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(emoji, SPRITE_SIZE / 2, SPRITE_SIZE / 2 + SPRITE_SIZE * 0.05);
      sprites.set(emoji, canvas);
    }
    return canvas;
  }
  EMOJIS.forEach(sprite);

  function drawSprite(ctx, emoji, x, y, rot, size, alpha) {
    ctx.globalAlpha = alpha;
    ctx.setTransform(dpr, 0, 0, dpr, x * dpr, y * dpr);
    ctx.rotate(rot);
    ctx.drawImage(sprite(emoji), -size / 2, -size / 2, size, size);
  }

  // ---------- Floating emoji background ----------
  function makeFloater(startAnywhere) {
    return {
      emoji: pick(EMOJIS),
      x: rand(0, width),
      y: startAnywhere ? rand(0, height) : height + 40,
      size: rand(18, 42),
      speed: rand(0.2, 0.7),
      drift: rand(-0.3, 0.3),
      rot: rand(0, Math.PI * 2),
      spin: rand(-0.01, 0.01),
      alpha: rand(0.15, 0.45),
      vx: 0,
      vy: 0,
    };
  }

  const floaterCount = () => Math.round(Math.min(40, (width * height) / 36000));
  let floaters = Array.from({ length: floaterCount() }, () => makeFloater(true));

  // dt is elapsed time in 60fps frames, so motion speed is frame-rate independent
  function drawBackground(dt) {
    bgCtx.setTransform(1, 0, 0, 1, 0, 0);
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    const target = floaterCount();
    while (floaters.length < target) floaters.push(makeFloater(false));
    if (floaters.length > target) floaters.length = target;
    const damping = Math.pow(0.92, dt);

    for (let i = 0; i < floaters.length; i++) {
      const f = floaters[i];
      // Emojis scatter away from the cursor
      const dx = f.x - pointer.x;
      const dy = f.y - pointer.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 140 && dist > 0) {
        const force = ((140 - dist) / 140) * dt;
        f.vx += (dx / dist) * force * 1.2;
        f.vy += (dy / dist) * force * 1.2;
        f.spin += force * 0.01 * Math.sign(dx);
      }
      f.vx *= damping;
      f.vy *= damping;
      f.spin = Math.max(-0.06, Math.min(0.06, f.spin * Math.pow(0.995, dt)));
      f.x += (f.drift + f.vx) * dt;
      f.y -= (f.speed - f.vy) * dt;
      f.rot += f.spin * dt;
      if (f.y < -60 || f.x < -60 || f.x > width + 60) floaters[i] = makeFloater(false);

      drawSprite(bgCtx, f.emoji, f.x, f.y, f.rot, f.size, f.alpha);
    }
  }

  // ---------- Confetti / emoji rain (foreground canvas) ----------
  const COLORS = ["#ff3cac", "#2bd2ff", "#ffd600", "#7cff6b", "#8a2bff", "#ffffff"];
  const particles = [];

  function confetti(x = width / 2, y = height / 2, count = 120) {
    if (!motionEnabled) return;
    for (let i = 0; i < count; i++) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(4, 13);
      const isEmoji = Math.random() < 0.18;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        w: rand(6, 12),
        h: rand(8, 16),
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.3, 0.3),
        color: pick(COLORS),
        emoji: isEmoji ? pick(EMOJIS) : null,
        size: 26,
        life: 1,
        decay: rand(0.006, 0.012),
      });
    }
    startLoop();
  }

  function emojiRain(count = 80) {
    if (!motionEnabled) return;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: rand(0, width),
        y: rand(-height, -20),
        vx: rand(-1, 1),
        vy: rand(2, 6),
        w: 0,
        h: 0,
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.1, 0.1),
        color: null,
        emoji: pick(EMOJIS),
        size: rand(24, 48),
        life: 1,
        decay: 0.003,
      });
    }
    startLoop();
  }

  function drawParticles(dt) {
    fxCtx.setTransform(1, 0, 0, 1, 0, 0);
    fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
    const drag = Math.pow(0.99, dt);
    let alive = 0;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.vy += 0.25 * dt;
      p.vx *= drag;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.life -= p.decay * dt;
      if (p.life <= 0 || p.y > height + 80) continue;
      particles[alive++] = p; // compact in place instead of allocating a new array

      const alpha = Math.min(1, p.life * 1.5);
      if (p.emoji) {
        drawSprite(fxCtx, p.emoji, p.x, p.y, p.rot, p.size, alpha);
      } else {
        fxCtx.globalAlpha = alpha;
        fxCtx.setTransform(dpr, 0, 0, dpr, p.x * dpr, p.y * dpr);
        fxCtx.rotate(p.rot);
        fxCtx.fillStyle = p.color;
        fxCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 2)));
      }
    }
    particles.length = alive;
    fxCtx.globalAlpha = 1;
  }

  // Single RAF loop; it idles when there's nothing to animate
  let rafId = null;
  let lastTime = 0;
  function frame(now) {
    rafId = null;
    // Clamp so a stalled tab doesn't make everything jump on resume
    const dt = lastTime ? Math.min((now - lastTime) / (1000 / 60), 3) : 1;
    lastTime = now;
    const bgActive = speedScale > 0 && !document.hidden;
    if (bgActive) drawBackground(dt * speedScale);
    drawParticles(dt);
    if (bgActive || particles.length) startLoop();
    else lastTime = 0;
  }
  function startLoop() {
    if (rafId === null) rafId = requestAnimationFrame(frame);
  }
  document.addEventListener("visibilitychange", startLoop);

  // ---------- Wavy title ----------
  function splitTitle() {
    const title = document.getElementById("site-title");
    if (!title) return;
    const text = title.textContent;
    title.setAttribute("aria-label", text);
    title.textContent = "";
    [...text].forEach((ch, i) => {
      const span = document.createElement("span");
      span.className = "char";
      span.setAttribute("aria-hidden", "true");
      span.style.setProperty("--i", i);
      span.textContent = ch === " " ? " " : ch;
      title.appendChild(span);
    });
  }

  // ---------- Typewriter tagline ----------
  function typewriter() {
    const el = document.getElementById("tagline-text");
    if (!el) return;
    let index = 0;
    let timer = null;

    function typeLine(text, done) {
      let i = 0;
      el.textContent = "";
      const tick = () => {
        el.textContent = text.slice(0, ++i);
        if (i < text.length) timer = setTimeout(tick, 35);
        else timer = setTimeout(done, 2800);
      };
      tick();
    }
    function eraseLine(done) {
      const tick = () => {
        el.textContent = el.textContent.slice(0, -1);
        if (el.textContent.length) timer = setTimeout(tick, 15);
        else done();
      };
      tick();
    }
    function next() {
      if (!motionEnabled) {
        el.textContent = TAGLINES[0];
        timer = setTimeout(next, 3000);
        return;
      }
      index = (index + 1) % TAGLINES.length;
      eraseLine(() => typeLine(TAGLINES[index], next));
    }
    timer = setTimeout(next, 3500);
  }

  // ---------- 3D tilt on hover ----------
  function attachTilt(root, selector, maxDeg) {
    root.addEventListener("pointermove", (e) => {
      if (!motionEnabled || e.pointerType !== "mouse") return;
      const el = e.target.closest(selector);
      if (!el || !root.contains(el)) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${-py * maxDeg}deg) rotateY(${px * maxDeg}deg)`;
    });
    root.addEventListener(
      "pointerout",
      (e) => {
        const el = e.target.closest(selector);
        if (el && !el.contains(e.relatedTarget)) el.style.transform = "";
      },
      true
    );
  }

  // ---------- Button ripple ----------
  function attachRipples() {
    document.addEventListener("pointerdown", (e) => {
      if (!motionEnabled) return;
      const btn = e.target.closest(".btn");
      if (!btn || btn.disabled) return;
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height);
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - r.left - size / 2}px`;
      ripple.style.top = `${e.clientY - r.top - size / 2}px`;
      btn.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    });
  }

  // ---------- Scroll reveal ----------
  function attachReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    items.forEach((el) => io.observe(el));
  }

  // ---------- Toast ----------
  let toastTimer = null;
  function toast(message) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  // ---------- Motion toggle ----------
  // Looping animations to freeze in place rather than ease back to rest
  // (keep in sync with the body.no-motion rules in style.css)
  const FREEZE_SELECTOR = ".ticker-track, .blob, .btn-primary";
  const WIND_MS = 600;
  const SETTLE_MS = 350;
  let toggleToken = 0;
  let settledAnimations = [];
  let frozenAnimations = [];

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeIn = (t) => t * t;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  function loopingAnimations() {
    if (!document.getAnimations) return [];
    return document.getAnimations().filter((a) => {
      const timing = a.effect && a.effect.getTiming ? a.effect.getTiming() : {};
      return timing.iterations === Infinity && a.effect.target && a.playState !== "idle";
    });
  }

  // Ease speedScale (and every looping CSS animation's playbackRate) to `to`
  function rampSpeed(to, ms, easing, token) {
    const from = speedScale;
    const start = performance.now();
    // getAnimations() forces a style recalc, so look the set up once per ramp
    const anims = loopingAnimations();
    return new Promise((resolve) => {
      const step = (now) => {
        if (token !== toggleToken) return resolve(false);
        const t = Math.min(1, (now - start) / ms);
        speedScale = from + (to - from) * easing(t);
        anims.forEach((a) => (a.playbackRate = speedScale));
        startLoop();
        if (t < 1) requestAnimationFrame(step);
        else resolve(true);
      };
      requestAnimationFrame(step);
    });
  }

  // Swap each stopped animation for an inline style holding its current
  // pose, then transition that inline style back to the element's rest pose
  async function settleToRest(token) {
    // Read every pose before writing any, so we don't force a style recalc
    // per element (layout thrashing) in the middle of the animation
    const settling = [];
    loopingAnimations().forEach((anim) => {
      const el = anim.effect.target;
      if (el.matches(FREEZE_SELECTOR) || anim.effect.pseudoElement) return;
      const props = new Set();
      anim.effect.getKeyframes().forEach((kf) =>
        Object.keys(kf).forEach((k) => {
          if (!["offset", "computedOffset", "easing", "composite"].includes(k)) props.add(k);
        })
      );
      const computed = getComputedStyle(el);
      const pose = [...props].map((prop) => [prop, computed[prop]]);
      settling.push({ el, anim, props: [...props], pose });
    });
    settling.forEach(({ el, anim, pose }) => {
      anim.cancel();
      pose.forEach(([prop, value]) => (el.style[prop] = value));
    });
    settledAnimations.push(...settling);
    if (!settling.length) return true;

    void document.body.offsetWidth; // commit the captured poses before transitioning
    settling.forEach(({ el, props }) => {
      el.style.transition = props
        .map((p) => `${p.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())} ${SETTLE_MS}ms ease-out`)
        .join(", ");
      props.forEach((p) => (el.style[p] = ""));
    });
    await wait(SETTLE_MS + 50);
    if (token !== toggleToken) return false;
    settling.forEach(({ el }) => (el.style.transition = ""));
    return true;
  }

  // Bring back animations cancelled by settleToRest (e.g. when toggled back on)
  function restoreSettled() {
    settledAnimations.forEach(({ el, anim, props }) => {
      el.style.transition = "";
      props.forEach((p) => (el.style[p] = ""));
      anim.playbackRate = speedScale;
      anim.play();
    });
    settledAnimations = [];
  }

  // Hold scrolling/drifting loops exactly where they stopped. Pausing from JS
  // (rather than leaving it to animation-play-state) keeps their current time
  // intact across the rate change, so nothing jumps when they resume.
  function freezeLoops() {
    loopingAnimations().forEach((anim) => {
      if (!anim.effect.target.matches(FREEZE_SELECTOR)) return;
      anim.pause();
      frozenAnimations.push(anim);
    });
  }

  function unfreezeLoops() {
    frozenAnimations.forEach((anim) => {
      anim.playbackRate = speedScale;
      anim.play();
    });
    frozenAnimations = [];
  }

  function updateToggleButton() {
    const btn = document.getElementById("motion-toggle");
    if (btn) {
      btn.textContent = motionEnabled ? "✨ Effects: On" : "💤 Effects: Off";
      btn.setAttribute("aria-pressed", String(motionEnabled));
    }
  }

  function clearCanvases() {
    particles.length = 0;
    for (const [ctx, canvas] of [[bgCtx, bgCanvas], [fxCtx, fxCanvas]]) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Initial state (page load): no transition needed
  function applyMotionInstantly() {
    document.body.classList.toggle("no-motion", !motionEnabled);
    document.body.classList.toggle("fx-hidden", !motionEnabled);
    speedScale = motionEnabled ? 1 : 0;
    updateToggleButton();
    startLoop();
  }

  async function transitionMotion() {
    const token = ++toggleToken;
    const body = document.body;
    updateToggleButton();

    if (motionEnabled) {
      restoreSettled();
      unfreezeLoops();
      body.classList.remove("no-motion");
      body.classList.remove("fx-hidden");
      // Freshly (re)started animations spin up from standstill
      loopingAnimations().forEach((a) => (a.playbackRate = speedScale));
      await rampSpeed(1, WIND_MS + 100, easeIn, token);
      return;
    }

    document.querySelectorAll(".tilt").forEach((el) => (el.style.transform = ""));
    body.classList.add("fx-hidden");
    if (!(await rampSpeed(0, WIND_MS, easeOut, token))) return;
    freezeLoops();
    if (!(await settleToRest(token))) return;
    body.classList.add("no-motion");
    clearCanvases();
  }

  // ---------- Konami code easter egg ----------
  const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let konamiPos = 0;
  document.addEventListener("keydown", (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    konamiPos = key === KONAMI[konamiPos] ? konamiPos + 1 : key === KONAMI[0] ? 1 : 0;
    if (konamiPos === KONAMI.length) {
      konamiPos = 0;
      emojiRain(150);
      toast("🕹️ Cheat code activated: MAXIMUM MEME");
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    splitTitle();
    typewriter();
    attachTilt(document.querySelector(".main-content"), ".tilt", 6);
    attachRipples();
    attachReveal();

    const logo = document.querySelector(".logo-emoji");
    logo?.addEventListener("click", (e) => {
      logo.textContent = pick(EMOJIS);
      confetti(e.clientX, e.clientY, 40);
    });

    document.getElementById("motion-toggle")?.addEventListener("click", () => {
      motionEnabled = !motionEnabled;
      try {
        localStorage.setItem("meme-effects", motionEnabled ? "on" : "off");
      } catch {
        /* ignore */
      }
      transitionMotion();
      toast(motionEnabled ? "✨ Effects back on" : "💤 Effects paused");
    });

    applyMotionInstantly();
  });

  window.MemeFX = {
    confetti,
    emojiRain,
    toast,
    isEnabled: () => motionEnabled,
    confettiFrom(el, count) {
      const r = el.getBoundingClientRect();
      confetti(r.left + r.width / 2, r.top + r.height / 2, count);
    },
  };
})();
