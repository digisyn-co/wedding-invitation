// RSVP end-to-end: validation errors, then successful submit.
import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await browser.newContext({ viewport: { width: 400, height: 720 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, reducedMotion: "reduce" });
const page = await ctx.newPage();
const errs = [];
page.on("pageerror", (e) => errs.push(e.message));
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.getByText("Press the Seal", { exact: false }).waitFor({ state: "visible", timeout: 30000 });
await page.locator("button", { hasText: "H" }).first().click();
await page.waitForFunction(() => document.body.style.overflow !== "hidden", null, { timeout: 20000 }).catch(() => {});
await page.evaluate(() => { const el = document.querySelector("#rsvp"); window.scrollTo({ top: el.offsetTop, behavior: "instant" }); });
await page.waitForTimeout(3500);
// 1. submit empty → validation
await page.getByRole("button", { name: /send our reply/i }).click();
await page.waitForTimeout(800);
await page.screenshot({ timeout: 60000, path: "/tmp/shots/rsvp-validation.png" });
const nameErr = await page.getByText("Please share your name").isVisible();
// 2. fill + submit
await page.fill("input[placeholder='Full name']", "Amelia Santos");
await page.getByRole("radio", { name: /joyfully accepts/i }).click();
await page.selectOption("select", "2");
await page.fill("input[placeholder='Allergies, preferences…']", "No shellfish, please");
await page.fill("textarea", "We are overjoyed for you both!");
await page.getByRole("button", { name: /send our reply/i }).click();
await page.waitForTimeout(4000);
await page.screenshot({ timeout: 60000, path: "/tmp/shots/rsvp-success.png" });
const thanks = await page.getByText("Thank you").isVisible();
console.log("validation shown:", nameErr, "| success shown:", thanks, "| page errors:", errs.length ? errs.join("; ") : "none");
await browser.close();
