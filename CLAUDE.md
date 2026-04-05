# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

A collection of self-contained browser games. Each game is a **single HTML file** with all CSS and JS inline — no build tools, no dependencies, no package manager.

To play any game: open the `.html` file directly in a browser.

## Conventions

- **One file per game** — HTML, CSS, and JS all inline in a single `.html` file.
- **No external libraries** — Canvas API, vanilla JS, and standard DOM only.
- **Dark background, neon color palette** — consistent visual style across games.
- **All game state lives in JS variables** — no localStorage, no backend.

## Current Games

| File | Description |
|------|-------------|
| `tictactoe.html` | 2-player Tic Tac Toe with score tracking. Dark/neon theme (`#1a1a2e` bg, `#e94560` X, `#a8dadc` O). |
| `shooter_game.html` | 2D side-scrolling Canvas shooter (800×450px). Player: cyan, Enemies: red, Bullets: yellow. Physics with gravity, 5 platforms, enemy AI, particle effects. Game states: start → playing → gameover. |

## shooter_game.html Architecture

The shooter is driven by a single `requestAnimationFrame` loop calling `update(now)` then `draw()`.

- **Game state machine:** `state` variable — `'start'`, `'playing'`, `'gameover'`
- **Physics:** `applyPlatformCollisions(obj)` handles gravity landing, head bumps, and world bounds — shared by both player and enemies
- **Enemy AI:** moves toward player's x each frame; jumps when player is above and `jumpCooldown` allows
- **Collision:** AABB for player↔enemy and platform landing; circle-AABB (`circleAABB`) for bullet↔enemy
- **Difficulty scaling:** spawn interval and enemy speed both derived from `score` at runtime
- **Input:** `keys` object (keydown/keyup), `mouse` position (mousemove), `mousedown` fires bullets and transitions state

## Git & GitHub

- Remote: `https://github.com/jojjobot/neon-shooter`
- Commit and push after every meaningful change.
