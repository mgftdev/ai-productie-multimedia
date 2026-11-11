import asyncio, sys, json
from playwright.async_api import async_playwright
OUT = sys.argv[1]
CHECK = r"""() => {
  const s = document.querySelector('.slide.on'); const res = {cls: s.className.replace('slide ','').replace(' on',''), issues: []};
  const R = (e) => e.getBoundingClientRect();
  const kids = [...s.children].filter(e => !e.matches('.card-bg, video, .sun, svg.rays, .pipe, .ahead, .ig-links, .ig-pills, .ag-cols, .hive, .mcp, svg.road') && getComputedStyle(e).display !== 'none');
  const vis = (e) => { const r = R(e); return r.width > 2 && r.height > 2 && getComputedStyle(e).opacity !== '0'; };
  const boxes = kids.filter(vis).map(e => ({n: (e.className.baseVal ?? e.className).toString().split(' ')[0] || e.tagName, r: R(e)}));
  for (const b of boxes) {
    if (b.r.left < 60) res.issues.push(`${b.n} left=${b.r.left.toFixed(0)}`);
    if (b.r.right > 1540) res.issues.push(`${b.n} right=${b.r.right.toFixed(0)}`);
    if (b.r.bottom > 870) res.issues.push(`${b.n} bottom=${b.r.bottom.toFixed(0)}`);
    if (b.r.top < 30) res.issues.push(`${b.n} top=${b.r.top.toFixed(0)}`);
  }
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i].r, c = boxes[j].r, ox = Math.min(a.right, c.right) - Math.max(a.left, c.left), oy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
    if (ox > 4 && oy > 4) res.issues.push(`overlap ${boxes[i].n} × ${boxes[j].n} (${ox.toFixed(0)}×${oy.toFixed(0)})`);
  }
  const clipped = [...s.querySelectorAll('*')].filter(e => (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1) && getComputedStyle(e).overflow === 'hidden' && !e.matches('.title, .kicker, .ln, video, img, .df-media, .cine, .side-media, .gen, .ba, .pr-stack, .sp-bar, .pr-track')).map(e => e.className);
  if (clipped.length) res.issues.push('clipped: ' + clipped.join(','));
  const k = s.querySelector('.kicker'), t = s.querySelector('.title, .hero-title');
  res.kicker = k ? [R(k).left.toFixed(0), R(k).top.toFixed(0)] : null; res.title = t ? [R(t).left.toFixed(0), R(t).top.toFixed(0), R(t).bottom.toFixed(0)] : null;
  const all = [...s.querySelectorAll('*')].filter(e => vis(e) && !e.closest('.card-bg') && e.tagName !== 'VIDEO');
  const top = Math.min(...all.map(e => R(e).top)), bot = Math.max(...all.filter(e=>R(e).bottom<=900).map(e => R(e).bottom));
  res.content = [top.toFixed(0), bot.toFixed(0)];
  return res; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1600,"height":900})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("http://localhost:8765/"); await pg.wait_for_timeout(1500)
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(5000)
        for i in range(16):
            if i: await pg.keyboard.press("ArrowRight"); await pg.wait_for_timeout(7500 if i in (3,9,10,14) else 5000)
            await pg.mouse.move(1599, 899)
            await pg.screenshot(path=f"{OUT}/s{i+1:02d}.jpg", type="jpeg", quality=72)
            print(json.dumps(await pg.evaluate(CHECK), ensure_ascii=False))
        print("errors:", errs); await b.close()
asyncio.run(main())
