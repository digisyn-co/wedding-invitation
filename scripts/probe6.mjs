import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
for (const [tag, vp] of [["p400", { width: 400, height: 720 }], ["p360", { width: 360, height: 640 }]]) {
  const ctx = await browser.newContext({ viewport: vp, isMobile: true, hasTouch: true, deviceScaleFactor: 2, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.getByText("Press the Seal", { exact: false }).waitFor({ state: "visible", timeout: 30000 });
  await page.screenshot({ timeout: 60000, path: `/tmp/shots/${tag}-arrival.png` });
  await page.locator("button", { hasText: "H" }).first().click();
  await page.waitForFunction(() => document.body.style.overflow !== "hidden", null, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await page.screenshot({ timeout: 60000, path: `/tmp/shots/${tag}-hero.png` });
  for (const s of ["#couple", "#rsvp"]) {
    await page.evaluate((sel) => { const el = document.querySelector(sel); window.scrollTo({ top: el.offsetTop, behavior: "instant" }); }, s);
    await page.waitForTimeout(3500);
    await page.screenshot({ timeout: 60000, path: `/tmp/shots/${tag}${s.replace("#", "-")}.png` });
  }
  // horizontal overflow check
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(tag, "h-overflow px:", overflow);
  await ctx.close();
}
await browser.close();
