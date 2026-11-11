"""Headless check of the web deck: screenshots at fixed moments of intro, transitions and overview.
Usage: python scripts/test_web.py <out_dir>   (needs the local server on :8765)"""
import os, sys
from playwright.sync_api import sync_playwright

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
shots = []

with sync_playwright() as pw:
    b = pw.chromium.launch()
    p = b.new_page(viewport={"width": 1600, "height": 900})
    errors = []
    p.on("pageerror", lambda e: errors.append(str(e)))
    p.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    p.goto("http://localhost:8765/")

    def snap(name, wait):
        p.wait_for_timeout(int(wait * 1000))
        path = os.path.join(OUT, f"{len(shots):02d}_{name}.jpg")
        p.screenshot(path=path, type="jpeg", quality=80)
        shots.append(path)

    snap("intro_0.6s", 0.6); snap("intro_3s", 2.4)
    p.keyboard.press("ArrowRight"); snap("open_0.5s", 0.5); snap("open_1.0s", 0.5); snap("open_2.2s", 1.2)
    p.keyboard.press("ArrowRight"); snap("s2_0.35s", 0.35); snap("s2_0.8s", 0.45); snap("s2_1.6s", 0.8); snap("s2_4s", 2.4)
    p.mouse.move(150, 300); p.hover(".s2 .ms:nth-child(3) .lbl"); snap("s2_hover", 0.5)
    p.keyboard.press("ArrowRight"); snap("s3_0.4s", 0.4); snap("s3_0.9s", 0.5); snap("s3_3s", 2.1)
    p.hover(".co:nth-child(5)"); p.mouse.move(820, 520); snap("s3_tilt", 0.6)
    p.keyboard.press("ArrowLeft"); snap("back_s2", 3.0)
    p.keyboard.press("ArrowLeft"); snap("back_s1_1s", 1.0); snap("back_s1_3s", 2.0)
    p.keyboard.press("Escape"); snap("overview_0.6s", 0.6); snap("overview_2s", 1.4)
    p.keyboard.press("n"); snap("notes", 0.6)
    print("errors:", errors)
    print("body class:", p.evaluate("document.body.className"))
    b.close()
print("\n".join(shots))
