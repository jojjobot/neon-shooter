# Neon Striker 3D

A raycaster FPS built entirely in a single HTML file — no frameworks, no build tools, just vanilla JS and the Canvas API.

Open `fps-shooter/neon_striker_3d.html` in any browser and play instantly.

---

## Gameplay

Survive endless waves of neon robots. Each wave gets faster and more dangerous. Chain kills to build your style rank — D all the way up to SS.

- **Pistol** — fast, accurate, unlimited ammo
- **Portal Gun** — shoot any wall to teleport there instantly

---

## Enemies

| Enemy | Description |
|-------|-------------|
| Grunt (red) | Rushes you down. Pathfinds around walls. |
| Shooter (orange) | Keeps its distance and fires at you. |
| Bomber (dark red) | Tanky, fast, explodes on contact for massive damage. Unlocks wave 3+. |

---

## Controls

| Key | Action |
|-----|--------|
| WASD | Move |
| Mouse | Aim |
| Left click | Shoot |
| Shift | Dash (brief invincibility) |
| Right click | Parry |
| 1 / 2 | Switch weapon |
| ESC | Settings |

---

## Settings

- Mouse sensitivity
- Field of view
- Color theme (Default / Blood / Ice / Void)

---

## Technical

- DDA raycaster renderer with z-buffer and perspective-correct sprite rendering
- A* pathfinding on a 0.5-unit sub-grid with per-enemy path diversity via noise seeds
- LOS string-pulling (smoothPath) converts grid paths into smooth diagonal movement
- Humanoid billboard sprites with walk animation, body bob, and 3D shading
- Screen shake, particle bursts, impact animations — all canvas, no libraries

**Single file.** Everything — HTML, CSS, JS — lives in `fps-shooter/neon_striker_3d.html`.

---

## How to Play

```
git clone https://github.com/jojjobot/neon-shooter
```

Then open `fps-shooter/neon_striker_3d.html` in your browser. No install, no server needed.
