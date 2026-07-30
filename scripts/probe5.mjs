import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
const errs = [];
page.on("pageerror", (e) => errs.push(e.message));
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.getByText("Press the Seal", { exact: false }).waitFor({ state: "visible", timeout: 30000 });
await page.locator("button", { hasText: "H" }).first().click();
await page.waitForFunction(() => document.body.style.overflow !== "hidden", null, { timeout: 20000 }).catch(() => {});
// story chapters at their centers + closing
for (const frac of [0.125, 0.375, 0.625, 0.875]) {
  await page.evaluate((f) => {
    const el = document.querySelector("#story");
    window.scrollTo({ top: el.offsetTop + f * (el.offsetHeight - innerHeight), behavior: "instant" });
  }, frac);
  await page.waitForTimeout(3500);
  await page.screenshot({ timeout: 60000, path: `/tmp/shots/check-story-${String(frac).replace(".", "")}.png` });
}
await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
await page.waitForTimeout(4000);
await page.screenshot({ timeout: 60000, path: `/tmp/shots/check-closing.png` });
console.log("errors:", errs.length ? errs.join("; ") : "none");
await browser.close();
