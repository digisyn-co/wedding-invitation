/* Visual QA harness: boots the experience, clicks the seal, and
   screenshots every beat at desktop + phone sizes. */
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE || "http://localhost:3000";
const OUT = process.env.OUT || "/tmp/shots";
fs.mkdirSync(OUT, { recursive: true });

const errors = [];

async function run(tag, viewport, isMobile, reducedMotion = "no-preference") {
  const browser = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--disable-gpu-sandbox"],
  });
  const ctx = await browser.newContext({ viewport, isMobile, hasTouch: isMobile, deviceScaleFactor: isMobile ? 2 : 1, reducedMotion });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`[${tag}] ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") errors.push(`[${tag}] console: ${m.text().slice(0, 200)}`); });

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ timeout: 60000, path: `${OUT}/${tag}-0-preloader.png` });
  await page.waitForTimeout(3400);
  await page.screenshot({ timeout: 60000, path: `${OUT}/${tag}-1-arrival.png` });

  // wait for the arrival scene to be interactive, then click the seal
  await page.getByText("Press the Seal", { exact: false }).waitFor({ state: "visible", timeout: 30000 });
  await page.waitForTimeout(600);
  const seal = page.locator("button", { hasText: "H" }).first();
  await seal.click();
  await page.waitForTimeout(1400);
  await page.screenshot({ timeout: 60000, path: `${OUT}/${tag}-2-burst.png` });
  // wait until the enter() sequence fully hands over to the hero
  await page.waitForFunction(() => document.body.style.overflow !== "hidden", null, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.screenshot({ timeout: 60000, path: `${OUT}/${tag}-3-hero.png` });

  // scroll through each section
  const secs = ["#couple", "#story", "#details", "#venue", "#rsvp"];
  for (const s of secs) {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) window.scrollTo({ top: el.offsetTop, behavior: "instant" });
    }, s);
    await page.waitForTimeout(2600);
    await page.screenshot({ timeout: 60000, path: `${OUT}/${tag}-4${s.replace("#", "-")}.png` });
  }
  // story internal positions
  for (const frac of [0.125, 0.44, 0.62, 0.875]) {
    await page.evaluate((f) => {
      const el = document.querySelector("#story");
      if (el) window.scrollTo({ top: el.offsetTop + f * (el.offsetHeight - innerHeight), behavior: "instant" });
    }, frac);
    await page.waitForTimeout(1200);
    await page.screenshot({ timeout: 60000, path: `${OUT}/${tag}-5-story-${String(frac).replace(".", "")}.png` });
  }
  // closing
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await page.waitForTimeout(1600);
  await page.screenshot({ timeout: 60000, path: `${OUT}/${tag}-6-closing.png` });

  await browser.close();
}

const MODE = process.env.MODE || "all";
if (MODE === "all" || MODE === "animated") {
  await run("desktop", { width: 1280, height: 800 }, false);
  await run("phone", { width: 400, height: 720 }, true);
}
if (MODE === "all" || MODE === "reduced") {
  await run("rm-desktop", { width: 1440, height: 900 }, false, "reduce");
  await run("rm-phone", { width: 390, height: 844 }, true, "reduce");
}

if (errors.length) {
  console.log("PAGE ERRORS:\n" + errors.join("\n"));
} else {
  console.log("No page errors.");
}
