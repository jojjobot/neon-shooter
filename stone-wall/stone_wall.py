#!/usr/bin/env python3
"""
Ancient Stone Wall with Ivy — OBJ/MTL Generator
================================================
Run:    python stone_wall.py
Output: stone_wall.obj  +  stone_wall.mtl

Import both files into Blender (File > Import > Wavefront OBJ),
Unity, Godot, or any 3D viewer that supports OBJ.

What's generated:
  • 10 rows of individually-sized sandstone blocks in a classic brick bond.
    Each block has a random width, height, and a ±12 mm face-depth offset
    so the wall surface looks uneven and hand-laid.
  • ~22 % of blocks are moss-covered (greenish material).
  • A thin mortar back-panel fills the gaps between blocks.
  • 5 main ivy vines grow from the base, branch up to 3 levels, and trail
    leaves (fresh / dark / dead-autumn) every other step.
  • 3 drooping vines hang from the top edge.
  • 18 scattered loose leaves sprinkled across the face for density.
  • 7 physically-based materials with ambient / diffuse / specular / opacity.
"""

import random, math

rng = random.Random(42)          # fixed seed → reproducible output

# ─── Geometry buffers ─────────────────────────────────────────────────────────
_verts  = []    # (x, y, z)
_norms  = []    # (nx, ny, nz)  deduplicated
_groups = {}    # mat_name → list of "vi//ni  vi//ni  vi//ni" strings

def _v(x, y, z):
    _verts.append((round(x, 5), round(y, 5), round(z, 5)))
    return len(_verts)           # 1-based OBJ index

def _n(nx, ny, nz):
    key = (round(nx, 4), round(ny, 4), round(nz, 4))
    try:
        return _norms.index(key) + 1
    except ValueError:
        _norms.append(key)
        return len(_norms)

def _tri(mat, a, an, b, bn, c, cn):
    _groups.setdefault(mat, []).append(f"{a}//{an} {b}//{bn} {c}//{cn}")

def _quad(mat, a, an, b, bn, c, cn, d, dn):
    """Two triangles forming a quad (CCW winding = front-facing normal)."""
    _tri(mat, a, an, b, bn, c, cn)
    _tri(mat, a, an, c, cn, d, dn)

# ─── Primitives ───────────────────────────────────────────────────────────────

def add_box(mat, x0, x1, y0, y1, z0, z1, dz_front=0.0):
    """
    Axis-aligned box.
    dz_front is added to z1 to push/pull only the front face —
    positive = stone protrudes, negative = stone recesses.
    """
    zf = z1 + dz_front

    # Front face (normal +Z)
    a = _v(x0, y0, zf);  b = _v(x1, y0, zf)
    c = _v(x1, y1, zf);  d = _v(x0, y1, zf)
    # Back face (normal −Z)
    e = _v(x0, y0, z0);  f = _v(x1, y0, z0)
    g = _v(x1, y1, z0);  h = _v(x0, y1, z0)

    nF = _n( 0, 0,  1);  nB = _n(0,  0, -1)
    nL = _n(-1, 0,  0);  nR = _n(1,  0,  0)
    nT = _n( 0, 1,  0);  nD = _n(0, -1,  0)

    _quad(mat, a,nF, b,nF, c,nF, d,nF)   # front
    _quad(mat, f,nB, e,nB, h,nB, g,nB)   # back
    _quad(mat, e,nL, a,nL, d,nL, h,nL)   # left
    _quad(mat, b,nR, f,nR, g,nR, c,nR)   # right
    _quad(mat, d,nT, c,nT, g,nT, h,nT)   # top
    _quad(mat, e,nD, f,nD, b,nD, a,nD)   # bottom


def add_leaf(cx, cy, cz, size, rx, ry, rz, mat):
    """
    Flat leaf quad centred at (cx, cy, cz), rotated by Euler XYZ angles.
    Rendered double-sided (forward + reversed winding).
    """
    hs = size * 0.5
    raw = [(-hs,-hs,0), (hs,-hs,0), (hs,hs,0), (-hs,hs,0)]

    def rot(p, axis, a):
        c, s = math.cos(a), math.sin(a)
        x, y, z = p
        if axis == 'x': return (x,  y*c - z*s,  y*s + z*c)
        if axis == 'y': return (x*c + z*s, y, -x*s + z*c)
        return (x*c - y*s,  x*s + y*c, z)

    rotated = []
    for p in raw:
        p = rot(p, 'x', rx); p = rot(p, 'y', ry); p = rot(p, 'z', rz)
        rotated.append((p[0]+cx, p[1]+cy, p[2]+cz))

    # Transformed +Z is the front normal
    nr = rot((0,0,1), 'x', rx); nr = rot(nr, 'y', ry); nr = rot(nr, 'z', rz)
    nr_b = (-nr[0], -nr[1], -nr[2])
    ni  = _n(*nr);   ni_b = _n(*nr_b)

    vis = [_v(*p) for p in rotated]
    _quad(mat, vis[0],ni,   vis[1],ni,   vis[2],ni,   vis[3],ni)    # front
    _quad(mat, vis[3],ni_b, vis[2],ni_b, vis[1],ni_b, vis[0],ni_b)  # back


def add_vine_segment(x0, y0, z0, x1, y1, z1, thickness, mat):
    """
    Rectangular prism along a vine segment — a thin stick with 4 sides.
    The prism is oriented so its long axis follows the segment direction,
    its width (XY-plane) is perpendicular, and its depth is in ±Z.
    """
    t  = thickness * 0.5
    dx, dy = x1 - x0, y1 - y0
    length = math.hypot(dx, dy)
    if length < 1e-5:
        return

    # Perpendicular vector in XY plane (unit, scaled by t)
    px = (-dy / length) * t
    py = ( dx / length) * t

    # Front (+Z) face verts, then back (−Z) face verts
    vf = [
        _v(x0 + px, y0 + py, z0 + t),   # 0: start-right-front
        _v(x0 - px, y0 - py, z0 + t),   # 1: start-left-front
        _v(x1 - px, y1 - py, z1 + t),   # 2: end-left-front
        _v(x1 + px, y1 + py, z1 + t),   # 3: end-right-front
    ]
    vb = [
        _v(x0 + px, y0 + py, z0 - t),   # 0: start-right-back
        _v(x0 - px, y0 - py, z0 - t),   # 1: start-left-back
        _v(x1 - px, y1 - py, z1 - t),   # 2: end-left-back
        _v(x1 + px, y1 + py, z1 - t),   # 3: end-right-back
    ]

    nF  = _n(0, 0,  1);  nB  = _n(0, 0, -1)
    # Side normals = ±perpendicular direction
    nP  = _n(-dy/length, dx/length, 0)
    nPN = _n( dy/length,-dx/length, 0)

    _quad(mat, vf[0],nF,  vf[1],nF,  vf[2],nF,  vf[3],nF)   # front face
    _quad(mat, vb[1],nB,  vb[0],nB,  vb[3],nB,  vb[2],nB)   # back face
    _quad(mat, vb[0],nP,  vf[0],nP,  vf[3],nP,  vb[3],nP)   # right side
    _quad(mat, vf[1],nPN, vb[1],nPN, vb[2],nPN, vf[2],nPN)  # left side


# ─── Stone wall ───────────────────────────────────────────────────────────────
WALL_W   = 2.00    # metres wide
WALL_H   = 1.85    # metres tall
WALL_D   = 0.30    # metres deep
MOR_H    = 0.016   # mortar gap between rows
MOR_V    = 0.013   # mortar gap between columns

# Mortar back-face — visible in the gaps between stones
add_box('mortar', 0.0, WALL_W, 0.0, WALL_H, 0.0, WALL_D * 0.06)

y = 0.0
for row in range(11):
    row_h = rng.uniform(0.13, 0.22)

    n_stones = rng.randint(4, 6)
    avail_w  = WALL_W - (n_stones + 1) * MOR_V
    ws = [rng.uniform(0.24, 0.58) for _ in range(n_stones)]
    total = sum(ws)
    ws = [w / total * avail_w for w in ws]

    # Classic alternating brick bond — odd rows start with a half-stone offset
    offset = ws[0] * 0.42 if (row % 2 == 1) else 0.0

    # Partial stone at left edge (continuation from previous row's bond)
    if offset > MOR_V * 2:
        pw = offset - MOR_V
        if pw > 0.04:
            mat = 'moss_stone' if rng.random() < 0.22 else 'stone'
            add_box(mat,
                    0.0, pw,
                    y + MOR_H, y + row_h - MOR_H,
                    0.0, WALL_D,
                    dz_front=rng.uniform(-0.011, 0.007))

    x = (offset + MOR_V) if offset > 0 else MOR_V
    for sw in ws:
        x1 = min(x + sw, WALL_W)
        if x >= WALL_W - 0.02:
            break
        mat = 'moss_stone' if rng.random() < 0.22 else 'stone'
        add_box(mat,
                x, x1,
                y + MOR_H, y + row_h - MOR_H,
                0.0, WALL_D,
                dz_front=rng.uniform(-0.013, 0.009))
        x = x1 + MOR_V

    # Partial stone at right edge
    if x < WALL_W - 0.02:
        mat = 'moss_stone' if rng.random() < 0.22 else 'stone'
        add_box(mat,
                x, WALL_W,
                y + MOR_H, y + row_h - MOR_H,
                0.0, WALL_D,
                dz_front=rng.uniform(-0.010, 0.006))

    y += row_h
    if y >= WALL_H:
        break


# ─── Ivy vines ────────────────────────────────────────────────────────────────
PI = math.pi

def grow_vine(sx, sy, sz, dir_x, dir_y, length, depth=0):
    """
    Recursively grow one vine branch.
    sx,sy,sz  — start position in world space
    dir_x,dir_y — growth direction (will be normalised)
    length    — total branch length in metres
    depth     — recursion depth (limits branching)
    """
    if length < 0.06 or depth > 3:
        return

    step   = 0.055          # segment length
    steps  = max(2, int(length / step))
    x, y, z = sx, sy, sz

    for i in range(steps):
        # Wander slightly off the main direction each step
        nx = x + dir_x * step + rng.uniform(-0.022, 0.022)
        ny = y + dir_y * step + rng.uniform(-0.008, 0.030)
        nz = z + rng.uniform(-0.004, 0.003)

        # Stay on/near the wall face
        nx = max(0.01, min(WALL_W - 0.01, nx))
        ny = max(0.00, min(WALL_H + 0.12, ny))
        nz = max(-0.015, min(WALL_D + 0.018, nz))

        thickness = max(0.003, 0.010 - depth * 0.0022 - i * 0.0003)
        add_vine_segment(x, y, z, nx, ny, nz, thickness, 'vine')

        # Leaves every 2 steps
        if i % 2 == 0:
            r = rng.random()
            lmat = ('leaf_dead'  if r < 0.10 else
                    'leaf_dark'  if r < 0.48 else
                    'leaf_light')
            lsize = rng.uniform(0.026, 0.074)
            lx = (x + nx) * 0.5 + rng.uniform(-0.028, 0.028)
            ly = (y + ny) * 0.5 + rng.uniform(-0.022, 0.022)
            lz = nz + rng.uniform(0.007, 0.040)
            add_leaf(lx, ly, lz, lsize,
                     rng.uniform(-0.55, 0.55),
                     rng.uniform(-0.75, 0.75),
                     rng.uniform(-PI,   PI),
                     lmat)

        # Spawn one branch near the midpoint
        if i == steps // 2 and depth < 2 and rng.random() < 0.68:
            bd  = (dir_x + rng.uniform(-0.85, 0.85),
                   dir_y + rng.uniform(-0.25, 0.50))
            bl  = math.hypot(*bd)
            if bl > 0.01:
                grow_vine(nx, ny, nz,
                          bd[0] / bl, bd[1] / bl,
                          length * rng.uniform(0.28, 0.52),
                          depth + 1)

        x, y, z = nx, ny, nz


# Five main vines growing upward from the base
vine_starts = [
    (0.14, 0.00, WALL_D, 1.55),
    (0.58, 0.00, WALL_D, 1.25),
    (1.05, 0.00, WALL_D, 1.72),
    (1.58, 0.00, WALL_D, 1.35),
    (1.90, 0.00, WALL_D, 0.95),
]
for sx, sy, sz, lgt in vine_starts:
    dx = rng.uniform(-0.12, 0.12)
    dy = rng.uniform(0.88, 1.00)
    dl = math.hypot(dx, dy)
    grow_vine(sx, sy, sz, dx / dl, dy / dl, lgt)

# Three drooping vines hanging from the top
for sx in [0.38, 1.00, 1.70]:
    grow_vine(sx, WALL_H + 0.04, WALL_D,
              rng.uniform(-0.18, 0.18), -1.0,
              rng.uniform(0.30, 0.65), depth=1)

# Scatter loose leaves across the face for extra density
for _ in range(22):
    lx    = rng.uniform(0.05, WALL_W - 0.05)
    ly    = rng.uniform(0.18, WALL_H - 0.08)
    lz    = WALL_D + rng.uniform(0.004, 0.022)
    lsize = rng.uniform(0.020, 0.062)
    lmat  = 'leaf_dark' if rng.random() < 0.60 else 'leaf_light'
    add_leaf(lx, ly, lz, lsize,
             rng.uniform(-0.40, 0.40),
             rng.uniform(-0.65, 0.65),
             rng.uniform(-PI,   PI),
             lmat)


# ─── Write OBJ ────────────────────────────────────────────────────────────────
MAT_ORDER = ['mortar', 'stone', 'moss_stone', 'vine',
             'leaf_light', 'leaf_dark', 'leaf_dead']

with open('stone_wall.obj', 'w') as f:
    f.write("# Ancient Stone Wall with Ivy\n")
    f.write("# Generated by stone_wall.py\n")
    f.write(f"# {len(_verts):,} vertices   {len(_norms)} normals\n")
    f.write("mtllib stone_wall.mtl\n\n")

    f.write("# Vertices\n")
    for vx, vy, vz in _verts:
        f.write(f"v {vx} {vy} {vz}\n")

    f.write("\n# Vertex Normals\n")
    for nx, ny, nz in _norms:
        f.write(f"vn {nx} {ny} {nz}\n")

    f.write("\n# Faces (grouped by material)\n")
    for mat in MAT_ORDER:
        faces = _groups.get(mat, [])
        if not faces:
            continue
        f.write(f"\ng {mat}\nusemtl {mat}\n")
        for face in faces:
            f.write(f"f {face}\n")


# ─── Write MTL ────────────────────────────────────────────────────────────────
#   Ka = ambient   Kd = diffuse   Ks = specular   Ns = shininess
#   d  = opacity (1.0 = fully opaque)   illum 2 = full PBR-style lighting
MATERIALS = [
    # name          Ka                  Kd                  Ks               Ns    d     comment
    ('mortar',      (0.08,0.07,0.05),  (0.54,0.49,0.40),  (0.03,0.03,0.02), 6.0,  1.00, "Aged mortar between stones"),
    ('stone',       (0.10,0.09,0.07),  (0.45,0.38,0.30),  (0.07,0.06,0.05), 12.0, 1.00, "Weathered sandstone block"),
    ('moss_stone',  (0.05,0.09,0.04),  (0.26,0.39,0.18),  (0.02,0.04,0.02),  5.0, 1.00, "Stone face covered in moss"),
    ('vine',        (0.05,0.04,0.02),  (0.19,0.13,0.07),  (0.01,0.01,0.01),  5.0, 1.00, "Woody ivy stem"),
    ('leaf_light',  (0.04,0.10,0.03),  (0.17,0.52,0.15),  (0.06,0.12,0.05), 24.0, 0.93, "Fresh bright-green ivy leaf"),
    ('leaf_dark',   (0.03,0.07,0.02),  (0.09,0.34,0.09),  (0.02,0.05,0.02), 18.0, 0.88, "Deep dark-green ivy leaf"),
    ('leaf_dead',   (0.08,0.06,0.02),  (0.41,0.29,0.10),  (0.02,0.02,0.01),  7.0, 0.82, "Dead or autumn-coloured leaf"),
]

with open('stone_wall.mtl', 'w') as f:
    f.write("# Ancient Stone Wall Materials\n\n")
    for name, Ka, Kd, Ks, Ns, d, comment in MATERIALS:
        f.write(f"newmtl {name}\n")
        f.write(f"# {comment}\n")
        f.write(f"Ka {Ka[0]:.3f} {Ka[1]:.3f} {Ka[2]:.3f}\n")
        f.write(f"Kd {Kd[0]:.3f} {Kd[1]:.3f} {Kd[2]:.3f}\n")
        f.write(f"Ks {Ks[0]:.3f} {Ks[1]:.3f} {Ks[2]:.3f}\n")
        f.write(f"Ns {Ns:.1f}\n")
        f.write(f"d  {d:.2f}\n")
        f.write("illum 2\n\n")


# ─── Summary ──────────────────────────────────────────────────────────────────
total_tris = sum(len(v) for v in _groups.values())
print("✓  stone_wall.obj  +  stone_wall.mtl  written")
print(f"   {len(_verts):>7,} vertices")
print(f"   {len(_norms):>7,} normals")
print(f"   {total_tris:>7,} triangles total")
print()
print("   Material breakdown:")
w = max(len(m) for m in MAT_ORDER)
for mat in MAT_ORDER:
    n = len(_groups.get(mat, []))
    if n:
        bar = '█' * (n // 80)
        print(f"     {mat:<{w}}  {n:>5} tris  {bar}")
print()
print("   Import into Blender: File > Import > Wavefront (.obj)")
print("   Wall dimensions: 2.00 m wide × 1.85 m tall × 0.30 m deep")
