import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { chromium, devices } from "playwright"

const BASE_URL = "http://127.0.0.1:3000"
const ARTIFACT_DIR = path.resolve(process.cwd(), "screenshots/playwright/world")

function ensureArtifactDir() {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true })
}

async function getPlayerPosition(page) {
  await page.waitForFunction(() => typeof window.render_game_to_text === "function")
  const state = await page.evaluate(() => JSON.parse(window.render_game_to_text()))
  return state.playerPosition
}

async function waitForPlayerMove(page, predicate, description, timeout = 12_000) {
  const deadline = Date.now() + timeout
  let lastPosition = await getPlayerPosition(page)

  while (Date.now() < deadline) {
    lastPosition = await getPlayerPosition(page)
    if (predicate(lastPosition)) return lastPosition
    await page.waitForTimeout(100)
  }

  throw new Error(`Timed out waiting for ${description}. Last position: ${JSON.stringify(lastPosition)}`)
}

async function focusWorldCanvas(page) {
  const canvas = page.locator("canvas").first()
  await canvas.waitFor({ state: "visible" })
  await canvas.click({ position: { x: 320, y: 320 } })
}

async function dragJoystick(page, dx, dy, holdMs = 500) {
  const pad = page.getByTestId("world-joystick-pad")
  const box = await pad.boundingBox()

  if (!box) throw new Error("Unable to resolve world joystick pad bounds")

  const startX = box.x + box.width / 2
  const startY = box.y + box.height / 2
  const moveX = startX + dx
  const moveY = startY + dy

  await pad.dispatchEvent("pointerdown", {
    bubbles: true,
    clientX: startX,
    clientY: startY,
    pointerId: 1,
    pointerType: "touch",
  })

  const dispatchMove = async () => page.evaluate(({ clientX, clientY }) => {
    window.dispatchEvent(new PointerEvent("pointermove", {
      bubbles: true,
      clientX,
      clientY,
      pointerId: 1,
      pointerType: "touch",
    }))
  }, { clientX: moveX, clientY: moveY })

  for (let elapsed = 0; elapsed < holdMs; elapsed += 100) {
    await dispatchMove()
    await page.waitForTimeout(100)
  }

  await page.evaluate(() => {
    window.dispatchEvent(new PointerEvent("pointerup", {
      bubbles: true,
      pointerId: 1,
      pointerType: "touch",
    }))
  })
}

async function saveFailureArtifact(page, name) {
  ensureArtifactDir()
  const filePath = path.join(ARTIFACT_DIR, `${name}.png`)
  await page.screenshot({ path: filePath, fullPage: true }).catch(() => {})
  return filePath
}

async function runStep(browser, name, fn, contextOptions = {}) {
  const context = await browser.newContext(contextOptions)
  const page = await context.newPage()

  try {
    await fn(page)
    console.log(`PASS ${name}`)
  } catch (error) {
    const artifact = await saveFailureArtifact(page, name.replace(/\s+/g, "-").toLowerCase())
    console.error(`FAIL ${name}`)
    console.error(`Screenshot: ${artifact}`)
    throw error
  } finally {
    await context.close()
  }
}

async function run() {
  ensureArtifactDir()
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  })

  try {
    await runStep(browser, "desktop world route loads", async (page) => {
      await page.goto(`${BASE_URL}/world`, { waitUntil: "domcontentloaded" })
      await page.locator("#world-route").waitFor({ state: "visible" })
      await page.locator("canvas").first().waitFor({ state: "visible" })
      await page.waitForFunction(() => typeof window.render_game_to_text === "function")
    })

    await runStep(browser, "desktop movement responds", async (page) => {
      await page.goto(`${BASE_URL}/world`, { waitUntil: "domcontentloaded" })
      await focusWorldCanvas(page)
      const initial = await getPlayerPosition(page)

      await page.keyboard.down("d")
      await waitForPlayerMove(page, (pos) => pos.x >= initial.x + 8, "desktop movement to the right")
      await page.keyboard.up("d")
    })

    await runStep(browser, "mobile world viewport and controls", async (page) => {
      await page.goto(`${BASE_URL}/world`, { waitUntil: "domcontentloaded" })
      await page.locator("#world-route").waitFor({ state: "visible" })
      await page.locator("canvas").first().waitFor({ state: "visible" })
      await page.getByTestId("world-joystick-pad").waitFor({ state: "visible" })
      await page.getByTestId("world-interact-button").waitFor({ state: "visible" })

      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }))
      assert.ok(
        metrics.scrollWidth <= metrics.innerWidth + 1,
        `Page overflows mobile viewport width: ${JSON.stringify(metrics)}`
      )
    }, devices["iPhone 14 Pro Max"])

    await runStep(browser, "mobile joystick movement responds", async (page) => {
      await page.goto(`${BASE_URL}/world`, { waitUntil: "domcontentloaded" })
      const initial = await getPlayerPosition(page)
      await dragJoystick(page, 28, 0)
      await waitForPlayerMove(page, (pos) => pos.x >= initial.x + 8, "mobile joystick movement")
    }, devices["iPhone 13"])

    console.log("All world smoke checks passed.")
  } finally {
    await browser.close()
  }
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
