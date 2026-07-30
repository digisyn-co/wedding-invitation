import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
for (const [tag, w, h] of [["snap-desktop", 1280, 800], ["snap-phone", 390, 844]]) {
  const mobile = w < 700;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.getByText("Press the Seal", { exact: false }).waitFor({ state: "visible", timeout: 45000 });
  await page.locator("button", { hasText: "H" }).first().click();
  await page.waitForFunction(() => document.body.style.overflow !== "hidden", null, { timeout: 25000 }).catch(() => {});
  await page.waitForTimeout(1500);
  for (const sel of ["#couple", "#details", "#venue"]) {
    await page.evaluate((s) => { const el = document.querySelector(s); window.scrollTo({ top: el.offsetTop, behavior: "instant" }); }, sel);
    await page.waitForTimeout(2500);
    await page.screenshot({ timeout: 60000, path: `/tmp/shots/${tag}${sel.replace("#", "-")}.png` });
  }
  await ctx.close();
}
await browser.close();
console.log("done");
