"""Compress generated media for the deck and render icon glyphs (Segoe Fluent Icons) to PNG."""
import os, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
G = os.path.join(W, 'assets', 'gen'); D = os.path.join(W, 'assets', 'deck'); I = os.path.join(W, 'assets', 'icons')
os.makedirs(D, exist_ok=True); os.makedirs(I, exist_ok=True)

# images -> JPG ~1920 px wide
for f, wmax in [('mars.png', 1600), ('mars_anime.png', 1600), ('flux_headphones.jpg', 1600),
                ('bucharest.png', 1920), ('storyboard.png', 1600), ('hero.png', 1920)]:
    im = Image.open(os.path.join(G, f)).convert('RGB')
    if im.width > wmax:
        im = im.resize((wmax, round(im.height * wmax / im.width)), Image.LANCZOS)
    im.save(os.path.join(D, os.path.splitext(f)[0] + '.jpg'), quality=88, optimize=True)

# Kling clips -> 1600x900, poster frame PNG
for v in ['kling_bucharest', 'kling_origami']:
    src = os.path.join(G, v + '.mp4'); dst = os.path.join(D, v + '.mp4')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-an', '-vf', 'scale=1600:900:force_original_aspect_ratio=increase,crop=1600:900',
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', dst], check=True)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', '0.3', '-i', dst, '-frames:v', '1', '-vf', 'scale=1280:720',
                    os.path.join(D, v + '_poster.png')], check=True)
    print(v, os.path.getsize(dst) // 1024, 'KB')

# icons: white glyph with soft blue->violet gradient, 256px
FONT = ImageFont.truetype(r'C:\Windows\Fonts\SegoeIcons.ttf', 200)
ICONS = {'search': 'E721', 'idea': 'E82F', 'edit': 'E70F', 'doc': 'E8A5', 'image': 'EB9F', 'video': 'E714',
         'mic': 'E720', 'music': 'E8D6', 'speaker': 'E767', 'warning': 'E7BA', 'lock': 'E72E', 'tag': 'E8EC',
         'person': 'E77B', 'people': 'E716', 'robot': 'E99A', 'gears': 'E9F5', 'puzzle': 'EA86', 'bolt': 'E945',
         'chat': 'E8F2', 'layers': 'E81E', 'sliders': 'E9E9', 'cap': 'E7BE', 'fingerprint': 'E928', 'globe': 'E774',
         'loop': 'E895', 'cube': 'F158', 'code': 'E943', 'flask': 'F196', 'monitor': 'E7F4', 'clock': 'E81C',
         'translate': 'E8C1', 'heart': 'EB51', 'apps': 'F0E2', 'storyboard': 'E8A1', 'power': 'E7E8', 'check': 'E8FB'}
grad = np.zeros((256, 256, 3), np.float32)
t = np.linspace(0, 1, 256)[None, :] * 0.6 + np.linspace(0, 1, 256)[:, None] * 0.4
for c, (a, b) in enumerate(zip((150, 190, 255), (200, 160, 255))):
    grad[..., c] = a + (b - a) * t
for name, cp in ICONS.items():
    m = Image.new('L', (256, 256), 0)
    ImageDraw.Draw(m).text((128, 128), chr(int(cp, 16)), font=FONT, fill=255, anchor='mm')
    arr = np.dstack([grad.astype(np.uint8), np.array(m)])
    Image.fromarray(arr, 'RGBA').save(os.path.join(I, name + '.png'))
    # plain white variant
    wa = np.zeros((256, 256, 4), np.uint8); wa[..., :3] = 255; wa[..., 3] = np.array(m)
    Image.fromarray(wa, 'RGBA').save(os.path.join(I, name + '_w.png'))
print('icons', len(ICONS))
