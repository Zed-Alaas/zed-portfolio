/* ==========================================================================
   Zed Alaas — Portfolio
   Interaction engine: preloader, smooth scroll, particles, terminal,
   reveals, cursor, magnetic buttons. Everything degrades gracefully:
   no GSAP / no JS / reduced motion all still get a readable site.
   ========================================================================== */

(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";
  const animate = hasGSAP && !prefersReduced;

  // Always start at the top so the preloader + hero intro line up
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (animate && typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.1 });
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis; // handy for debugging in devtools
  }

  function scrollToTarget(hash) {
    const target = hash === "#home" ? 0 : $(hash);
    if (target === null) return;
    if (lenis) lenis.scrollTo(target, { offset: hash === "#home" ? 0 : -40 });
    else (hash === "#home" ? document.body : target).scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
  }

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const hash = a.getAttribute("href");
      if (hash.length < 2) return;
      e.preventDefault();
      closeMobileMenu();
      scrollToTarget(hash);
    });
  });

  /* ---------- Split hero title into animatable letters ---------- */
  function splitLetters(el) {
    const text = el.textContent;
    el.setAttribute("aria-label", text);
    el.textContent = "";
    const word = document.createElement("span");
    word.className = "word";
    word.setAttribute("aria-hidden", "true");
    [...text].forEach((ch) => {
      const c = document.createElement("span");
      c.className = "ch";
      c.textContent = ch;
      word.appendChild(c);
    });
    el.appendChild(word);
  }
  $$(".hero-title .line").forEach(splitLetters);

  /* ---------- Preloader ---------- */
  const preloader = $("#preloader");
  let siteStarted = false;

  function startSite() {
    if (siteStarted) return;
    siteStarted = true;
    heroIntro();
    bootTerminal();
  }

  function killPreloader() {
    if (preloader) preloader.remove();
    startSite();
  }

  if (!animate || !preloader) {
    killPreloader();
  } else {
    // Set hero initial states BEFORE revealing, so there's no flash
    gsap.set(".hero-title .ch", { yPercent: 110 });
    gsap.set(".kicker, .roles, .hero-ctas, .terminal, .scroll-hint", { opacity: 0, y: 24 });

    const count = { v: 0 };
    const countEl = $(".preloader-count");
    gsap.timeline()
      .to(count, {
        v: 100,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => { countEl.textContent = Math.round(count.v) + "%"; },
      })
      .to(preloader, {
        yPercent: -100,
        duration: 0.8,
        ease: "power4.inOut",
        onComplete: killPreloader,
      }, "+=0.15");

    // Safety net: never trap the user behind the preloader
    setTimeout(() => { if (!siteStarted) killPreloader(); }, 5000);
  }

  /* ---------- Hero intro ---------- */
  function heroIntro() {
    if (!animate) return;
    gsap.timeline({ defaults: { ease: "power4.out" } })
      .to(".hero-title .ch", { yPercent: 0, duration: 1.1, stagger: 0.045 })
      .to(".kicker", { opacity: 1, y: 0, duration: 0.7 }, "-=0.7")
      .to(".roles", { opacity: 1, y: 0, duration: 0.7 }, "-=0.55")
      .to(".hero-ctas", { opacity: 1, y: 0, duration: 0.7 }, "-=0.55")
      .to(".terminal", { opacity: 1, y: 0, duration: 0.9 }, "-=0.5")
      .to(".scroll-hint", { opacity: 1, y: 0, duration: 0.6 }, "-=0.4");
  }

  /* ---------- Role rotator ---------- */
  const rolesEl = $(".roles-swap");
  if (rolesEl) {
    let roles = [];
    try { roles = JSON.parse(rolesEl.dataset.roles); } catch (_) { /* keep default */ }
    if (roles.length > 1) {
      let i = 0;
      setInterval(() => {
        i = (i + 1) % roles.length;
        if (animate) {
          gsap.timeline()
            .to(rolesEl, { y: -14, opacity: 0, duration: 0.28, ease: "power2.in" })
            .add(() => { rolesEl.textContent = roles[i]; })
            .fromTo(rolesEl, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.32, ease: "power2.out" });
        } else {
          rolesEl.textContent = roles[i];
        }
      }, 2600);
    }
  }

  /* ---------- Custom cursor ---------- */
  if (finePointer && !prefersReduced) {
    const dot = $(".cursor-dot");
    const ring = $(".cursor-ring");
    let mx = -100, my = -100, rx = -100, ry = -100;
    let cursorShown = false;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      if (!cursorShown) { cursorShown = true; document.body.classList.add("cursor-active"); }
    }, { passive: true });

    document.addEventListener("mouseleave", () => document.body.classList.remove("cursor-active"));
    document.addEventListener("mouseenter", () => { if (cursorShown) document.body.classList.add("cursor-active"); });

    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();

    const HOVERABLE = "a, button, .chip, input";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(HOVERABLE)) document.body.classList.add("cursor-hover");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(HOVERABLE)) document.body.classList.remove("cursor-hover");
    });
  }

  /* ---------- Particle field ---------- */
  const canvas = $("#particles");
  let accentRGB = { r: 170, g: 255, b: 61 };

  function readAccent() {
    const hex = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    const m = hex.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
    if (m) accentRGB = { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
  }
  readAccent();
  document.addEventListener("themechange", readAccent);

  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext("2d");
    const hero = $(".hero");
    let W = 0, H = 0, running = true, heroVisible = true;
    let pts = [];
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = hero.offsetWidth; H = hero.offsetHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.min(Math.floor((W * H) / 16000), 110);
      pts = Array.from({ length: target }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
      }));
    }
    resize();
    window.addEventListener("resize", resize);

    hero.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }, { passive: true });
    hero.addEventListener("mouseleave", () => { mouse.x = -9999; mouse.y = -9999; });

    new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; }).observe(hero);
    document.addEventListener("visibilitychange", () => { running = !document.hidden; });

    const LINK = 110, REPEL = 130;

    (function frame() {
      requestAnimationFrame(frame);
      if (!running || !heroVisible) return;
      ctx.clearRect(0, 0, W, H);

      for (const p of pts) {
        // Mouse repulsion
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const md = Math.hypot(dx, dy);
        if (md < REPEL && md > 0.01) {
          const f = (REPEL - md) / REPEL * 0.6;
          p.x += (dx / md) * f;
          p.y += (dy / md) * f;
        }
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; else if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; else if (p.y > H) p.y = 0;
      }

      // Links
      const { r, g, b } = accentRGB;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          if (dx > LINK || dx < -LINK) continue;
          const dy = pts[i].y - pts[j].y;
          const d = dx * dx + dy * dy;
          if (d < LINK * LINK) {
            const a = (1 - Math.sqrt(d) / LINK) * 0.14;
            ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      // Dots
      ctx.fillStyle = "rgba(234,232,228,0.35)";
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    })();
  }

  /* ---------- Interactive terminal ---------- */
  const termBody = $("#term-body");
  const termInput = $("#term-input");
  const terminal = $("#terminal");

  const THEMES = [
    { name: "lime", accent: "#aaff3d" },
    { name: "cyan", accent: "#3dfff0" },
    { name: "violet", accent: "#b18cff" },
    { name: "amber", accent: "#ffb03d" },
    { name: "pink", accent: "#ff5ca8" },
  ];
  let themeIndex = 0;

  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  function printLine(html) {
    if (!termBody) return;
    const div = document.createElement("div");
    div.className = "term-line";
    div.innerHTML = html;
    termBody.appendChild(div);
    termBody.scrollTop = termBody.scrollHeight;
  }

  const COMMANDS = {
    help: () => [
      '<span class="t-dim">available commands:</span>',
      '  <span class="t-accent">whoami</span>     — who is this guy?',
      '  <span class="t-accent">skills</span>     — what I work with',
      '  <span class="t-accent">projects</span>   — things I\'ve built',
      '  <span class="t-accent">contact</span>    — reach out',
      '  <span class="t-accent">theme</span>      — cycle accent color',
      '  <span class="t-accent">clear</span>      — clean the screen',
      '  <span class="t-dim">...and maybe a hidden one or two</span>',
    ],
    whoami: () => [
      '<span class="t-accent">zed alaas</span> — web developer',
      "building fast, interactive things for the web.",
      'currently: <span class="t-accent">available for work</span> ●',
    ],
    about: () => COMMANDS.whoami(),
    skills: () => [
      '<span class="t-dim">frontend  →</span> HTML · CSS · JavaScript · TypeScript · React · GSAP',
      '<span class="t-dim">backend   →</span> Node.js · REST APIs · Python',
      '<span class="t-dim">also      →</span> Swift/SwiftUI · Shopify · Figma',
    ],
    projects: () => [
      '<span class="t-accent">001</span> Summit — Apple Watch climbing tracker',
      '<span class="t-accent">002</span> This portfolio — you\'re inside it',
      '<span class="t-accent">003</span> Data-Viz Lab — in progress',
      '<span class="t-accent">004</span> Kiosk storefront — in progress',
      '<span class="t-dim">scroll down or type \'contact\' to work together</span>',
    ],
    contact: () => [
      'email  → <span class="t-accent">zed.alaas@gmail.com</span>',
      '<span class="t-dim">or hit the big button at the bottom of the page</span>',
    ],
    theme: () => {
      themeIndex = (themeIndex + 1) % THEMES.length;
      const t = THEMES[themeIndex];
      document.documentElement.style.setProperty("--accent", t.accent);
      document.dispatchEvent(new Event("themechange"));
      return [`accent → <span class="t-accent">${t.accent}</span> (${t.name})`];
    },
    clear: () => { termBody.innerHTML = ""; return []; },
    "sudo hire-me": () => [
      '<span class="t-dim">[sudo] password for guest:</span> ********',
      '<span class="t-accent">ACCESS GRANTED ✔</span>',
      "initiating hire sequence...",
      'opening mail client → <a class="t-accent" href="mailto:zed.alaas@gmail.com?subject=Let%27s%20work%20together">zed.alaas@gmail.com</a>',
    ],
  };

  const cmdHistory = [];
  let histIndex = -1;

  function runCommand(raw) {
    const cmd = raw.trim().toLowerCase();
    printLine(`<span class="t-accent">$</span> <span class="t-cmd">${esc(raw)}</span>`);
    if (!cmd) return;
    cmdHistory.unshift(raw);
    histIndex = -1;
    const handler = COMMANDS[cmd];
    if (handler) {
      handler().forEach(printLine);
      if (cmd === "sudo hire-me") {
        setTimeout(() => { window.location.href = "mailto:zed.alaas@gmail.com?subject=Let's work together"; }, 900);
      }
    } else if (cmd.startsWith("sudo")) {
      printLine('<span class="t-dim">nice try. the only sudo here is</span> <span class="t-accent">sudo hire-me</span>');
    } else {
      printLine(`<span class="t-dim">command not found: ${esc(cmd)} — try</span> <span class="t-accent">help</span>`);
    }
  }

  if (termInput) {
    termInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        runCommand(termInput.value);
        termInput.value = "";
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (histIndex < cmdHistory.length - 1) termInput.value = cmdHistory[++histIndex];
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (histIndex > 0) termInput.value = cmdHistory[--histIndex];
        else { histIndex = -1; termInput.value = ""; }
      }
    });
    terminal.addEventListener("click", () => termInput.focus());
  }

  const BOOT_LINES = [
    '<span class="t-dim">zed.alaas terminal</span> <span class="t-accent">v1.0.0</span>',
    '<span class="t-accent">$</span> <span class="t-cmd">whoami</span>',
    "zed alaas — web developer",
    '<span class="t-accent">$</span> <span class="t-cmd">status</span>',
    '<span class="t-accent">[●] available for work</span>',
    '<span class="t-dim">type</span> <span class="t-accent">help</span> <span class="t-dim">to explore</span>',
  ];

  let terminalBooted = false;
  function bootTerminal() {
    if (terminalBooted || !termBody) return;
    terminalBooted = true;
    if (!animate) {
      BOOT_LINES.forEach(printLine);
      return;
    }
    let i = 0;
    (function next() {
      if (i >= BOOT_LINES.length) return;
      printLine(BOOT_LINES[i]);
      i++;
      setTimeout(next, 280);
    })();
  }

  /* ---------- Scroll reveals (IntersectionObserver — can't be skipped
       by fast scrolling or anchor jumps, unlike scroll-position triggers) ---------- */
  if (animate) {
    const revealCfg = new WeakMap();
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        const cfg = revealCfg.get(entry.target);
        gsap.to(cfg.els, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: cfg.stagger });
      });
    }, { rootMargin: "0px 0px -60px 0px" });

    const addReveal = (container, els, stagger) => {
      gsap.set(els, { y: 40, opacity: 0 });
      revealCfg.set(container, { els, stagger });
      io.observe(container);
    };
    $$("[data-reveal]").forEach((el) => addReveal(el, el, 0));
    $$("[data-reveal-group]").forEach((g) => addReveal(g, [...g.children], 0.12));
  }

  /* ---------- Stat counters ---------- */
  $$("[data-count]").forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    if (!animate || isNaN(target)) return; // HTML already shows final value
    el.textContent = "0" + suffix;
    const obj = { v: 0 };
    new IntersectionObserver(([entry], obs) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      gsap.to(obj, {
        v: target,
        duration: 1.6, ease: "power2.out",
        snap: { v: 1 },
        onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; },
      });
    }, { threshold: 0.4 }).observe(el);
  });

  /* ---------- Work rows: accordion + floating hover preview ---------- */
  const preview = $("#work-preview");
  const previewArt = $(".preview-art");
  const previewInitial = $(".preview-initial");
  let quickX = null, quickY = null;

  if (preview && animate && finePointer) {
    quickX = gsap.quickTo(preview, "x", { duration: 0.4, ease: "power3.out" });
    quickY = gsap.quickTo(preview, "y", { duration: 0.4, ease: "power3.out" });
    window.addEventListener("mousemove", (e) => {
      if (quickX) { quickX(e.clientX + 24); quickY(e.clientY - 75); }
    }, { passive: true });
  }

  $$(".work-row").forEach((row) => {
    const head = $(".row-head", row);

    head.addEventListener("click", () => {
      const open = row.classList.toggle("open");
      head.setAttribute("aria-expanded", String(open));
    });

    if (preview && animate && finePointer) {
      head.addEventListener("mouseenter", () => {
        previewArt.className = "preview-art " + row.dataset.preview;
        previewInitial.textContent = row.dataset.initial || "•";
        gsap.to(preview, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" });
      });
      head.addEventListener("mouseleave", () => {
        gsap.to(preview, { opacity: 0, scale: 0.8, duration: 0.25, ease: "power2.in" });
      });
    }
  });

  /* ---------- Magnetic buttons ---------- */
  if (animate && finePointer) {
    $$("[data-magnetic]").forEach((el) => {
      const strength = 22;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * strength;
        const y = ((e.clientY - r.top) / r.height - 0.5) * strength;
        gsap.to(el, { x, y, duration: 0.35, ease: "power2.out" });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  /* ---------- Nav: hide on scroll down, progress bar ---------- */
  const nav = $(".site-nav");
  const progress = $(".progress-bar");
  let lastY = 0, ticking = false;

  function onScrollUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress && max > 0) progress.style.width = (y / max) * 100 + "%";
      if (nav) {
        if (y > lastY && y > 140 && !mobileMenuOpen) nav.classList.add("nav-hidden");
        else nav.classList.remove("nav-hidden");
      }
      lastY = y;
      ticking = false;
    });
  }
  // Lenis emits its own scroll event while it animates; keep the native
  // listener too as a fallback (reduced motion / no-GSAP path).
  window.addEventListener("scroll", onScrollUpdate, { passive: true });
  if (lenis) lenis.on("scroll", onScrollUpdate);

  /* ---------- Mobile menu ---------- */
  const navToggle = $(".nav-toggle");
  const mobileMenu = $(".mobile-menu");
  let mobileMenuOpen = false;

  function closeMobileMenu() {
    if (!mobileMenuOpen) return;
    mobileMenuOpen = false;
    mobileMenu.classList.remove("open");
    mobileMenu.setAttribute("aria-hidden", "true");
    navToggle.setAttribute("aria-expanded", "false");
    if (lenis) lenis.start();
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", () => {
      mobileMenuOpen = !mobileMenuOpen;
      mobileMenu.classList.toggle("open", mobileMenuOpen);
      mobileMenu.setAttribute("aria-hidden", String(!mobileMenuOpen));
      navToggle.setAttribute("aria-expanded", String(mobileMenuOpen));
      if (lenis) mobileMenuOpen ? lenis.stop() : lenis.start();
    });
  }

  /* ---------- Copy email + toast ---------- */
  const toast = $(".toast");
  let toastTimer = null;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  $$("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        showToast("email copied ✓");
      } catch (_) {
        window.location.href = "mailto:" + text;
      }
    });
  });

  /* ---------- Live local time ---------- */
  const clock = $("#clock");
  if (clock) {
    const tick = () => {
      clock.textContent = new Date().toLocaleTimeString([], { hour12: false });
    };
    tick();
    setInterval(tick, 1000);
  }
})();
