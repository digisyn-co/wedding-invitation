import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.getByText("Click the Seal", { exact: false }).waitFor({ state: "visible", timeout: 30000 });
await page.locator("button", { hasText: "H" }).first().click();
await page.waitForFunction(() => document.body.style.overflow !== "hidden", null, { timeout: 20000 }).catch(() => {});
await page.evaluate(() => { const el = document.querySelector("#venue"); window.scrollTo({ top: el.offsetTop, behavior: "instant" }); });
await page.waitForTimeout(1000);
const res = await page.evaluate(() => new Promise((resolve) => {
  const m = document.querySelector('#venue [data-reveal-style="mask"]');
  const out = [];
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => out.push({ isIntersecting: e.isIntersecting, ratio: e.intersectionRatio, rect: e.intersectionRect.width + "x" + e.intersectionRect.height }));
  }, { threshold: [0, 0.01, 0.14], rootMargin: "0px 0px -10% 0px" });
  io.observe(m);
  setTimeout(() => { io.disconnect(); resolve(out); }, 800);
}));
console.log(JSON.stringify(res));
await browser.close();
