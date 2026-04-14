# Movement FPS Shooter — Design Summary

## Concept
A fast-paced, skill-expressive first-person shooter built in **Unity (C#)**.
Inspired by **ULTRAKILL**, **DOOM Eternal**, **Quake**, and **Titanfall 2**.
The core fantasy: move fast, kill aggressively, look stylish doing it.

## Engine & Language
- Unity
- C#
- No third-party libraries — pure Unity systems

## Core Pillars

### Movement
- **Quake-style bhopping** — air acceleration caps wish-speed, not total velocity, so skilled players gain speed through strafe-jumping
- **Dash** — ground + air (1 air dash max), redirects momentum instead of canceling it
- **Coyote time** (0.12s) + **jump buffering** (0.12s) for forgiving, rhythm-friendly jumps
- High gravity (-28) + strong jump force = snappy arc, not floaty
- Speed is a reward — no stamina, no punishment for moving fast

### Combat
- **Hitscan + projectile hybrid** weapons with distinct feel per gun
- **Parry mechanic** — 0.25s window, reflects projectiles back for 3× damage + freeze-frame
- **No passive health regen** — kills drop health (ULTRAKILL bloodpump style, ~25 HP per kill)

### Style System
- **Style Meter** with ranks: D → C → B → A → S → SS → SSS
- Filled by hits, kills, and parries; parries reward the most
- 3s decay delay before it starts dropping
- Idle penalty (-5 pts/sec) punishes camping
- Drives **music intensity** (4–6 layered stems crossfade with rank)

### Arena Design
- Vertical arenas with open air space
- Enemy placement forces constant movement
- No cover mechanic — standing still gets you killed

## Class Architecture

```
GameManager
├── ArenaState, WaveController, MusicIntensityLayer
├── refs → StyleMeter, PlayerController

PlayerController
├── VelocityState, InputBuffer, CoyoteTimer, DashState
├── refs → WeaponBase[], StyleMeter

WeaponBase (abstract)
├── HitscanWeapon, ProjectileWeapon, ParryShield
└── fires → BulletBase (pooled)

EnemyBase (abstract)
├── HealthComponent, AggroState, ProjectileSpawner
└── subclass → GroundGrunt

StyleMeter
├── ComboScore, ActiveRank, DecayTimer
└── drives → StyleUI, MusicIntensityLayer
```

## Files Generated (Skeleton Code)
| File | Purpose |
|------|---------|
| `PlayerController.cs` | Input, Quake air-accel, bhopping, dash, wall-jump |
| `WeaponBase.cs` | Abstract weapon + HitscanWeapon + ParryShield |
| `EnemyBase.cs` | Health, aggro state, kill rewards, GroundGrunt subclass |
| `StyleMeter.cs` | Rank tracking, decay, music intensity hooks |
| `GameManager.cs` | Wave spawning, arena state machine, music layering |

## Status
- [x] Architecture designed
- [x] Skeleton code written for all 5 core classes
- [ ] Unity project not yet created
- [ ] No assets yet
