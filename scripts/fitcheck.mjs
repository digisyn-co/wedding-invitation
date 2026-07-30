/* Snap-scene fit audit: every scene must be exactly one viewport tall
   and its content must fit inside (no hidden overflow). */
import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const SIZES = [[1440,900],[1280,800],[1024,768],[768,1024],[430,932],[390,844],[400,720],[360,640]];
for (const [w, h] of SIZES) {
  const mobile = w < 700;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.getByText("Press the Seal", { exact: false }).waitFor({ state: "visible", timeout: 45000 });
  await page.locator("button", { hasText: "H" }).first().click();
  await page.waitForFunction(() => document.body.style.overflow !== "hidden", null, { timeout: 25000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const report = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll(".scene").forEach((sec) => {
      const id = sec.id || "closing";
      const hOk = Math.abs(sec.offsetHeight - innerHeight) <= 2;
      // measure real content extent vs scene box
      let maxBottom = 0, minTop = Infinity;
      sec.querySelectorAll(":scope > *").forEach((c) => {
        const r = c.getBoundingClientRect();
        if (r.height === 0) return;
        const cs = getComputedStyle(c);
        if (cs.position === "absolute" || cs.position === "fixed") return;
        maxBottom = Math.max(maxBottom, r.bottom);
        minTop = Math.min(minTop, r.top);
      });
      const secR = sec.getBoundingClientRect();
      const overflowPx = Math.max(0, Math.round(maxBottom - secR.bottom));
      out.push({ id, height: sec.offsetHeight, vh: innerHeight, hOk, overflowPx });
    });
    return out;
  });
  const bad = report.filter((r) => !r.hOk || r.overflowPx > 0);
  console.log(`${w}x${h}: ${bad.length ? "ISSUES " + JSON.stringify(bad) : "all scenes fit"}`);
  await ctx.close();
}
await browser.close();
