/* 4x-CPU-throttled FPS trace: story scrub + section-boundary scroll.
   Usage: node scripts/fps.mjs   (server on :3000)
   Reports avg fps + dropped-frame % (frames > 24ms at 60Hz target)
   for (a) a 6s scripted glide through the story, (b) hero→details. */
import { chromium } from "playwright";

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const ctx = await browser.newContext({ viewport: { width: 400, height: 720 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);

await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.getByText("Press the Seal", { exact: false }).waitFor({ state: "visible", timeout: 45000 });
await page.locator("button", { hasText: "H" }).first().click();
await page.waitForFunction(() => document.body.style.overflow !== "hidden", null, { timeout: 25000 });
await page.waitForTimeout(2000);

await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

async function trace(name, fn) {
  const stats = await page.evaluate(async (body) => {
    const frames = [];
    let last = performance.now();
    let go = true;
    const loop = () => { const n = performance.now(); frames.push(n - last); last = n; if (go) requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    await new Function("return (async () => {" + body + "})()")();
    go = false;
    frames.shift();
    const avg = 1000 / (frames.reduce((a, b) => a + b, 0) / frames.length);
    const dropped = frames.filter((f) => f > 24).length / frames.length;
    const worst = Math.max(...frames);
    return { avg: +avg.toFixed(1), droppedPct: +(dropped * 100).toFixed(1), worstMs: +worst.toFixed(0), n: frames.length };
  }, fn);
  console.log(`${name}: avg ${stats.avg}fps · ${stats.droppedPct}% >24ms · worst ${stats.worstMs}ms · ${stats.n} frames`);
}

// (a) story scrub: animate scroll through the whole story over 6s
await page.evaluate(() => {
  const s = document.querySelector("#story");
  window.scrollTo({ top: s.offsetTop, behavior: "instant" });
});
await page.waitForTimeout(600);
await trace("story-scrub ", `
  const s = document.querySelector('#story');
  const total = s.offsetHeight - innerHeight;
  const t0 = performance.now();
  await new Promise((res) => {
    const step = () => {
      const p = Math.min(1, (performance.now() - t0) / 6000);
      window.scrollTo({ top: s.offsetTop + p * total, behavior: 'instant' });
      if (p < 1) requestAnimationFrame(step); else res();
    };
    requestAnimationFrame(step);
  });
`);

// (b) boundary scroll: hero → details over 5s (crosses exit/enter scrubs)
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await page.waitForTimeout(600);
await trace("boundaries  ", `
  const d = document.querySelector('#details');
  const end = d.offsetTop;
  const t0 = performance.now();
  await new Promise((res) => {
    const step = () => {
      const p = Math.min(1, (performance.now() - t0) / 5000);
      window.scrollTo({ top: p * end, behavior: 'instant' });
      if (p < 1) requestAnimationFrame(step); else res();
    };
    requestAnimationFrame(step);
  });
`);

await browser.close();
