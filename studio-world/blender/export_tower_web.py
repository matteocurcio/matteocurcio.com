"""Render the web passes (mobile tower or desktop studio) for matteocurcio.com from curcio_tower.blend.

Mirrors blender/export_web.py (the desktop world), in portrait at 1080 x 2340:
  world_color      the tower as it is (day)
  world_night      the tower at night (warm interior lights, dark sky)
  world_grey       idle pass: flat, low-contrast grey, room shells a light neutral
  world_grey_dark  same, with the room shells dark (dark mode)
  world_bg         the rooms in colour, every object grey
  world_ids        each hotspot as a flat grey level of index * 10, no anti-aliasing, 2x
  world_rooms      each pixel coded by room (1 grading, 2 studio, 3 music, 4 machine) as room * 50, 2x
  hotspots.json    copied from the desktop set (same indices, labels and pages)

Run headless (it reopens the source for every pass, so the scene file is never modified):
  blender -b curcio_tower.blend --python export_tower_web.py
"""
import json, os, shutil, subprocess, sys
import bpy, numpy as np
from mathutils import Vector

SRC = bpy.data.filepath
# The scene lives in <site repo>/studio-world/blender/, so every path is taken relative to it.
LANDING = os.path.dirname(os.path.dirname(os.path.abspath(SRC)))   # studio-world/
# TOWER_SCENE picks the layout: "Curcio Tower" (portrait, phones and upright tablets) or
# "Curcio Studio" (the same rooms instanced two by two, landscape, desktops).
SCENE = os.environ.get("TOWER_SCENE", "Curcio Tower")
STUDIO = SCENE == "Curcio Studio"
SITE_ROOT = os.path.join(os.path.dirname(LANDING), "public", "world")
OUT = os.path.join(LANDING, "web", "assets", "studio" if STUDIO else "mobile")
SITE = SITE_ROOT if STUDIO else os.path.join(SITE_ROOT, "mobile")
# master list of every hotspot (index, slug, label, page); each set keeps the ones it shows
MASTER_HOTSPOTS = os.path.join(LANDING, "web", "assets", "hotspots_all.json")
if not os.path.exists(MASTER_HOTSPOTS): shutil.copy(os.path.join(SITE_ROOT, "hotspots.json"), MASTER_HOTSPOTS)
CWEBP = shutil.which("cwebp") or "/opt/homebrew/bin/cwebp"
SAMPLES = int(os.environ.get("TOWER_SAMPLES", "160"))
ONLY = [s for s in os.environ.get("TOWER_ONLY", "").split(",") if s]
os.makedirs(OUT, exist_ok=True)
W, H = bpy.data.scenes[SCENE].render.resolution_x, bpy.data.scenes[SCENE].render.resolution_y   # the scene camera frames the building

HOT = {
    1:  ("gpanel",),
    2:  ("gkeyboard", "gtablet", "gtrackball"),
    3:  ("gmonL", "gmonR"),
    4:  ("poster2",),
    5:  ("bigmon_",),                                   # reels: the big reference monitor behind the grading desk
    7:  ("projector_", "proj_ceiling", "pscreen"),
    8:  ("cam360", "apple_vision_pro", "avp_pedestal", "holo_cat"),
    9:  ("gchair", "mchair", "schair"),
    11: ("bambu_a1_mini", "ams_"),                      # services: the 3D printer, as on the old desktop world
    10: ("cine", "chart2", "colour_chart", "chart_backing", "chart2_backing"),
    12: ("poster0",),
    13: ("record_",),
    14: ("works_", "kallax", "kbook"),
    15: ("kdesk", "daw_", "music_speaker", "music_woofer", "music_cone", "music_tweeter", "music_stand", "yamaha_dx7", "te_op1",
         "drumpad", "theremin", "bass_guitar", "red_guitar"),
    16: ("rack", "rackB"),
    17: ("smon", "skeyboard", "skeycaps", "smouse"),
    19: ("laser_printer",),
    20: ("airpods_max", "ap_stand"),
    21: ("magazine_",),
    23: ("sync_",),
    24: ("poster1",),
    25: ("sat_",),                                      # radio: the dish on the roof (/radio/, page to come)
}

FLOORS = [("lab", 0.0, 4), ("design", 3.3, 3), ("post", 6.6, 1), ("video", 9.9, 2)]
SHELL_PREFIX = ("lab_", "design_", "post_", "video_", "cyc_limbo", "roof", "parapet", "music_rug", "grade_rug", "rug", "deck",
                "bed", "flower", "shrub", "pv_")   # the roof garden and panels read as building, not as objects
SHELL_EXACT = {"structure", "structure_shade", "trim"}
BEAMS = ("proj_beam0", "proj_beam1", "proj_beam2", "proj_beam3")


def root_of(ob):
    while ob.parent: ob = ob.parent
    return ob


def hotspot_of(ob):
    n = root_of(ob).name
    for k, prefixes in HOT.items():
        if n.startswith(prefixes): return k
    return 0


def is_shell(ob):
    n = root_of(ob).name
    if n.startswith(SHELL_PREFIX) and hotspot_of(ob) == 0: return True
    return any(s.material and s.material.name in SHELL_EXACT for s in getattr(ob, "material_slots", []))


def room_of(ob):
    r = root_of(ob)
    pts = [o.matrix_world @ Vector(c) for o in [r] + list(r.children_recursive)
           if o.type in ("MESH", "CURVE") for c in o.bound_box] or [ob.matrix_world.translation]
    z = sum(p.z for p in pts) / len(pts)
    for name, z0, code in FLOORS:
        if z0 - 0.35 <= z < z0 + 3.0: return code
    return 0


def srgb_to_linear(v): return v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4


def setup(scale=1, samples=SAMPLES):
    s = bpy.data.scenes[SCENE]
    s.render.resolution_x, s.render.resolution_y, s.render.resolution_percentage = W * scale, H * scale, 100
    s.render.film_transparent = True
    s.render.image_settings.file_format = "PNG"; s.render.image_settings.color_mode = "RGBA"
    s.cycles.samples = samples
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.compute_device_type = "METAL"; prefs.get_devices()
        for d in prefs.devices: d.use = True
        s.cycles.device = "GPU"
    except Exception as e:
        print("GPU setup skipped:", e)
    return s


def hide_beams():
    for n in BEAMS:
        o = bpy.data.objects.get(n)
        if o: o.hide_render = True


def render(s, name):
    s.render.filepath = os.path.join(OUT, f"{name}.png")
    bpy.ops.render.render(write_still=True, scene=s.name)
    print("RENDERED", name, flush=True)


def reopen():
    bpy.ops.wm.open_mainfile(filepath=SRC)
    s = bpy.data.scenes[SCENE]
    if bpy.context.window: bpy.context.window.scene = s
    return s


def all_objs(s):
    """Every object that renders in the scene, including the contents of collection instances."""
    seen, out = set(), []
    def add(o):
        if o.name in seen: return
        seen.add(o.name); out.append(o)
        if o.instance_type == "COLLECTION" and o.instance_collection:
            for x in o.instance_collection.all_objects: add(x)
    for o in s.objects: add(o)
    return out


def objs(s): return [o for o in all_objs(s) if o.type in ("MESH", "CURVE", "FONT") and o.data and hasattr(o.data, "materials")]


def lights(s): return [o for o in all_objs(s) if o.type == "LIGHT"]


means = {}
def grey_value(m):
    if m is None or not m.use_nodes: return .55
    nt = m.node_tree; luma = None
    for n in nt.nodes:
        if n.type == "TEX_IMAGE" and n.image and n.image.size[0]:
            if n.image.name not in means:
                px = np.empty(len(n.image.pixels), np.float32); n.image.pixels.foreach_get(px)
                means[n.image.name] = float((px.reshape(-1, 4)[:, :3] @ np.array([.2126, .7152, .0722])).mean())
            luma = means[n.image.name]; break
    if luma is None:
        p = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
        e = next((n for n in nt.nodes if n.type == "EMISSION"), None)
        c = p.inputs["Base Color"].default_value if p else (e.inputs["Color"].default_value if e else (.5, .5, .5))
        luma = .2126 * c[0] + .7152 * c[1] + .0722 * c[2]
    return .30 + .28 * (min(max(luma, 0), 1) ** .45)


def flat_grey(name, g):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    b = nt.nodes.new("ShaderNodeBsdfPrincipled"); b.name = "Principled BSDF"
    b.inputs["Base Color"].default_value = (g, g, g, 1); b.inputs["Roughness"].default_value = .8
    o = nt.nodes.new("ShaderNodeOutputMaterial"); nt.links.new(b.outputs[0], o.inputs[0])
    return m


def flat_emit(name, v):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    e = nt.nodes.new("ShaderNodeEmission"); e.inputs["Color"].default_value = (v, v, v, 1)
    o = nt.nodes.new("ShaderNodeOutputMaterial"); nt.links.new(e.outputs[0], o.inputs[0])
    return m


def greyify(s, shell_grey, objects_grey=True, shells_grey=True):
    cache = {}
    for ob in objs(s):
        shell = is_shell(ob)
        if shell and not shells_grey: continue
        if not shell and not objects_grey: continue
        for slot in ob.material_slots:
            if shell: slot.material = shell_grey; continue
            m = slot.material; key = m.name if m else "_none"
            if key not in cache: cache[key] = flat_grey("grey_" + key, grey_value(m))
            slot.material = cache[key]
        if not ob.material_slots:
            ob.data.materials.append(shell_grey if shell else flat_grey("grey_none", .55))


def flat_pass(s, code_of, step):
    mats = {}
    for ob in objs(s):
        k = code_of(ob)
        if k not in mats: mats[k] = flat_emit(f"code_{step}_{k}", srgb_to_linear(k * step / 255))
        slots = max(1, len(ob.material_slots))
        for sl in ob.material_slots: sl.link = "DATA"
        ob.data.materials.clear()
        for _ in range(slots): ob.data.materials.append(mats[k])
    for o in lights(s): o.hide_render = True
    s.world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0
    s.view_settings.view_transform = "Standard"; s.view_settings.look = "None"; s.view_settings.exposure = 0; s.view_settings.gamma = 1
    s.cycles.samples = 1; s.cycles.use_denoising = False; s.cycles.use_adaptive_sampling = False
    s.cycles.pixel_filter_type = "BOX"; s.cycles.filter_width = 0.01
    s.cycles.max_bounces = 0
    # exact codes, small files: no dithering, 8-bit greyscale on black, max PNG compression
    s.render.dither_intensity = 0; s.render.film_transparent = False
    s.render.image_settings.color_mode = "BW"; s.render.image_settings.compression = 100


def want(name): return not ONLY or name in ONLY


if want("world_color"):
    s = reopen(); setup(); render(s, "world_color")

if want("world_night"):
    s = reopen(); setup()
    bg = s.world.node_tree.nodes.get("Background")
    if bg: bg.inputs["Strength"].default_value *= .06
    for o in lights(s):
        if o.data.type == "SUN": o.data.energy *= .04
        else: o.data.energy *= 1.25; o.data.color = (1.0, .82, .62)
    s.view_settings.exposure = -0.2
    render(s, "world_night")

if want("world_grey") or want("world_grey_dark"):
    s = reopen(); setup()
    shell = flat_grey("shell_neutral", .78)
    greyify(s, shell); hide_beams()
    if want("world_grey"): render(s, "world_grey")
    shell.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (.07, .07, .07, 1)
    if want("world_grey_dark"): render(s, "world_grey_dark")

if want("world_bg"):
    s = reopen(); setup()
    greyify(s, None, objects_grey=True, shells_grey=False); hide_beams()
    render(s, "world_bg")

if want("world_ids"):
    s = reopen(); setup(scale=2); hide_beams()
    flat_pass(s, hotspot_of, 10); render(s, "world_ids")

if want("world_rooms"):
    s = reopen(); setup(scale=2); hide_beams()
    flat_pass(s, room_of, 50); render(s, "world_rooms")

spots = json.load(open(MASTER_HOTSPOTS))
spots = [h for h in spots if h["index"] in HOT]
json.dump(spots, open(os.path.join(OUT, "hotspots.json"), "w"), indent=2)
if os.environ.get("TOWER_COPY", "1") == "1":
    os.makedirs(SITE, exist_ok=True)
    for name in ("world_color", "world_night", "world_grey", "world_grey_dark", "world_bg"):
        src = os.path.join(OUT, f"{name}.png")
        if os.path.exists(src):
            subprocess.run([CWEBP, "-quiet", "-q", "90", "-alpha_q", "100", src, "-o", os.path.join(SITE, f"{name}.webp")], check=True)
    for name in ("world_ids.png", "world_rooms.png", "hotspots.json"):
        if os.path.exists(os.path.join(OUT, name)): shutil.copy(os.path.join(OUT, name), os.path.join(SITE, name))
print("TOWER EXPORT DONE", flush=True)
