import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });

const mobileContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
const mobilePage = await mobileContext.newPage();

await mobilePage.goto("http://localhost:3000/world", { waitUntil: "networkidle" });
await mobilePage.waitForTimeout(2000);

await mobilePage.keyboard.press("3");
await mobilePage.waitForTimeout(1000);

await mobilePage.screenshot({
  path: "./tmp_screenshots/v5-night-mobile.png",
  type: "png",
});

await browser.close();
console.log("Done!");