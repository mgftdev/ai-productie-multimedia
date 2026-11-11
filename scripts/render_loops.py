"""Render Lottie-style motion loops (HTML canvas in headless Chromium) to MP4 via ffmpeg.
Usage: python render_loops.py [hero] [wave] [mcp]"""
import os, sys, json, subprocess
from playwright.sync_api import sync_playwright

W = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(W, 'assets', 'motion')
HTML = 'file:///' + os.path.join(W, 'scripts', 'loops.html').replace('\\', '/')
FPS = 30
os.makedirs(OUT, exist_ok=True)


def encode(name, frames_iter, crf=21):
    out = os.path.join(OUT, name)
    p = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', str(FPS), '-i', '-',
                          '-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf), '-pix_fmt', 'yuv420p',
                          '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    first = None
    for i, png in enumerate(frames_iter):
        if i == 0:
            first = png
        p.stdin.write(png)
    p.stdin.close()
    p.wait()
    open(out.replace('.mp4', '_poster.png'), 'wb').write(first)  # poster frame for PowerPoint
    print(name, os.path.getsize(out) // 1024, 'KB')


def frames(page, fn, T):
    for i in range(int(T * FPS)):
        page.evaluate(f'{fn}({i / FPS}, {T})')
        yield page.locator('#c').screenshot(type='png')


which = sys.argv[1:] or ['hero', 'wave', 'mcp']
with sync_playwright() as pw:
    b = pw.chromium.launch()
    page = b.new_page(viewport={'width': 2000, 'height': 1200})
    page.goto(HTML)
    if 'hero' in which:
        page.evaluate('setup(1920,1080)')
        hero = 'file:///' + os.path.join(W, 'assets', 'gen', 'hero_arctic.png').replace('\\', '/')
        page.evaluate(f'loadHero("{hero}")')
        encode('hero_loop.mp4', frames(page, 'drawHero', 8), 22)
    if 'wave' in which:
        page.evaluate('setup(1936,240)')
        encode('wave_loop.mp4', frames(page, 'drawWave', 4), 20)
    if 'mcp' in which:
        cfg = json.load(open(os.path.join(W, 'scripts', 'mcp_layout.json')))
        page.evaluate(f"setup({cfg['w']},{cfg['h']})")
        page.evaluate(f"setNodes({json.dumps(cfg['nodes'])})")
        encode('mcp_loop.mp4', frames(page, 'drawMCP', 6), 20)
    b.close()
