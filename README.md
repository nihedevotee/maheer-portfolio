# Younus Mohammad Maheer — Interactive Developer Portfolio

An exceptional, immersive developer portfolio website merging realistic physics, dynamic volumetric lighting, and a toy slingshot with a retro-modern personal desktop operating system (**MaheerOS v2.4**).

## 🌟 Core Concepts & Mechanics

1. **Dark Room & Cinematic Illumination**:
   - The visitor enters an authentic dark room with faint silhouettes.
   - Turning on the photorealistic wall switch (or shooting it with a pebble) activates the tungsten filament, which warms up and casts a physical volumetric cone of amber light down into the workspace.
   - The desktop environment sits physically in the room and is dynamically illuminated as the lamp swings.

2. **Physically Interactive Hanging Lamp**:
   - Realistic damped pendulum physics.
   - Grab and swing the lamp shade to sweep the warm light cone across the desktop.
   - The lamp reacts to collisions with slingshot pebbles by clanking and swinging with rotational impulse.

3. **Slingshot & Ballistics Mechanics**:
   - Move the slingshot freely along the bottom horizontal slider track.
   - Pull back the leather pouch to aim with parabolic trajectory dots and release to fire.
   - Targets:
     - **Wall Switch:** Knocks the switch plate and toggles the light ON or OFF!
     - **Lamp Shade:** Metallic impact clank and angular impulse kick.
     - **Light Bulb:** Shatters into 40+ physics glass shards and 50+ glowing sparks; room plunges into darkness with a "Replace Bulb" prompt.
     - **Desktop Icons:** Shooting an icon directly launches its application window!
     - **Windows:** Shooting a window causes it to wobble playfully.

4. **Desktop Operating System (MaheerOS)**:
   - Multi-window management system with draggable titlebars.
   - Active window focus (z-index layering).
   - Minimize to bottom dock, maximize/expand, and close controls.
   - 12 full-featured applications:
     - **About Me**: Bio, journey highlights, research passions, current learning.
     - **Projects**: Filterable project cards with problem/solution, tech stack, key features, GitHub & demo links, and "What I Learned".
     - **Skills**: Categorized interactive badges across Languages, Frontend, Backend, Databases, AI/ML, and Tools.
     - **Experience**: Timeline of developer roles, research assistantship, and hackathon leadership.
     - **Education**: Computer Science degree details, coursework, and academic milestones.
     - **GitHub**: Commit stats, open source philosophy, and repository links.
     - **Resume**: Interactive CV preview and official PDF request action.
     - **Contact**: Interactive note dispatch form and direct channels.
     - **Achievements**: Hackathon wins, academic honors, and competitive programming highlights.
     - **Notes & Blog**: Technical deep-dives into Attention Mechanisms, requestAnimationFrame game loops, and resilient APIs.
     - **Currently Building**: Live feed of active side projects.
     - **Playground**: Toy sandbox with target practice and keyboard shortcuts.

5. **Synthesized Web Audio API**:
   - Zero external audio files — 100% synthesized procedural sound effects for relay clicks, chain squeaks, rubber stretching, twang release, metal clank, and glass shattering. Includes master mute toggle.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `Space` / `Enter` | Toggle Wall Light Switch |
| `R` | Replace Blown Bulb |
| `M` | Toggle Web Audio Sound |
| `Esc` | Close Topmost Active Window |

---

## 🛠️ How to Customize Portfolio Content

All personal content is cleanly isolated in **`js/portfolio-data.js`**. You can update your information without touching any HTML or CSS:

- **Name, Title, Social Links & Bio**: Edit `profile` object.
- **Projects**: Add or edit projects in the `projects` array with your actual GitHub links and live demos.
- **Skills**: Add or modify categories and skill items in `skills.categories`.
- **Experience & Education**: Update `experience` and `education` arrays.
- **Contact Details**: Update `contact.channels` with your preferred email and socials.

---

## 🚀 Running Locally

Open `index.html` directly in any modern browser:

```bash
# Optional: Use any local HTTP server
npx serve .
# or
python -m http.server 8000
```