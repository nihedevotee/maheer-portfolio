/**
 * DESKTOP WINDOW MANAGER & APPLICATION SYSTEM (MaheerOS)
 * Inspired by retro-modern OS design (Shar's desktop) with multi-window support,
 * draggable windows, minimize/maximize/close, dynamic z-index stacking, and rich apps.
 */

window.DesktopManager = (function () {
  let highestZ = 100;
  const openWindows = new Map(); // id -> { elem, state: "open"|"minimized"|"maximized", origBounds }
  let dockElem = null;
  let activeWindowId = null;

  // Initialize Desktop Manager
  function init() {
    dockElem = document.getElementById("desktopDock");
    setupMainDesktopEvents();
    renderDock();
    updateClock();
    setInterval(updateClock, 1000);
    loadVisitCounter();
  }

  // Update system clock
  function updateClock() {
    const clockEl = document.getElementById("systemClock");
    if (!clockEl) return;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    clockEl.textContent = `${hours}:${minutes}`;
  }

  // Setup main desktop icon clicks
  function setupMainDesktopEvents() {
    document.querySelectorAll("[data-app]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!PhysicsEngine.light.on || PhysicsEngine.light.broken) return;
        const appId = btn.getAttribute("data-app");
        openApp(appId);
      });
    });

    // Interactive avatar badge easter egg
    const avatarBadge = document.querySelector(".avatar-badge");
    const emojiList = ["🚀", "💡", "⚡", "👾", "🤖", "🔥", "✨", "☕", "🧠"];
    let emojiIdx = 0;
    if (avatarBadge) {
      avatarBadge.style.cursor = "pointer";
      avatarBadge.title = "Click me!";
      avatarBadge.addEventListener("click", () => {
        emojiIdx = (emojiIdx + 1) % emojiList.length;
        avatarBadge.textContent = emojiList[emojiIdx];
        avatarBadge.style.transform = "scale(1.22) rotate(12deg)";
        setTimeout(() => {
          avatarBadge.style.transform = "none";
        }, 180);
        SoundEngine.play("targetHit");
      });
    }

    // Theme toggle button
    const themeBtn = document.getElementById("desktopThemeToggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("theme-light");
        const isLight = document.body.classList.contains("theme-light");
        themeBtn.textContent = isLight ? "☀️" : "🌙";
        themeBtn.title = isLight ? "Switch to Night Mode" : "Switch to Day Mode";
        SoundEngine.play("tap", 0.5);
      });
    }

    // Escape key closes top window
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (activeWindowId) {
          closeApp(activeWindowId);
        }
      }
    });
  }

  // Open an application window
  function openApp(appId) {
    SoundEngine.play("iconClick");

    // If already open
    if (openWindows.has(appId)) {
      const winData = openWindows.get(appId);
      if (winData.state === "minimized") {
        restoreApp(appId);
      } else {
        bringToFront(appId);
      }
      return;
    }

    // Create window DOM
    const win = createWindowElement(appId);
    document.getElementById("windowContainer").appendChild(win);

    highestZ += 2;
    win.style.zIndex = highestZ;
    activeWindowId = appId;

    // Position window with cascading offset
    const cascadeOffset = (openWindows.size % 6) * 26;
    const isMobile = window.innerWidth <= 680;

    if (!isMobile) {
      const defaultLeft = Math.max(20, Math.min(window.innerWidth - 640, 120 + cascadeOffset));
      const defaultTop = Math.max(50, Math.min(window.innerHeight - 520, 80 + cascadeOffset));
      win.style.left = `${defaultLeft}px`;
      win.style.top = `${defaultTop}px`;
    }

    openWindows.set(appId, {
      elem: win,
      state: "open",
      origBounds: null
    });

    setupWindowDragging(win, appId);
    renderDock();
    SoundEngine.play("windowOpen");

    // Trigger open animation
    requestAnimationFrame(() => {
      win.classList.add("visible");
    });
  }

  // Bring window to top of stacking order
  function bringToFront(appId) {
    if (!openWindows.has(appId)) return;
    const winData = openWindows.get(appId);
    highestZ += 2;
    winData.elem.style.zIndex = highestZ;
    activeWindowId = appId;

    document.querySelectorAll(".app-window").forEach((w) => w.classList.remove("active-window"));
    winData.elem.classList.add("active-window");
    renderDock();
  }

  // Minimize window to dock
  function minimizeApp(appId) {
    if (!openWindows.has(appId)) return;
    const winData = openWindows.get(appId);
    winData.state = "minimized";
    winData.elem.classList.remove("visible");
    winData.elem.classList.add("minimized");
    SoundEngine.play("windowClose");
    renderDock();
  }

  // Restore minimized window
  function restoreApp(appId) {
    if (!openWindows.has(appId)) return;
    const winData = openWindows.get(appId);
    winData.state = "open";
    winData.elem.classList.remove("minimized");
    winData.elem.classList.add("visible");
    bringToFront(appId);
    SoundEngine.play("windowOpen");
    renderDock();
  }

  // Maximize / Restore window toggle
  function toggleMaximizeApp(appId) {
    if (!openWindows.has(appId)) return;
    const winData = openWindows.get(appId);
    const win = winData.elem;

    if (winData.state === "maximized") {
      // Restore
      winData.state = "open";
      win.classList.remove("maximized");
      if (winData.origBounds) {
        win.style.left = winData.origBounds.left;
        win.style.top = winData.origBounds.top;
        win.style.width = winData.origBounds.width;
        win.style.height = winData.origBounds.height;
      }
    } else {
      // Maximize
      winData.origBounds = {
        left: win.style.left,
        top: win.style.top,
        width: win.style.width,
        height: win.style.height
      };
      winData.state = "maximized";
      win.classList.add("maximized");
    }
    SoundEngine.play("tap", 0.7);
  }

  // Close window
  function closeApp(appId) {
    if (!openWindows.has(appId)) return;
    const winData = openWindows.get(appId);
    winData.elem.classList.remove("visible");
    winData.elem.classList.add("closing");

    SoundEngine.play("windowClose");

    setTimeout(() => {
      winData.elem.remove();
      openWindows.delete(appId);
      if (activeWindowId === appId) {
        activeWindowId = null;
      }
      renderDock();
    }, 200);
  }

  // Trigger playful nudge animation when hit by pebble
  function nudgeWindow(winElem) {
    winElem.classList.remove("nudge");
    void winElem.offsetWidth; // re-flow
    winElem.classList.add("nudge");
  }

  // Setup dragging for desktop windows
  function setupWindowDragging(win, appId) {
    const titleBar = win.querySelector(".window-titlebar");
    if (!titleBar) return;

    let isDragging = false;
    let startX = 0, startY = 0;
    let startLeft = 0, startTop = 0;

    titleBar.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".window-btn")) return;
      if (win.classList.contains("maximized")) return;

      bringToFront(appId);
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      const rect = win.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;

      titleBar.setPointerCapture(e.pointerId);
      win.classList.add("is-dragging");
    });

    titleBar.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const newLeft = Math.max(10, Math.min(window.innerWidth - 120, startLeft + dx));
      const newTop = Math.max(30, Math.min(window.innerHeight - 80, startTop + dy));

      win.style.left = `${newLeft}px`;
      win.style.top = `${newTop}px`;
    });

    function endDrag() {
      if (!isDragging) return;
      isDragging = false;
      win.classList.remove("is-dragging");
    }

    titleBar.addEventListener("pointerup", endDrag);
    titleBar.addEventListener("pointercancel", endDrag);

    // Clicking anywhere inside brings to front
    win.addEventListener("pointerdown", () => {
      bringToFront(appId);
    });
  }

  // Update bottom dock / taskbar items
  function renderDock() {
    if (!dockElem) return;
    dockElem.innerHTML = "";

    if (openWindows.size === 0) {
      dockElem.style.display = "none";
      return;
    }

    dockElem.style.display = "flex";

    openWindows.forEach((winData, appId) => {
      const appMeta = getAppMetadata(appId);
      const btn = document.createElement("button");
      btn.className = `dock-item ${winData.state === "minimized" ? "is-minimized" : ""} ${activeWindowId === appId ? "is-active" : ""}`;
      btn.innerHTML = `<span class="dock-icon">${appMeta.icon}</span><span class="dock-label">${appMeta.name}</span>`;
      btn.addEventListener("click", () => {
        if (winData.state === "minimized") {
          restoreApp(appId);
        } else if (activeWindowId === appId) {
          minimizeApp(appId);
        } else {
          bringToFront(appId);
        }
      });
      dockElem.appendChild(btn);
    });
  }

  // App metadata lookup
  function getAppMetadata(appId) {
    const map = {
      about: { name: "About Me", icon: "🧑‍💻" },
      projects: { name: "Projects", icon: "🚀" },
      skills: { name: "Skills", icon: "⚡" },
      experience: { name: "Experience", icon: "💼" },
      education: { name: "Education", icon: "🎓" },
      github: { name: "GitHub & Code", icon: "🐙" },
      resume: { name: "Resume", icon: "📄" },
      contact: { name: "Contact", icon: "✉️" },
      achievements: { name: "Achievements", icon: "🏆" },
      notes: { name: "Notes & Blog", icon: "📝" },
      building: { name: "Currently Building", icon: "🛠️" },
      playground: { name: "Playground", icon: "🎯" }
    };
    return map[appId] || { name: appId, icon: "📁" };
  }

  // Create Window Element with Header and Content
  function createWindowElement(appId) {
    const meta = getAppMetadata(appId);
    const win = document.createElement("div");
    win.className = "app-window active-window";
    win.id = `window-${appId}`;

    // Window Titlebar with controls
    const titleBar = document.createElement("div");
    titleBar.className = "window-titlebar";
    titleBar.innerHTML = `
      <div class="window-titlebar-left">
        <span class="window-app-icon">${meta.icon}</span>
        <span class="window-title">${meta.name} - MaheerOS</span>
      </div>
      <div class="window-controls">
        <button class="window-btn btn-min" title="Minimize" data-win-action="min">─</button>
        <button class="window-btn btn-max" title="Maximize" data-win-action="max">□</button>
        <button class="window-btn btn-close" title="Close (Esc)" data-win-action="close">✕</button>
      </div>
    `;

    // Window Body
    const body = document.createElement("div");
    body.className = "window-body";
    body.innerHTML = renderAppContent(appId);

    win.appendChild(titleBar);
    win.appendChild(body);

    if (appId === "github") {
      const handle = (window.PORTFOLIO_DATA && window.PORTFOLIO_DATA.profile && window.PORTFOLIO_DATA.profile.handle) || "";
      if (handle) loadGitHubLiveStats(body, handle);
      loadGitHubAchievements(body);
    }

    if (appId === "about") {
      const visitsEl = body.querySelector("#about-visits-count");
      if (visitsEl && cachedVisitCount !== null) {
        visitsEl.textContent = cachedVisitCount;
      }
    }

    // Event listeners for window controls
    titleBar.querySelector('[data-win-action="min"]').addEventListener("click", (e) => {
      e.stopPropagation();
      minimizeApp(appId);
    });

    titleBar.querySelector('[data-win-action="max"]').addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMaximizeApp(appId);
    });

    titleBar.querySelector('[data-win-action="close"]').addEventListener("click", (e) => {
      e.stopPropagation();
      closeApp(appId);
    });

    return win;
  }

  // Cache of the live visit count once fetched, so re-opening the GitHub window
  // doesn't need to re-fetch (and doesn't count another visit).
  let cachedVisitCount = null;

  // ---- GitHub achievements (live) ----
  function renderAchievementBadges(list) {
    if (!Array.isArray(list) || list.length === 0) {
      return '<p class="gh-ach-empty">No achievements yet.</p>';
    }
    return list.map((a) => `
      <a class="gh-badge" href="${a.url}" target="_blank" rel="noopener" title="${a.name}${a.tier ? " " + a.tier : ""}">
        <img src="${a.image}" alt="${a.name}" loading="lazy" />
        <span class="gh-badge-name">${a.name}${a.tier ? ` <b>${a.tier}</b>` : ""}</span>
      </a>
    `).join("");
  }

  let cachedAchievements = null;

  // Pulls the current badge list from the /api/achievements serverless function
  // (which reads the public GitHub profile). Falls back to the static list in
  // portfolio-data.js if the endpoint is unreachable (e.g. file:// or local dev).
  async function loadGitHubAchievements(scope) {
    const box = scope.querySelector("#gh-achievements-list");
    if (!box) return;
    try {
      if (!cachedAchievements) {
        const res = await fetch("/api/achievements");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data.achievements)) throw new Error("Bad response shape");
        cachedAchievements = data.achievements;
      }
      box.innerHTML = renderAchievementBadges(cachedAchievements);
    } catch (err) {
      console.warn("[MaheerOS] Live achievements unavailable, using fallback list. Reason:", err);
    }
  }

  // Fetch live GitHub stats (repos, followers, total stars) and patch them into the
  // given window's body element. Scoped to `scope` rather than document.getElementById
  // so it works regardless of DOM-attachment timing.
  // Falls back silently to the static numbers already in the markup if the API is
  // unreachable, rate-limited, or blocked (e.g. when testing via a file:// URL instead
  // of a real server/deployment — browsers block fetch() to external APIs from file://).
  async function loadGitHubLiveStats(scope, username) {
    try {
      const userRes = await fetch(`https://api.github.com/users/${username}`);
      const remaining = userRes.headers.get("x-ratelimit-remaining");

      if (!userRes.ok) {
        if (userRes.status === 403 && remaining === "0") {
          const resetHeader = userRes.headers.get("x-ratelimit-reset");
          const resetTime = resetHeader ? new Date(Number(resetHeader) * 1000).toLocaleTimeString() : "unknown";
          throw new Error(
            `GitHub's unauthenticated rate limit (60 requests/hour per visitor IP) was hit. ` +
            `It resets at ${resetTime}. This is common while testing repeatedly — real visitors rarely hit it.`
          );
        }
        throw new Error(`GitHub user lookup failed: HTTP ${userRes.status} ${userRes.statusText}`);
      }
      const userData = await userRes.json();

      const repoEl = scope.querySelector("#gh-repos-count");
      const followEl = scope.querySelector("#gh-followers-count");
      if (repoEl) repoEl.textContent = userData.public_repos;
      if (followEl) followEl.textContent = userData.followers;

      // Sum stargazers_count across all public repos (paginated, 100 per page)
      let page = 1;
      let totalStars = 0;
      while (true) {
        const repoRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&page=${page}`);
        if (!repoRes.ok) throw new Error(`GitHub repo list failed: HTTP ${repoRes.status}`);
        const repos = await repoRes.json();
        if (!Array.isArray(repos) || repos.length === 0) break;
        totalStars += repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
        if (repos.length < 100) break;
        page += 1;
      }

      const starsEl = scope.querySelector("#gh-stars-count");
      if (starsEl) starsEl.textContent = totalStars;

      console.info("[MaheerOS] Live GitHub stats loaded:", {
        public_repos: userData.public_repos,
        followers: userData.followers,
        stars: totalStars
      });
    } catch (err) {
      // This is the one console message to check if numbers look stale/hardcoded.
      // Most common cause: opening index.html directly as a file:// URL — browsers
      // block fetch() to external domains from file://. Serve it locally or check
      // the deployed site instead.
      console.error("[MaheerOS] GitHub live stats fetch failed — showing fallback numbers instead. Reason:", err);
    }
  }

  // Increment + fetch a real visit counter via the free Abacus API (no signup/key needed).
  // Runs once per page load from init(), so refreshing/reopening the GitHub window
  // doesn't double-count. Change NAMESPACE if you want to reset the counter to 0.
  function loadVisitCounter() {
    const NAMESPACE = "maheeros-nihedevotee-portfolio";
    const KEY = "visits";
    fetch(`https://abacus.jasoncameron.dev/hit/${NAMESPACE}/${KEY}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Visit counter failed: HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        cachedVisitCount = data.value;
        document.querySelectorAll("#gh-visits-count, #about-visits-count").forEach((el) => {
          el.textContent = cachedVisitCount;
        });
        console.info("[MaheerOS] Live visit count:", cachedVisitCount);
      })
      .catch((err) => {
        console.error("[MaheerOS] Visit counter fetch failed. Reason:", err);
      });
  }

  // Render individual application content
  function renderAppContent(appId) {
    const data = window.PORTFOLIO_DATA || {};

    switch (appId) {
      case "about": {
        const ab = data.about || {};
        const p = data.profile || {};
        return `
          <div class="app-section">
            <div class="profile-header-card">
              ${ab.photo
                ? `<img class="profile-photo" src="${ab.photo}" alt="${p.name}" />`
                : `<div class="profile-avatar">${p.avatarEmoji || "🚀"}</div>`}
              <div class="profile-info">
                <h2 class="profile-name">${ab.heading || p.name}</h2>
                ${(ab.roleLines || [ab.subheading || p.title]).map((l) => `<div class="profile-subtitle">${l}</div>`).join("")}
                <div class="profile-badges">
                  <div class="profile-badge">${p.statusBadge || ""}</div>
                  <div class="profile-badge" id="about-visits-badge" style="background:rgba(255,255,255,0.06); color:#fff;">
                    👁️ Site Visits: <span id="about-visits-count">—</span>
                  </div>
                </div>
              </div>
            </div>

            <hr class="win-hr">

            <div class="about-paragraphs">
              <p>${ab.intro || ""}</p>
              <ul class="about-bullets">
                ${(ab.bullets || []).map((b) => `<li>${b}</li>`).join("")}
              </ul>
              <p>${ab.outro || ""}</p>
            </div>

            ${ab.personal ? `
            <h3 style="color:#ffffff; font-weight:700;">${ab.personal.heading}</h3>
            <div class="about-paragraphs">
              ${(ab.personal.paragraphs || []).map((para) => `<p>${para}</p>`).join("")}
            </div>
            ` : ""}

            <h3>Milestones & Journey</h3>
            <div class="timeline-list">
              ${(ab.journeyHighlights || []).map((h) => `
                <div class="timeline-item">
                  <div class="timeline-year">${h.year}</div>
                  <div class="timeline-content">
                    <strong>${h.title}</strong>
                    <p>${h.desc}</p>
                  </div>
                </div>
              `).join("")}
            </div>

            <div class="callout-box">
              <h4>🎯 Current Learning Focus</h4>
              <ul>
                ${(ab.currentFocus || []).map((item) => `<li>${item}</li>`).join("")}
              </ul>
            </div>

            <h3>Core Technical Passions</h3>
            <div class="tag-cloud">
              ${(ab.interests || []).map((i) => `<span class="app-tag interest-tag">${i}</span>`).join("")}
            </div>
          </div>
        `;
      }

      case "projects": {
        const projects = data.projects || [];
        return `
          <div class="app-section">
            <div class="section-intro">
              <h2>Project Explorer</h2>
              <p>Functional software systems, AI pipelines, and developer tools built with intentionality.</p>
            </div>

            <div class="project-cards-container">
              ${projects.map((proj) => `
                <div class="project-card" id="proj-${proj.id}">
                  <div class="project-card-header">
                    <span class="project-icon">${proj.icon}</span>
                    <div class="project-header-text">
                      <h4>${proj.name}</h4>
                      <span class="project-badge">${proj.badge}</span>
                    </div>
                  </div>

                  <p class="project-tagline">${proj.tagline}</p>

                  <div class="project-problem-solution">
                    <div class="ps-box">
                      <strong>Problem:</strong>
                      <p>${proj.problem}</p>
                    </div>
                    <div class="ps-box">
                      <strong>Solution:</strong>
                      <p>${proj.solution}</p>
                    </div>
                  </div>

                  <div class="project-features">
                    <strong>Key Features:</strong>
                    <ul>
                      ${proj.features.map((f) => `<li>${f}</li>`).join("")}
                    </ul>
                  </div>

                  <div class="project-learned">
                    <strong>💡 What I Learned:</strong>
                    <p>${proj.learned}</p>
                  </div>

                  <div class="project-tech-tags">
                    ${proj.tech.map((t) => `<span class="app-tag">${t}</span>`).join("")}
                  </div>

                  <div class="project-links">
                    <a href="${proj.github}" target="_blank" rel="noopener" class="app-btn outline">🐙 GitHub Repo</a>
                    ${proj.demo ? `<a href="${proj.demo}" target="_blank" rel="noopener" class="app-btn primary">🌐 Live Demo</a>` : ""}
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        `;
      }

      case "skills": {
        const categories = (data.skills && data.skills.categories) || [];
        return `
          <div class="app-section">
            <div class="section-intro">
              <h2>Skills & Technical Arsenal</h2>
              <p>Practical software competencies categorized by discipline and application.</p>
            </div>

            <div class="skills-grid">
              ${categories.map((cat) => `
                <div class="skill-category-card">
                  <div class="category-header">
                    <span class="category-icon">${cat.icon}</span>
                    <h3>${cat.name}</h3>
                  </div>
                  <div class="category-items">
                    ${cat.items.map((item) => `
                      <div class="skill-item">
                        <div class="skill-top">
                          <span class="skill-name">${item.name}</span>
                          <span class="skill-level">${item.level}</span>
                        </div>
                        <div class="skill-desc">${item.desc}</div>
                      </div>
                    `).join("")}
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        `;
      }

      case "experience": {
        const expList = data.experience || [];
        return `
          <div class="app-section">
            <div class="section-intro">
              <h2>Work & Research Experience</h2>
              <p>Practical roles, developer research, and community leadership.</p>
            </div>

            <div class="experience-list">
              ${expList.map((exp) => `
                <div class="experience-card">
                  <div class="exp-header">
                    <div>
                      <h3>${exp.role}</h3>
                      <div class="exp-org">${exp.org} · <span class="exp-loc">${exp.location}</span></div>
                    </div>
                    <div class="exp-period">${exp.period}</div>
                  </div>
                  <ul class="exp-bullets">
                    ${exp.bullets.map((b) => `<li>${b}</li>`).join("")}
                  </ul>
                </div>
              `).join("")}
            </div>
          </div>
        `;
      }

      case "education": {
        const eduList = Array.isArray(data.education) ? data.education : (data.education ? [data.education] : []);
        return `
          <div class="app-section">
            <div class="section-intro">
              <h2>Academic Background</h2>
              <p>Foundations in computational thinking, systems programming, and algorithms.</p>
            </div>

            ${eduList.map((edu) => `
              <div class="edu-card">
                <div class="edu-header">
                  <div>
                    <h3>${edu.degree}</h3>
                    <div class="edu-inst">${edu.institution}</div>
                  </div>
                  <div class="edu-period">${edu.period}</div>
                </div>
                <div class="edu-gpa">Status: <strong>${edu.gpa}</strong></div>

                ${(edu.coursework && edu.coursework.length) ? `
                  <hr class="win-hr">
                  <h4>Relevant Coursework:</h4>
                  <div class="coursework-grid">
                    ${edu.coursework.map((c) => `<div class="course-pill">📖 ${c}</div>`).join("")}
                  </div>
                ` : ""}

                ${(edu.highlights && edu.highlights.length) ? `
                  <h4 style="margin-top:20px;">Academic Highlights:</h4>
                  <ul>
                    ${edu.highlights.map((h) => `<li>${h}</li>`).join("")}
                  </ul>
                ` : ""}
              </div>
            `).join("")}
          </div>
        `;
      }

      case "github": {
        const p = data.profile || {};
        return `
          <div class="app-section">
            <div class="section-intro">
              <h2>GitHub & Open Source</h2>
              <p>Code repositories, commit history, and public engineering activities.</p>
            </div>

            <div class="github-stats-card">
              <div class="gh-avatar">🐙</div>
              <div class="gh-details">
                <h3>${p.handle} on GitHub</h3>
                <p>Building open-source software, testing algorithms, and refining developer tools.</p>
                <a href="${p.github}" target="_blank" rel="noopener" class="app-btn primary">Visit @${p.handle} on GitHub ↗</a>
              </div>
            </div>

            <div class="github-features-grid">
              <div class="gh-tile">
                <div class="tile-number" id="gh-repos-count">29</div>
                <div class="tile-label">Public Repositories</div>
              </div>
              <div class="gh-tile">
                <div class="tile-number" id="gh-stars-count">13</div>
                <div class="tile-label">Stars Earned</div>
              </div>
              <div class="gh-tile">
                <div class="tile-number" id="gh-followers-count">12</div>
                <div class="tile-label">Followers</div>
              </div>
            </div>

            <div class="gh-achievements">
              <h4>🏅 Achievements</h4>
              <div class="gh-badges" id="gh-achievements-list">
                ${renderAchievementBadges(p.githubAchievements)}
              </div>
            </div>

            <div class="callout-box">
              <h4>🤝 Open Source Philosophy</h4>
              <p>I believe transparent, reproducible code is the strongest bedrock for technical learning. Every repository is structured with clear documentation where it counts, and I keep building in the open.</p>
            </div>
          </div>
        `;
      }

      case "resume": {
        const p = data.profile || {};
        const resumeUrl = "assets/Younus_Mohammad_Maheer_Resume.pdf";
        return `
          <div class="app-section">
            <div class="section-intro">
              <h2>Curriculum Vitae / Resume</h2>
              <p>Summary of credentials, engineering capabilities, and qualifications.</p>
            </div>

            <div class="resume-preview-box">
              <div class="resume-header">
                <h1>${p.name}</h1>
                <p>${p.title}</p>
                <div class="resume-contacts">${p.email} · ${p.location}</div>
              </div>

              <div class="resume-section">
                <h3>Executive Summary</h3>
                <p>${p.bioShort}</p>
              </div>

              <div class="resume-actions">
                <a href="${resumeUrl}" download class="app-btn primary">⬇️ Download Resume (PDF)</a>
                <a href="${resumeUrl}" target="_blank" rel="noopener" class="app-btn outline">📄 Open in New Tab</a>
              </div>
            </div>

            <div class="resume-embed-wrap">
              <embed src="${resumeUrl}" type="application/pdf" class="resume-embed" />
            </div>
          </div>
        `;
      }

      case "contact": {
        const c = data.contact || {};
        const p = data.profile || {};
        return `
          <div class="app-section">
            <div class="section-intro">
              <h2>Get in Touch</h2>
              <p>${c.pitch || "Let's connect and discuss technology, projects, or collaborations."}</p>
            </div>

            <div class="contact-channels-grid">
              ${(c.channels || []).map((ch) => `
                <a href="${ch.url}" target="_blank" rel="noopener" class="contact-channel-card">
                  <span class="channel-icon">${ch.icon}</span>
                  <div class="channel-info">
                    <strong>${ch.name}</strong>
                    <span>${ch.value}</span>
                  </div>
                  <span class="channel-arrow">→</span>
                </a>
              `).join("")}
            </div>

            <div class="contact-form-card">
              <h3>Send a Quick Direct Note</h3>
              <form id="contactForm" onsubmit="event.preventDefault(); alert('Message dispatched! Thank you for reaching out.');">
                <div class="form-row">
                  <input type="text" placeholder="Your Name" required class="app-input" />
                  <input type="email" placeholder="Your Email Address" required class="app-input" />
                </div>
                <textarea placeholder="Your message or project inquiry..." rows="4" required class="app-input"></textarea>
                <button type="submit" class="app-btn primary">Send Message 🚀</button>
                <span class="response-guarantee">⏳ ${c.responseTime || "Typically responds within 24 hours"}</span>
              </form>
            </div>
          </div>
        `;
      }

      case "achievements": {
        const ach = data.achievements || [];
        return `
          <div class="app-section">
            <div class="section-intro">
              <h2>Honors & Achievements</h2>
              <p>Recognitions across hackathons, academic excellence, and competitive programming.</p>
            </div>

            <div class="achievements-list">
              ${ach.map((a) => `
                <div class="achievement-card">
                  <div class="ach-title">${a.title}</div>
                  <div class="ach-issuer">${a.issuer}</div>
                  <p class="ach-desc">${a.desc}</p>
                </div>
              `).join("")}
            </div>
          </div>
        `;
      }

      case "notes": {
        const notes = data.notes || [];
        return `
          <div class="app-section">
            <div class="section-intro">
              <h2>Engineering Notes & Deep Dives</h2>
              <p>Concise writeups exploring systems, graphics, algorithms, and development.</p>
            </div>

            ${notes.length ? `
            <div class="notes-container">
              ${notes.map((n) => `
                <article class="note-card">
                  <div class="note-header">
                    <h4>${n.title}</h4>
                    <div class="note-meta"><span class="note-tag">${n.tag}</span> · <span class="note-date">${n.date}</span></div>
                  </div>
                  <p class="note-preview">${n.preview}</p>
                  <pre class="note-code"><code>${n.content}</code></pre>
                </article>
              `).join("")}
            </div>
            ` : `
            <div class="callout-box">
              <h4>✍️ Coming Soon</h4>
              <p>Writeups on projects, competitive programming, and coursework are in the works — check back soon.</p>
            </div>
            `}
          </div>
        `;
      }

      case "building": {
        const cb = data.currentlyBuilding || {};
        return `
          <div class="app-section">
            <div class="section-intro">
              <h2>${cb.status || "Currently Building"}</h2>
              <p>Active lab experiments and development sprints in progress.</p>
            </div>

            <div class="building-list">
              ${(cb.items || []).map((item) => `
                <div class="building-card">
                  <div class="building-dot"></div>
                  <div class="building-content">
                    <h4>${item.project}</h4>
                    <p>${item.detail}</p>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        `;
      }

      case "playground": {
        return `
          <div class="app-section">
            <div class="section-intro">
              <h2>Interactive Toy & Target Practice</h2>
              <p>Experiment with the physics room, slingshot targets, and keyboard shortcuts.</p>
            </div>

            <div class="playground-grid">
              <div class="toy-card">
                <h4>🎯 Slingshot Targets</h4>
                <p>Try shooting pebbles at:</p>
                <ul>
                  <li><strong>Lamp Shade:</strong> Imparts rotational physics impulse.</li>
                  <li><strong>Light Bulb:</strong> Shatters into glass shards & sparks!</li>
                  <li><strong>Wall Switch:</strong> Knocks the switch plate and toggles light.</li>
                  <li><strong>Desktop Icons:</strong> Launches the application directly!</li>
                </ul>
              </div>

              <div class="toy-card">
                <h4>⌨️ Keyboard Shortcuts</h4>
                <ul class="shortcut-list">
                  <li><kbd>Space</kbd> / <kbd>Enter</kbd> : Toggle Light Switch</li>
                  <li><kbd>R</kbd> : Replace Blown Bulb</li>
                  <li><kbd>M</kbd> : Toggle Web Audio Sound</li>
                  <li><kbd>Esc</kbd> : Close Active Window</li>
                </ul>
              </div>
            </div>

            <div class="callout-box">
              <h4>💡 Slingshot Repositioning</h4>
              <p>You can drag the slingshot left and right across the bottom of the screen to choose your shooting angle!</p>
            </div>
          </div>
        `;
      }

      default:
        return `<div class="app-section"><p>Application content loaded.</p></div>`;
    }
  }

  return {
    init,
    openApp,
    closeApp,
    minimizeApp,
    restoreApp,
    bringToFront,
    nudgeWindow
  };
})();