"""Arctic Glass theme assets: navy background with steel haze + hairline grid, cold glows, silver line, recoloured icons."""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UI = os.path.join(W, 'assets', 'ui'); IC = os.path.join(W, 'assets', 'icons')
rng = np.random.default_rng(11)

# --- background 1920x1080 (144 px / inch)
w, h = 1920, 1080
y, x = np.mgrid[0:h, 0:w].astype(np.float32)
navy = np.array([10, 18, 32], np.float32)          # #0A1220
steel = np.array([92, 122, 153], np.float32)       # #5C7A99
haze = np.exp(-(((x - w * 0.18) / (w * 0.55)) ** 2 + ((y + h * 0.15) / (h * 0.75)) ** 2))   # top-left light
haze2 = np.exp(-(((x - w * 0.95) / (w * 0.35)) ** 2 + ((y - h * 1.05) / (h * 0.45)) ** 2))  # bottom-right glow
img = navy[None, None] + (steel - navy)[None, None] * (0.42 * haze + 0.18 * haze2)[..., None]
img *= (1 - 0.25 * ((y / h) ** 2))[..., None]
img += rng.normal(0, 1.3, (h, w, 1))
base = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
# hairline layout grid (precise, technical feel)
d = ImageDraw.Draw(base, 'RGBA')
for gx in (86, 1834):
    d.line([(gx, 0), (gx, h)], fill=(160, 185, 215, 22), width=1)
for gy in (216, 986):
    d.line([(0, gy), (w, gy)], fill=(160, 185, 215, 22), width=1)
for gx in (86, 1834):   # small crosshair ticks at grid crossings
    for gy in (216, 986):
        d.line([(gx - 9, gy), (gx + 9, gy)], fill=(200, 220, 240, 70), width=1)
        d.line([(gx, gy - 9), (gx, gy + 9)], fill=(200, 220, 240, 70), width=1)
base.save(os.path.join(UI, 'bg_arctic.jpg'), quality=92)

# --- cold glows (morphing background light)
def orb(name, rgb, size=900, falloff=2.2, alpha=0.75):
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    r = np.sqrt((xx - size / 2) ** 2 + (yy - size / 2) ** 2) / (size / 2)
    a = np.clip(np.exp(-(r * falloff) ** 2) - np.exp(-falloff ** 2), 0, 1); a /= a.max()
    arr = np.zeros((size, size, 4), np.uint8); arr[..., :3] = rgb; arr[..., 3] = (a * 255 * alpha).astype(np.uint8)
    Image.fromarray(arr, 'RGBA').save(os.path.join(UI, name))
orb('orb_steel.png', (120, 152, 190)); orb('orb_ice.png', (184, 211, 238), alpha=0.55); orb('orb_white.png', (230, 240, 252), alpha=0.9)

# --- silver accent line + hairline
def grad(name, gw, gh, stops):
    t = np.linspace(0, 1, gw); cols = np.zeros((gw, 4))
    for c in range(4):
        cols[:, c] = np.interp(t, [s[0] for s in stops], [s[1][c] for s in stops])
    Image.fromarray(np.repeat(cols[None], gh, 0).astype(np.uint8), 'RGBA').save(os.path.join(UI, name))
grad('line_arctic.png', 2000, 12, [(0, (92, 122, 153, 255)), (0.5, (225, 236, 248, 255)), (1, (92, 122, 153, 255))])
grad('line_fade.png', 2000, 12, [(0, (184, 211, 238, 0)), (0.15, (184, 211, 238, 255)), (0.85, (184, 211, 238, 255)), (1, (184, 211, 238, 0))])

# --- icons recoloured: silver -> ice gradient
FONT = ImageFont.truetype(r'C:\Windows\Fonts\SegoeIcons.ttf', 200)
ICONS = {'search': 'E721', 'idea': 'E82F', 'edit': 'E70F', 'doc': 'E8A5', 'image': 'EB9F', 'video': 'E714',
         'mic': 'E720', 'music': 'E8D6', 'speaker': 'E767', 'warning': 'E7BA', 'lock': 'E72E', 'tag': 'E8EC',
         'person': 'E77B', 'people': 'E716', 'robot': 'E99A', 'gears': 'E9F5', 'puzzle': 'EA86', 'bolt': 'E945',
         'chat': 'E8F2', 'layers': 'E81E', 'sliders': 'E9E9', 'cap': 'E7BE', 'fingerprint': 'E928', 'globe': 'E774',
         'loop': 'E895', 'cube': 'F158', 'code': 'E943', 'flask': 'F196', 'monitor': 'E7F4', 'clock': 'E81C',
         'translate': 'E8C1', 'heart': 'EB51', 'apps': 'F0E2', 'storyboard': 'E8A1', 'power': 'E7E8', 'check': 'E8FB'}
g = np.zeros((256, 256, 3), np.float32)
t = np.linspace(0, 1, 256)[:, None] * np.ones((1, 256))
for c, (a, b) in enumerate(zip((240, 246, 252), (150, 185, 222))):
    g[..., c] = a + (b - a) * t
for name, cp in ICONS.items():
    m = Image.new('L', (256, 256), 0)
    ImageDraw.Draw(m).text((128, 128), chr(int(cp, 16)), font=FONT, fill=255, anchor='mm')
    Image.fromarray(np.dstack([g.astype(np.uint8), np.array(m)]), 'RGBA').save(os.path.join(IC, name + '.png'))
print('arctic assets ok')
