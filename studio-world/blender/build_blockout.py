"""Build the four-room isometric blockout for the matteocurcio.com landing page.

Run headless:
  /Applications/Blender.app/Contents/MacOS/Blender -b -P blender/build_blockout.py

Writes blender/world_blockout.blend and blender/preview.png.

Coordinates are authored in "plan units" (1 unit = 0.4 m) matching the web previz:
x runs toward screen lower-right, y toward screen lower-left, z up. The back walls
sit on x=0 and y=0. Blender is right-handed, so plan (x, y) maps to Blender (y, x).

Every clickable object lives in a collection under "Hotspots". Each object carries
custom properties `page` and `label`, and a pass_index shared by its hotspot, so
per-object masks can be rendered later (Object Index / Cryptomatte are enabled).
"""

import math
import os

import bmesh
import bpy
from mathutils import Vector

U = 0.4
HERE = os.path.dirname(os.path.abspath(__file__))

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# ---------------------------------------------------------------- materials

_mats = {}


def lin(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def mat(hex_, emit=0.0, rough=0.6):
    key = (hex_, emit)
    if key in _mats:
        return _mats[key]
    m = bpy.data.materials.new(f"{hex_}{'_emit' if emit else ''}")
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    rgb = tuple(lin(int(hex_[i:i + 2], 16)) for i in (1, 3, 5)) + (1.0,)
    bsdf.inputs["Base Color"].default_value = rgb
    bsdf.inputs["Roughness"].default_value = rough
    if emit:
        bsdf.inputs["Emission Color"].default_value = rgb
        bsdf.inputs["Emission Strength"].default_value = emit
    m.diffuse_color = rgb
    _mats[key] = m
    return m


# -------------------------------------------------------------- collections


def coll(name, parent=None):
    c = bpy.data.collections.new(name)
    (parent or scene.collection).children.link(c)
    return c


C_STRUCT = coll("Structure")
C_DECO = coll("Deco")
C_HOT = coll("Hotspots")
C_LIGHT = coll("Lights & camera")

current = {"coll": C_STRUCT, "page": None, "label": None, "index": 0}
hot_index = 0


def into(c):
    current.update(coll=c, page=None, label=None, index=0)


def hotspot(slug, label, page):
    global hot_index
    hot_index += 1
    c = coll(f"{hot_index:02d}_{slug}", C_HOT)
    c["page"] = page
    c["label"] = label
    current.update(coll=c, page=page, label=label, index=hot_index)


def _finish(obj, colour, emit, bevel):
    obj.data.materials.append(mat(colour, emit))
    current["coll"].objects.link(obj)
    if current["page"]:
        obj["page"] = current["page"]
        obj["label"] = current["label"]
        obj.pass_index = current["index"]
    if bevel:
        mod = obj.modifiers.new("Bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 2
        mod.limit_method = "ANGLE"
    return obj


# ---------------------------------------------------------------- geometry


def box(name, x, y, z, w, d, h, colour, emit=0.0, bevel=0.012):
    """Axis-aligned box from plan corner (x, y, z) with plan size (w, d, h)."""
    sx, sy, sz = d * U, w * U, h * U  # plan -> Blender swap
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector(((v.co.x + 0.5) * sx, (v.co.y + 0.5) * sy, (v.co.z + 0.5) * sz))
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    obj.location = (y * U, x * U, z * U)
    return _finish(obj, colour, emit, bevel if min(sx, sy, sz) > 2 * bevel else 0)


def cyl(name, x, y, z, r, h, colour, rot=(0, 0, 0), seg=32, emit=0.0):
    """Cylinder whose base centre sits at plan (x, y, z)."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r * U, radius2=r * U, depth=h * U)
    bmesh.ops.translate(bm, verts=bm.verts, vec=(0, 0, h * U / 2))
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    obj.location = (y * U, x * U, z * U)
    obj.rotation_euler = rot
    return _finish(obj, colour, emit, 0)


def rod(name, a, b, r, colour, seg=8):
    """Thin cylinder between two plan points a and b."""
    pa = Vector((a[1], a[0], a[2])) * U
    pb = Vector((b[1], b[0], b[2])) * U
    axis = pb - pa
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r * U, radius2=r * U, depth=axis.length)
    bmesh.ops.translate(bm, verts=bm.verts, vec=(0, 0, axis.length / 2))
    bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0),
                     matrix=Vector((0, 0, 1)).rotation_difference(axis.normalized()).to_matrix())
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    obj.location = pa
    return _finish(obj, colour, 0, 0)


# ---------------------------------------------------------------- structure

into(C_STRUCT)
box("slab", 0, 0, -0.6, 20, 20, 0.6, "#bdb6a6", bevel=0.03)
box("floor_grading", 0, 0, 0, 10, 10, 0.02, "#55575b", bevel=0)
box("floor_music", 10, 0, 0, 10, 10, 0.02, "#b88a5a", bevel=0)
box("floor_studio", 0, 10, 0, 10, 10, 0.02, "#ebe7df", bevel=0)
box("floor_machine", 10, 10, 0, 10, 10, 0.02, "#9ea5a9", bevel=0)
box("threshold_x", 9.9, 0, 0, 0.2, 20, 0.15, "#8c8577")
box("threshold_y", 0, 9.9, 0, 20, 0.2, 0.15, "#8c8577")
box("wall_grading_left", -0.4, -0.4, 0, 0.4, 10.4, 7, "#7d7e80")
box("wall_grading_right", 0, -0.4, 0, 10, 0.4, 7, "#7d7e80")
box("wall_music", 10, -0.4, 0, 10, 0.4, 7, "#eadfcd")
box("wall_studio", -0.4, 10, 0, 0.4, 10, 7, "#efece6")

# ------------------------------------------------------------ grading suite

into(coll("Grading suite", C_DECO))
for i, (x, y) in enumerate([(2.1, 0.7), (7.75, 0.7), (2.1, 2.6), (7.75, 2.6)]):
    box(f"desk_leg_{i}", x, y, 0, 0.15, 0.15, 1.8, "#2a2a2a")
box("desk_top", 2, 0.6, 1.8, 6, 2.2, 0.15, "#3b3b3d")
box("sofa_seat", 0.3, 4.6, 0, 1.9, 3.8, 0.9, "#6e4f3d", bevel=0.05)
box("sofa_back", 0.3, 4.6, 0.9, 0.5, 3.8, 0.9, "#6e4f3d", bevel=0.05)
box("chair_post", 5.4, 3.9, 0, 0.3, 0.3, 1, "#2b2b2b")
box("chair_seat", 4.9, 3.4, 1, 1.3, 1.3, 0.25, "#34363a", bevel=0.04)
box("chair_back", 4.9, 4.6, 1.25, 1.3, 0.2, 1.3, "#34363a", bevel=0.04)

hotspot("colour_grading", "Grading panel", "/colour-grading/")
box("panel", 4.3, 1.85, 1.95, 3.4, 0.95, 0.22, "#2a2b2e")
for x, ring in [(4.9, "#e25a4a"), (6.0, "#56b06a"), (7.1, "#4a86e2")]:
    cyl("trackball_ring", x, 2.3, 2.17, 0.38, 0.05, ring)
    cyl("trackball", x, 2.3, 2.17, 0.27, 0.14, "#d8d8d8")

hotspot("editing", "Edit monitor and keyboard", "/editing/")
box("edit_monitor", 2.4, 0.8, 1.95, 2.3, 0.15, 1.35, "#18181a")
box("edit_screen", 2.5, 0.95, 2.03, 2.1, 0.02, 1.19, "#3a4f7a", emit=1.5, bevel=0)
box("edit_keyboard", 2.6, 1.6, 1.95, 1.9, 0.5, 0.08, "#1f1f22")

hotspot("finishing", "Reference monitor and drives", "/finishing/")
box("ref_monitor", 5.1, 0.8, 1.95, 2.6, 0.15, 1.5, "#0f0f10")
box("ref_screen", 5.2, 0.95, 2.03, 2.4, 0.02, 1.34, "#6aa5d6", emit=1.5, bevel=0)
box("drive_shelf", 8.4, 0.3, 0, 1.2, 1.2, 2.6, "#4a4a4c")
for i, c in enumerate(["#d24b3c", "#e3a33a", "#3a8fd2", "#50a86a"]):
    box(f"drive_{i}", 8.55, 1.45, 0.3 + i * 0.55, 0.9, 0.08, 0.35, c)

hotspot("motion", "Wall display", "/motion/")
box("wall_display", 3.2, 0, 4.3, 3.6, 0.1, 1.9, "#141414")
for i, (h, c) in enumerate(zip([0.6, 1.1, 0.8, 1.4, 1.0, 1.5],
                               ["#e0703a", "#e8a13c", "#3aa6a0", "#5b8def", "#c678dd", "#4bb07a"])):
    box(f"bar_{i}", 3.5 + i * 0.52, 0.1, 4.5, 0.34, 0.03, h, c, emit=2, bevel=0)

hotspot("reels", "Client TV", "/reels/")
box("tv_frame", 0, 4.2, 2.3, 0.12, 4.2, 2.4, "#111111")
box("tv_screen", 0.12, 4.35, 2.45, 0.02, 3.9, 2.1, "#2d6f8f", emit=1.5, bevel=0)

hotspot("remote", "Satellite dish", "/remote/")
box("dish_pole", 8.8, -0.3, 7, 0.12, 0.12, 0.9, "#9a9a9a")
cyl("dish", 8.86, -0.1, 7.6, 0.6, 0.08, "#e8e8e8", rot=(math.radians(-60), 0, math.radians(-45)))

# ------------------------------------------------------------- video studio

into(coll("Video studio", C_DECO))
box("cyc_wall", 0, 11, 0, 0.05, 6, 6.3, "#f7f6f2", bevel=0)
box("cyc_floor", 0, 11, 0.02, 3, 6, 0.02, "#f7f6f2", bevel=0)

hotspot("presentation", "Projector", "/presentation/")
box("projection", 0.06, 12, 1.4, 0.02, 4, 2.8, "#e0508a", emit=1.2, bevel=0)
box("projector_pole", 6.3, 14.3, 0, 0.15, 0.15, 3.3, "#333333")
box("projector", 5.8, 13.9, 3.3, 1.1, 0.9, 0.6, "#e6e6e6")

hotspot("immersive", "VR headset on a plinth", "/immersive/")
box("plinth", 6.6, 18.1, 0, 0.8, 0.8, 2.2, "#eeeeee")
box("headset", 6.65, 18.2, 2.2, 0.7, 0.5, 0.35, "#222222", bevel=0.05)

hotspot("training", "Whiteboard", "/training/")
box("wb_leg_a", 8.45, 11.2, 0, 0.1, 0.1, 1.2, "#777777")
box("wb_leg_b", 8.45, 13.7, 0, 0.1, 0.1, 1.2, "#777777")
box("whiteboard", 8.4, 11, 1.2, 0.2, 3, 2, "#fafafa")
box("wb_scribble", 8.6, 11.4, 2.5, 0.02, 1.6, 0.1, "#2f6fd6", bevel=0)
box("wb_note", 8.6, 12.8, 1.6, 0.02, 1.0, 0.25, "#d64a3a", bevel=0)

hotspot("videography", "Camera and softbox", "/videography/")
box("softbox_pole", 2.35, 11.75, 0, 0.1, 0.1, 3.6, "#333333")
box("softbox", 1.9, 11.3, 3.6, 1, 1, 1.1, "#fff1d6", emit=3)
for i, foot in enumerate([(4.9, 16.1, 0), (6.4, 16.2, 0), (5.6, 17.5, 0)]):
    rod(f"tripod_leg_{i}", foot, (5.6, 16.6, 2.9), 0.05, "#2a2a2a")
box("camera_lens", 4.5, 16.4, 3.05, 0.6, 0.45, 0.45, "#2a2a2a")
box("camera_body", 5.1, 16.2, 2.9, 1.1, 0.8, 0.8, "#1b1b1d")

hotspot("services", "Front door", "/services/")
box("door", 0, 18.2, 0, 0.1, 1.5, 4.4, "#8a5a3a")
box("door_knob", 0.1, 18.3, 2.1, 0.12, 0.15, 0.15, "#e0c07a")

hotspot("about", "Coat rack", "/about/")
cyl("rack_base", 1.21, 16.61, 0, 0.4, 0.08, "#6b4a33")
box("rack_pole", 1.15, 16.55, 0, 0.12, 0.12, 4.2, "#6b4a33")
box("jacket", 0.95, 16.4, 2.5, 0.5, 0.5, 1.5, "#3c5a7a", bevel=0.06)
cyl("hat", 1.21, 16.61, 4.2, 0.45, 0.15, "#2b2b2b")

# ------------------------------------------------------------- music corner

into(coll("Music corner", C_DECO))
cyl("rug", 15, 5, 0.02, 3, 0.03, "#8e3b3b", seg=64)

hotspot("musetta", "Musetta poster", "/music/")  # moves to its own page later
box("musetta_poster", 10.6, 0, 3.6, 2.2, 0.05, 3, "#1e2a44", bevel=0)
box("musetta_title", 10.9, 0.05, 4.0, 1.6, 0.02, 0.25, "#e8c35a", bevel=0)
cyl("musetta_moon", 11.7, 0.05, 5.5, 0.6, 0.02, "#e8c35a", rot=(0, math.radians(90), 0))

hotspot("works", "Posters: films and series", "/works/")
for i, (a, b) in enumerate([("#b8322a", "#f2e6c9"), ("#12324a", "#e9a23b"),
                            ("#2f5d3a", "#efe7d2"), ("#3d2a4f", "#e37b5a")]):
    box(f"poster_{i}", 13.4 + i * 1.6, 0, 3.6, 1.25, 0.05, 1.8, a, bevel=0)
    box(f"poster_{i}_art", 13.55 + i * 1.6, 0.05, 4.4, 0.95, 0.02, 0.6, b, bevel=0)

hotspot("music", "Basses, synth and amp", "/music/")
for x, body, guard in [(11.2, "#c0612b", "#e8a24a"), (12.5, "#1d1d1f", "#efe9dc")]:
    box("bass_stand", x - 0.25, 2.3, 0, 0.5, 0.5, 0.3, "#222222")
    face = (0, math.radians(90), 0)  # disc faces the viewer (plan +y)
    cyl("bass_body_low", x, 2.45, 1.0, 0.7, 0.25, body, rot=face)
    cyl("bass_body_high", x, 2.45, 1.6, 0.55, 0.25, body, rot=face)
    box("bass_neck", x - 0.09, 2.6, 1.5, 0.18, 0.1, 2.6, "#d9b27c")
    box("bass_head", x - 0.16, 2.6, 4.1, 0.32, 0.1, 0.45, "#d9b27c")
    box("bass_guard", x - 0.25, 2.7, 1.0, 0.5, 0.03, 0.5, guard, bevel=0)
box("amp", 18.4, 1, 0, 1.3, 1.1, 1.7, "#262626")
cyl("amp_speaker", 19.05, 2.1, 0.7, 0.45, 0.03, "#3a3a3a", rot=(0, math.radians(90), 0))
box("synth_leg_a", 14.2, 2.8, 0, 0.15, 0.4, 1.9, "#333333")
box("synth_leg_b", 17.8, 2.8, 0, 0.15, 0.4, 1.9, "#333333")
box("synth", 13.9, 2.4, 1.9, 4.4, 1.2, 0.28, "#1c1c1e")
box("synth_keys", 14.1, 3.05, 2.18, 4, 0.5, 0.04, "#f3efe6", bevel=0)
for i in range(14):
    if i % 7 not in (2, 6):
        box(f"black_key_{i}", 14.25 + i * 0.28, 3.05, 2.22, 0.12, 0.28, 0.05, "#111111", bevel=0)

# ------------------------------------------------------------- machine room

hotspot("workflow", "Server rack", "/workflow/")
box("rack", 11, 11, 0, 1.6, 1.8, 4.6, "#202326")
for i in range(8):
    box(f"rack_unit_{i}", 11.1, 12.8, 0.35 + i * 0.52, 1.36, 0.03, 0.4, "#2d3136", bevel=0)
    box(f"rack_led_{i}", 12.1, 12.83, 0.5 + i * 0.52, 0.1, 0.02, 0.1,
        "#60a5fa" if i % 2 else "#4ade80", emit=6, bevel=0)

hotspot("code", "The PC", "/code/")
for i, (x, y) in enumerate([(13.6, 11.1), (17.3, 11.1), (13.6, 12.7), (17.3, 12.7)]):
    box(f"pc_desk_leg_{i}", x, y, 0, 0.15, 0.15, 1.8, "#6b5a48")
box("pc_desk", 13.5, 11, 1.8, 4, 1.9, 0.15, "#c9b18d")
box("pc_monitor", 14.4, 11.2, 1.95, 2.3, 0.15, 1.35, "#151518")
box("pc_screen", 14.5, 11.35, 2.03, 2.1, 0.02, 1.19, "#1e2127", emit=1.0, bevel=0)
for i, (x, w, c) in enumerate([(0.2, 0.6, "#c678dd"), (0.35, 1.1, "#61afef"), (0.35, 0.8, "#98c379"),
                                (0.5, 1.2, "#e5c07b"), (0.35, 0.5, "#61afef"), (0.2, 0.9, "#abb2bf")]):
    box(f"code_line_{i}", 14.5 + x, 11.37, 2.03 + 1.02 - i * 0.15, w, 0.01, 0.07, c, emit=3, bevel=0)
box("pc_tower", 17.0, 11.3, 0, 0.6, 1.3, 1.6, "#2a2a2e")
box("pc_chair_post", 15.5, 13.8, 0, 0.2, 0.2, 1, "#3a3a3a")
box("pc_chair_seat", 15, 13.3, 1, 1.2, 1.2, 0.2, "#444444", bevel=0.04)

hotspot("inventory", "Shelf of labelled boxes", "https://inventory.matteocurcio.com")
box("shelf_upright_back", 11, 15, 0, 1.2, 0.12, 4, "#8d8173")
box("shelf_upright_front", 11, 19.28, 0, 1.2, 0.12, 4, "#8d8173")
for level, z in enumerate([0.1, 1.4, 2.7]):
    box(f"shelf_{level}", 11, 15.12, z, 1.2, 4.16, 0.1, "#a89a88")
    for j in range(3):
        y = 15.3 + j * 1.35
        box(f"carton_{level}_{j}", 11.1, y, z + 0.1, 1, 1.15, 1, "#c49a6c", bevel=0.02)
        box(f"label_{level}_{j}", 12.1, y + 0.2, z + 0.45, 0.02, 0.75, 0.3, "#f5f1e8", bevel=0)

hotspot("blog", "Typewriter", "/blog/")
for i, (x, y) in enumerate([(16.6, 14.6), (18.55, 14.6), (16.6, 16.05), (18.55, 16.05)]):
    box(f"tw_table_leg_{i}", x, y, 0, 0.15, 0.15, 1.5, "#5e4030")
box("tw_table", 16.5, 14.5, 1.5, 2.3, 1.75, 0.12, "#7d5639")
box("typewriter", 16.9, 14.9, 1.62, 1.5, 1.1, 0.45, "#2e5047", bevel=0.05)
box("paper", 17.15, 14.95, 2.2, 1, 0.02, 1.1, "#fbf8f0", bevel=0)
box("carriage", 16.75, 14.85, 2.07, 1.8, 0.3, 0.28, "#1f2a28", bevel=0.04)
for r in range(3):
    for k in range(5):
        cyl(f"key_{r}_{k}", 17.1 + k * 0.28, 15.45 + r * 0.18, 2.07, 0.07, 0.05, "#e9e4d6", seg=12)

# ------------------------------------------------------- camera and lighting

into(C_LIGHT)
target = Vector((10 * U, 10 * U, 4.2 * U))
cam_data = bpy.data.cameras.new("Iso camera")
cam_data.type = "ORTHO"
cam_data.ortho_scale = 14.6
cam = bpy.data.objects.new("Iso camera", cam_data)
cam.rotation_euler = (math.radians(54.736), 0, math.radians(135))
forward = cam.rotation_euler.to_matrix() @ Vector((0, 0, -1))
cam.location = target - forward * 40
cam_data.clip_end = 100
C_LIGHT.objects.link(cam)
scene.camera = cam

sun_data = bpy.data.lights.new("Sun", "SUN")
sun_data.energy = 3.0
sun_data.angle = math.radians(8)
sun = bpy.data.objects.new("Sun", sun_data)
sun.rotation_euler = (math.radians(48), 0, math.radians(160))
C_LIGHT.objects.link(sun)

world = bpy.data.worlds.new("World")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.8, 0.8, 0.82, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.7
scene.world = world

# ------------------------------------------------------------------ render

scene.render.engine = "BLENDER_EEVEE_NEXT"
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.film_transparent = True
scene.view_settings.view_transform = "AgX"
try:
    scene.eevee.use_raytracing = True
    scene.eevee.use_shadows = True
except AttributeError:
    pass
layer = scene.view_layers[0]
layer.use_pass_object_index = True
layer.use_pass_cryptomatte_object = True

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "world_blockout.blend"))

scene.render.resolution_percentage = 50
scene.render.filepath = os.path.join(HERE, "preview.png")
bpy.ops.render.render(write_still=True)
scene.render.resolution_percentage = 100
bpy.ops.wm.save_mainfile()
print(f"hotspots: {hot_index}")
