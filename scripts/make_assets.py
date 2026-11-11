import os, re, numpy as np, fitz
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UI = os.path.join(W, 'assets', 'ui'); LG = os.path.join(W, 'assets', 'logos')
rng = np.random.default_rng(7)
# --- background 1920x1080: deep navy with soft vignette, faint dot grid, grain
w, h = 1920, 1080
y, x = np.mgrid[0:h, 0:w].astype(np.float32)
base = np.array([6, 9, 18], np.float32)
glow = np.exp(-(((x - w*0.5)/(w*0.75))**2 + ((y - h*1.05)/(h*0.9))**2))
img = base[None, None, :] + glow[..., None]*np.array([10, 14, 30], np.float32)
vign = 1 - 0.35*np.clip(((x-w/2)/(w/2))**2 + ((y-h/2)/(h/2))**2, 0, 1)
img *= vign[..., None]
img += rng.normal(0, 1.6, (h, w, 1))
dots = ((x % 48 < 2) & (y % 48 < 2)).astype(np.float32)[..., None] * np.array([22, 28, 50], np.float32) * (0.4 + 0.6*glow[..., None])
img += dots
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(os.path.join(UI, 'bg.png'))
# --- orbs (RGBA soft glow)
def orb(name, rgb, size=900, falloff=2.2):
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    r = np.sqrt((xx-size/2)**2 + (yy-size/2)**2)/(size/2)
    a = np.clip(np.exp(-(r*falloff)**2) - np.exp(-falloff**2), 0, 1)
    a = a/a.max()
    arr = np.zeros((size, size, 4), np.uint8); arr[..., :3] = rgb; arr[..., 3] = (a*255*0.85).astype(np.uint8)
    Image.fromarray(arr, 'RGBA').save(os.path.join(UI, name))
orb('orb_blue.png', (47, 110, 255)); orb('orb_violet.png', (139, 92, 246)); orb('orb_cyan.png', (34, 200, 238))
# --- gradient strips (blue -> violet -> pink) horizontal and vertical
def grad(name, gw, gh, stops, vertical=False):
    n = gh if vertical else gw
    t = np.linspace(0, 1, n)
    cols = np.zeros((n, 3))
    for c in range(3):
        cols[:, c] = np.interp(t, [s[0] for s in stops], [s[1][c] for s in stops])
    if vertical: arr = np.repeat(cols[:, None, :], gw, 1)
    else: arr = np.repeat(cols[None, :, :], gh, 0)
    Image.fromarray(arr.astype(np.uint8)).save(os.path.join(UI, name))
STOPS = [(0, (47, 123, 255)), (0.55, (139, 92, 246)), (1, (232, 121, 249))]
grad('grad_h.png', 2000, 12, STOPS); grad('grad_v.png', 12, 2000, STOPS, True)
grad('grad_card.png', 1200, 1200, [(0, (20, 30, 70)), (1, (40, 20, 70))])
# spectrum bar closed->open
grad('grad_spectrum.png', 2000, 40, [(0, (139, 92, 246)), (0.5, (47, 123, 255)), (1, (34, 211, 238))])
# soft fade overlays for image edges (black -> transparent)
def fade(name, gw, gh, direction):
    t = np.linspace(0, 1, gw if direction in ('l', 'r') else gh)
    a = np.clip(t, 0, 1)**1.6
    if direction == 'l': a = a[::-1]; al = np.repeat(a[None, :], gh, 0)
    elif direction == 'r': al = np.repeat(a[None, :], gh, 0)
    elif direction == 'b': al = np.repeat(a[:, None], gw, 1)
    else: al = np.repeat(a[::-1][:, None], gw, 1)
    arr = np.zeros((gh, gw, 4), np.uint8); arr[..., :3] = (6, 9, 18); arr[..., 3] = (al*255).astype(np.uint8)
    Image.fromarray(arr, 'RGBA').save(os.path.join(UI, name))
fade('fade_l.png', 800, 400, 'l'); fade('fade_b.png', 400, 600, 'b'); fade('fade_r.png', 800, 400, 'r')
# --- logos: simple-icons SVG -> white PNG
for f in os.listdir(os.path.join(W, 'assets', 'logos_dl')):
    if not f.endswith('.svg'): continue
    svg = open(os.path.join(W, 'assets', 'logos_dl', f), encoding='utf-8').read()
    svg = svg.replace('<svg ', '<svg fill="#FFFFFF" width="512" height="512" ', 1)
    doc = fitz.open(stream=svg.encode(), filetype='svg')
    pix = doc[0].get_pixmap(alpha=True, dpi=72)
    pix.save(os.path.join(LG, f.replace('.svg', '.png')))
print('assets ok')
# --- icon candidate sheet (Segoe Fluent Icons)
fp = r'C:\Windows\Fonts\SegoeIcons.ttf'
if not os.path.exists(fp): fp = r'C:\Windows\Fonts\segmdl2.ttf'
cps = 'E721 E82F EA80 E70F E8A5 E7C3 EB9F E8B9 E714 E7F4 E720 E8D6 EC4F E767 E8F4 E7BA E72E E8D7 E946 E77B E716 E902 E81C E943 E9D9 E99A E8C8 E790 E771 E7C1 E8EC E968 E8AB E895 E713 E9F5 E8CB EBD2 E93C E9CA F196 E7B8 E8D4 E8A1 E909 EA86 E928 E945 E7AD E773 E8B5 EB51 E701 E753 E774 E8F2 E91B E9A6 EA37 ED5A E7E8 E8BD E80F E719 E9E9 EBC6 E8E5 E8A7 E8C1 EA8F E76E E7EF EB68 E7F8 E70A E8FB E8F3 E9CE E7E7 E8EF E81E EBE8 F158 E83D E9D2 EC05 E8F6 E78B E7BE E12B E1CB E7B5 F0E2'.split()
fnt = ImageFont.truetype(fp, 44); lab = ImageFont.truetype('consola.ttf', 13)
cols = 12; rows = (len(cps)+cols-1)//cols
sh = Image.new('RGB', (cols*96, rows*90), (14, 20, 38)); d = ImageDraw.Draw(sh)
for i, c in enumerate(cps):
    cx, cy = (i % cols)*96, (i//cols)*90
    d.text((cx+26, cy+8), chr(int(c, 16)), font=fnt, fill='white'); d.text((cx+26, cy+66), c, font=lab, fill=(150, 160, 200))
sh.save(os.path.join(os.environ['SCR'], 'icons.png')); print(fp)
