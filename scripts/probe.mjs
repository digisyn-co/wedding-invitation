import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.getByText("Press the Seal", { exact: false }).waitFor({ state: "visible", timeout: 30000 });
await page.locator("button", { hasText: "H" }).first().click();
await page.waitForFunction(() => document.body.style.overflow !== "hidden", null, { timeout: 20000 }).catch(() => {});
await page.evaluate(() => { const el = document.querySelector("#venue"); window.scrollTo({ top: el.offsetTop, behavior: "instant" }); });
await page.waitForTimeout(2500);
const info = await page.evaluate(() => {
  const m = document.querySelector('#venue [data-reveal-style="mask"]');
  if (!m) return "NO ELEMENT";
  const r = m.getBoundingClientRect();
  const cs = getComputedStyle(m);
  return { rect: { x: r.x, y: r.y, w: r.width, h: r.height }, opacity: cs.opacity, clipPath: cs.clipPath, transform: cs.transform, obs: m.getAttribute("data-obs"), filter: cs.filter };
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
