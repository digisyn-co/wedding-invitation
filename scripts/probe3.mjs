import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.getByText("Click the Seal", { exact: false }).waitFor({ state: "visible", timeout: 30000 });
await page.locator("button", { hasText: "H" }).first().click();
await page.waitForFunction(() => document.body.style.overflow !== "hidden", null, { timeout: 20000 }).catch(() => {});
await page.evaluate(() => { const el = document.querySelector("#venue"); window.scrollTo({ top: el.offsetTop, behavior: "instant" }); });
for (const t of [2000, 4000, 6000]) {
  await page.waitForTimeout(2000);
  const st = await page.evaluate(() => {
    const m = document.querySelector('#venue [data-reveal-style="mask"]');
    const cs = getComputedStyle(m);
    return { t: performance.now().toFixed(0), opacity: cs.opacity, clip: cs.clipPath };
  });
  console.log(t, JSON.stringify(st));
}
await browser.close();
