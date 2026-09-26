"""Render the three web passes for matteocurcio.com/world/ from world_blockout.blend.

Run inside Blender with the main scene open:
    exec(open(bpy.path.abspath("//export_web.py")).read())

Writes to ../web/assets (PNG) and, if SITE is set, to the site's public/world (WebP):
  world_color  - the scene as it is
  world_grey   - the unselected pass: flat, low-contrast grey, no textures or glow
  world_bg     - the room (floors, walls, limbo, rug) in colour, every object grey
  world_ids    - each hotspot as a flat grey level of index * 10, no anti-aliasing, at 2x resolution
  world_rooms  - each pixel coded by its room (1 grading, 2 studio, 3 music, 4 machine) as room * 50, at 2x
  hotspots.json - index, slug, label and page for each hotspot with objects
The passes are built on throwaway copies; the main file is reopened at the end.
"""

import json
import os
import shutil
import subprocess

import bpy
import numpy as np
from mathutils import Vector

HERE = bpy.path.abspath("//")
MAIN = os.path.join(HERE, "world_blockout.blend")
OUT = os.path.normpath(os.path.join(HERE, "..", "web", "assets"))
# Legacy: the live /world/ renders now come from curcio_tower.blend via export_tower_web.py.
# This script only writes into the site when WORLD_WRITE_SITE=1, so it can't overwrite them by accident.
SITE = (os.path.normpath(os.path.join(HERE, "..", "..", "public", "world"))
        if os.environ.get("WORLD_WRITE_SITE") == "1" else "")
CWEBP = shutil.which("cwebp") or "/opt/homebrew/bin/cwebp"
SHELL = {"room_floor_uniform", "room_wall_uniform", "pal#f7efe1"}   # the room itself, not its contents
os.makedirs(OUT, exist_ok=True)


def render(name, scale=1):
    s = bpy.context.scene
    s.render.resolution_x, s.render.resolution_y, s.render.resolution_percentage = 1920 * scale, 1080 * scale, 100
    s.render.film_transparent = True
    s.render.image_settings.file_format = "PNG"
    s.render.image_settings.color_mode = "RGBA"
    s.render.filepath = os.path.join(OUT, f"{name}.png")
    bpy.ops.render.render(write_still=True)


def hide_helpers():
    for n in ("projector_beam",):
        ob = bpy.data.objects.get(n)
        if ob:
            ob.hide_render = True


bpy.ops.wm.save_mainfile()

# ---------------------------------------------------------------- hotspot table
hotspots = []
for c in bpy.data.collections["Hotspots"].children:
    if c.all_objects:
        hotspots.append({"index": int(c.name[:2]), "slug": c.name[3:],
                         "label": c.get("label", c.name[3:]), "page": c.get("page", "")})
with open(os.path.join(OUT, "hotspots.json"), "w") as f:
    json.dump(hotspots, f, indent=2)

# ---------------------------------------------------------------- colour
render("world_color")

# ---------------------------------------------------------------- grey
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "world_pass_unselected.blend"))
means = {}


def image_luma(im):
    if im.name not in means:
        px = np.empty(len(im.pixels), np.float32)
        im.pixels.foreach_get(px)
        means[im.name] = float((px.reshape(-1, 4)[:, :3] @ np.array([.2126, .7152, .0722])).mean())
    return means[im.name]


def grey_value(m):
    """Flat grey for a material in the unselected pass."""
    if m.name in SHELL:
        return .78                   # floors, walls and limbo stay bright, so objects read against them
    luma = None
    nt = m.node_tree
    for n in nt.nodes:
        if n.type == "TEX_IMAGE" and n.image:
            luma = image_luma(n.image)
            break
    if luma is None:
        p = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
        e = next((n for n in nt.nodes if n.type == "EMISSION"), None)
        c = p.inputs["Base Color"].default_value if p else (e.inputs["Color"].default_value if e else (.5, .5, .5))
        luma = .2126 * c[0] + .7152 * c[1] + .0722 * c[2]
    return .30 + .28 * (min(max(luma, 0), 1) ** .45)


def make_grey(m, g):
    nt = m.node_tree
    nt.nodes.clear()
    b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    b.inputs["Base Color"].default_value = (g, g, g, 1)
    b.inputs["Roughness"].default_value = .8
    o = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(b.outputs[0], o.inputs[0])
    try:
        m.surface_render_method = "DITHERED"
    except AttributeError:
        pass


def make_grey_cutout(m, g):
    """Like make_grey, but keeps the source image's alpha so a cut-out shape
    (e.g. the AR hologram sprite) stays a silhouette instead of a solid card."""
    nt = m.node_tree
    img = next((n.image for n in nt.nodes if n.type == "TEX_IMAGE" and n.image), None)
    nt.nodes.clear()
    b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    b.inputs["Base Color"].default_value = (g, g, g, 1)
    b.inputs["Roughness"].default_value = .8
    o = nt.nodes.new("ShaderNodeOutputMaterial")
    if img is not None:
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = img
        nt.links.new(tex.outputs["Alpha"], b.inputs["Alpha"])
        m.blend_method = "BLEND"
    nt.links.new(b.outputs[0], o.inputs[0])
    try:
        m.surface_render_method = "DITHERED"
    except AttributeError:
        pass


CUTOUT_MATERIALS = {"ar_cat_holo"}
for m in [m for m in bpy.data.materials if m.use_nodes]:
    if m.name in CUTOUT_MATERIALS:
        make_grey_cutout(m, grey_value(m))
    else:
        make_grey(m, grey_value(m))
# every room surface gets one shared neutral, so an unlit room never hints at its colour
shell_objs = {o.name for o in bpy.data.collections["Structure"].all_objects} | {"cyc", "rug"}
shell_grey = bpy.data.materials.new("shell_neutral")
shell_grey.use_nodes = True
make_grey(shell_grey, .78)
for n in shell_objs:
    ob = bpy.data.objects.get(n)
    if ob and ob.data and hasattr(ob.data, "materials"):
        for i in range(len(ob.data.materials)):
            ob.data.materials[i] = shell_grey
hide_helpers()
bpy.ops.wm.save_mainfile()
render("world_grey")

# night variant of the idle pass for dark mode: only the room shell (floor/walls/limbo) goes dark,
# objects keep the same grey values as the day pass
shell_grey.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (.07, .07, .07, 1)
render("world_grey_dark")

# ---------------------------------------------------------------- background: the room in colour, every object grey
bpy.ops.wm.open_mainfile(filepath=MAIN)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "world_pass_bg.blend"))
shell_objs = {o.name for o in bpy.data.collections["Structure"].all_objects} | {"cyc", "rug"}
grey_copies = {}
for ob in bpy.data.objects:
    if ob.name in shell_objs or not hasattr(ob.data, "materials") or ob.data is None:
        continue
    for i, m in enumerate(ob.data.materials):
        if m is None or not m.use_nodes:
            continue
        if m.name not in grey_copies:
            g = grey_value(m)
            c = m.copy(); c.name = f"grey_{m.name}"
            (make_grey_cutout if m.name in CUTOUT_MATERIALS else make_grey)(c, g)
            grey_copies[m.name] = c
        ob.data.materials[i] = grey_copies[m.name]
hide_helpers()
bpy.ops.wm.save_mainfile()
render("world_bg")

# ---------------------------------------------------------------- ids
bpy.ops.wm.open_mainfile(filepath=MAIN)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "world_pass_ids.blend"))


def srgb_to_linear(v):
    return v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4


id_mats = {}


def id_material(k):
    if k not in id_mats:
        m = bpy.data.materials.new(f"id_{k:02d}")
        m.use_nodes = True
        nt = m.node_tree
        nt.nodes.clear()
        e = nt.nodes.new("ShaderNodeEmission")
        v = srgb_to_linear(k * 10 / 255)
        e.inputs["Color"].default_value = (v, v, v, 1)
        o = nt.nodes.new("ShaderNodeOutputMaterial")
        nt.links.new(e.outputs[0], o.inputs[0])
        id_mats[k] = m
    return id_mats[k]


id_cutout_mats = {}


def id_material_cutout(k, img):
    """Like id_material, but hit-tests only the sprite's opaque silhouette.
    A hologram's own alpha is intentionally < 1 for the look, which would
    otherwise both mis-round the id colour and drop below the 0.5 hit-test
    cutoff, so any non-zero source alpha is snapped to fully opaque first."""
    key = (k, img.name)
    if key not in id_cutout_mats:
        m = bpy.data.materials.new(f"id_{k:02d}_{img.name}")
        m.use_nodes = True
        m.blend_method = "BLEND"
        nt = m.node_tree
        nt.nodes.clear()
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = img
        v = srgb_to_linear(k * 10 / 255)
        e = nt.nodes.new("ShaderNodeEmission")
        e.inputs["Color"].default_value = (v, v, v, 1)
        threshold = nt.nodes.new("ShaderNodeMath")
        threshold.operation = "GREATER_THAN"
        threshold.inputs[1].default_value = 0.02
        transp = nt.nodes.new("ShaderNodeBsdfTransparent")
        mix = nt.nodes.new("ShaderNodeMixShader")
        o = nt.nodes.new("ShaderNodeOutputMaterial")
        nt.links.new(tex.outputs["Alpha"], threshold.inputs[0])
        nt.links.new(threshold.outputs[0], mix.inputs["Fac"])
        nt.links.new(transp.outputs[0], mix.inputs[1])
        nt.links.new(e.outputs[0], mix.inputs[2])
        nt.links.new(mix.outputs[0], o.inputs[0])
        id_cutout_mats[key] = m
    return id_cutout_mats[key]


for ob in bpy.data.objects:
    if ob.type not in ("MESH", "CURVE", "FONT") or not ob.data or not hasattr(ob.data, "materials"):
        continue
    k = ob.pass_index if ob.get("page") else 0
    slots = max(1, len(ob.data.materials))
    # a cut-out sprite (e.g. the AR hologram) should only be hit-testable on its
    # opaque silhouette, not its whole quad
    cutout_img = None
    for m in ob.data.materials:
        if m and m.name in CUTOUT_MATERIALS:
            cutout_img = next((n.image for n in m.node_tree.nodes if n.type == "TEX_IMAGE" and n.image), None)
            break
    ob.data.materials.clear()
    for _ in range(slots):
        ob.data.materials.append(id_material_cutout(k, cutout_img) if cutout_img else id_material(k))
hide_helpers()
s = bpy.context.scene
s.view_settings.view_transform = "Standard"
s.view_settings.look = "None"
s.view_settings.exposure = 0
s.view_settings.gamma = 1
s.render.filter_size = 0.0
s.eevee.taa_render_samples = 1
for light in (o for o in bpy.data.objects if o.type == "LIGHT"):
    light.hide_render = True
s.world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0
bpy.ops.wm.save_mainfile()
render("world_ids", scale=2)          # 2x: the page derives soft edge coverage from it

# ---------------------------------------------------------------- rooms: every pixel coded by the room it belongs to
# 1 grading, 2 studio, 3 music, 4 machine, as a flat grey level of room * 50 (same unlit setup as the ids pass)
ROOM_OF_NAME = {"floor_grading": 1, "wall_grading_left": 1, "wall_grading_right": 1, "floor_studio": 2, "wall_studio": 2,
                "cyc": 2, "floor_music": 3, "wall_music": 3, "rug": 3, "floor_machine": 4}
room_mats = {}


def room_material(r):
    if r not in room_mats:
        m = bpy.data.materials.new(f"room_{r}")
        m.use_nodes = True
        nt = m.node_tree
        nt.nodes.clear()
        e = nt.nodes.new("ShaderNodeEmission")
        v = srgb_to_linear(r * 50 / 255)
        e.inputs["Color"].default_value = (v, v, v, 1)
        o = nt.nodes.new("ShaderNodeOutputMaterial")
        nt.links.new(e.outputs[0], o.inputs[0])
        room_mats[r] = m
    return room_mats[r]


def room_of(ob):
    root = ob
    while root.parent:
        root = root.parent
    if root.name in ROOM_OF_NAME:
        return ROOM_OF_NAME[root.name]
    pts = [o.matrix_world @ Vector(c) for o in [root] + list(root.children_recursive)
           if o.type in ("MESH", "CURVE", "FONT") for c in o.bound_box] or [root.matrix_world.translation]
    cx = sum(p.x for p in pts) / len(pts) / .4          # plan y
    cy = sum(p.y for p in pts) / len(pts) / .4          # plan x
    return (1 if cx < 10 else 2) if cy < 10 else (3 if cx < 10 else 4)


bpy.context.view_layer.update()
for ob in bpy.data.objects:
    if ob.type not in ("MESH", "CURVE", "FONT") or not ob.data or not hasattr(ob.data, "materials"):
        continue
    slots = max(1, len(ob.data.materials))
    mat = room_material(room_of(ob))
    ob.data.materials.clear()
    for _ in range(slots):
        ob.data.materials.append(mat)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "world_pass_rooms.blend"))
render("world_rooms", scale=2)

# ---------------------------------------------------------------- copy to the site
if SITE and os.path.isdir(os.path.dirname(SITE)):
    os.makedirs(SITE, exist_ok=True)
    for name in ("world_color", "world_grey", "world_grey_dark", "world_bg"):
        subprocess.run([CWEBP, "-quiet", "-q", "90", "-alpha_q", "100",
                        os.path.join(OUT, f"{name}.png"), "-o", os.path.join(SITE, f"{name}.webp")], check=True)
    shutil.copy(os.path.join(OUT, "world_ids.png"), os.path.join(SITE, "world_ids.png"))
    shutil.copy(os.path.join(OUT, "world_rooms.png"), os.path.join(SITE, "world_rooms.png"))
    shutil.copy(os.path.join(OUT, "hotspots.json"), os.path.join(SITE, "hotspots.json"))

bpy.ops.wm.open_mainfile(filepath=MAIN)
print(f"exported {len(hotspots)} hotspots")
