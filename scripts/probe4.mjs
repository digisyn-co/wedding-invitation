import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.getByText("Press the Seal", { exact: false }).waitFor({ state: "visible", timeout: 30000 });
await page.locator("button", { hasText: "H" }).first().click();
await page.waitForFunction(() => document.body.style.overflow !== "hidden", null, { timeout: 20000 }).catch(() => {});
for (const [name, sel, extra] of [["couple", "#couple", 300], ["venue", "#venue", 0]]) {
  await page.evaluate(([s, e]) => { const el = document.querySelector(s); window.scrollTo({ top: el.offsetTop + e, behavior: "instant" }); }, [sel, extra]);
  await page.waitForTimeout(5000);
  await page.screenshot({ timeout: 60000, path: `/tmp/shots/check-${name}.png` });
}
await browser.close();
console.log("done");
