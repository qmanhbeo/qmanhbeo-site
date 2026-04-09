import assert from "node:assert/strict"
import path from "node:path"
import { chromium, devices } from "playwright"

const BASE_URL = "http://127.0.0.1:3000"
const FAILURE_DIR = "/tmp/playwright-qmanhbeo-site"
const CHROMIUM_EXECUTABLE_PATH = "/home/manh/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome"

async function getPlayerPosition(page) {
  const value = await page
    .locator("dt")
    .filter({ hasText: "Player position" })
    .locator("..")
    .locator("dd")
    .textContent()

  const match = value?.match(/(\d+),\s*(\d+)/)
  if (!match) {
    throw new Error(`Unable to parse player position from: ${value ?? "<empty>"}`)
  }

  return {
    x: Number(match[1]),
    y: Number(match[2]),
  }
}

async function waitForPlayerPosition(page, predicate, description, timeout = 12_000) {
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

function assertPositionStable(before, after, label, tolerance = 2) {
  assert.ok(
    Math.abs(after.x - before.x) <= tolerance && Math.abs(after.y - before.y) <= tolerance,
    `${label} changed unexpectedly from ${JSON.stringify(before)} to ${JSON.stringify(after)}`,
  )
}

async function dragJoystick(page, dx, dy, holdMs = 450) {
  const pad = page.getByTestId("world-joystick-pad")
  const box = await pad.boundingBox()

  if (!box) {
    throw new Error("Unable to resolve world joystick pad bounds")
  }

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

  await page.evaluate(({ clientX, clientY }) => {
    window.dispatchEvent(new PointerEvent("pointermove", {
      bubbles: true,
      clientX,
      clientY,
      pointerId: 1,
      pointerType: "touch",
    }))
  }, { clientX: moveX, clientY: moveY })

  await page.waitForTimeout(holdMs)

  await page.evaluate(() => {
    window.dispatchEvent(new PointerEvent("pointerup", {
      bubbles: true,
      pointerId: 1,
      pointerType: "touch",
    }))
  })
}

function assertRectWithin(outerRect, innerRect, label, tolerance = 1) {
  assert.ok(Boolean(outerRect), `${label} outer rect is missing`)
  assert.ok(Boolean(innerRect), `${label} inner rect is missing`)
  assert.ok(innerRect.x >= outerRect.x - tolerance, `${label} overflows left edge`)
  assert.ok(innerRect.y >= outerRect.y - tolerance, `${label} overflows top edge`)
  assert.ok(innerRect.x + innerRect.width <= outerRect.x + outerRect.width + tolerance, `${label} overflows right edge`)
  assert.ok(innerRect.y + innerRect.height <= outerRect.y + outerRect.height + tolerance, `${label} overflows bottom edge`)
}

async function saveFailureArtifact(page, name) {
  const filePath = path.join(FAILURE_DIR, `${name}.png`)
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

async function seedWorldSession(page, sessionState) {
  await page.addInitScript((nextState) => {
    window.sessionStorage.setItem("world:session:v1", JSON.stringify(nextState))
  }, sessionState)
}

async function run() {
  const browser = await chromium.launch({
    executablePath: CHROMIUM_EXECUTABLE_PATH,
    headless: true,
  })

  try {
    await runStep(browser, "desktop dialogue and input lock", async (page) => {
      await page.goto(`${BASE_URL}/world`, { waitUntil: "domcontentloaded" })

      await page.getByRole("heading", { name: "Village At Night" }).waitFor({ state: "visible" })
      await page.getByText("/world", { exact: true }).waitFor({ state: "visible" })

      await focusWorldCanvas(page)
      const initialPosition = await getPlayerPosition(page)
      await page.keyboard.press("e")

      await page.getByText("Avery", { exact: true }).waitFor({ state: "visible" })
      await page
        .getByText("The campfire is still the center of the whole world here.", { exact: true })
        .waitFor({ state: "visible" })

      const lockedPosition = await getPlayerPosition(page)
      assertPositionStable(initialPosition, lockedPosition, "Player position before dialogue lock")

      await page.keyboard.down("d")
      await page.waitForTimeout(900)
      await page.keyboard.up("d")

      const stillLockedPosition = await getPlayerPosition(page)
      assertPositionStable(lockedPosition, stillLockedPosition, "Dialogue lock")

      await page.getByRole("button", { name: "Next", exact: true }).click()
      await page
        .getByText("Walk around first. The village makes more sense once you feel the distances.", { exact: true })
        .waitFor({ state: "visible" })

      await page.getByRole("button", { name: "Close", exact: true }).click()
      await page
        .getByText("Walk around first. The village makes more sense once you feel the distances.", { exact: true })
        .waitFor({ state: "hidden" })

      await page.keyboard.down("d")
      await waitForPlayerPosition(page, (position) => position.x >= stillLockedPosition.x + 24, "movement after dialogue closes")
      await page.keyboard.up("d")
    })

    await runStep(browser, "home entry to library return flow", async (page) => {
      await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" })
      await page.getByRole("button", { name: "Enter the World", exact: true }).click()
      await page.waitForURL(/\/world$/)
      await page.getByRole("heading", { name: "Village At Night" }).waitFor({ state: "visible" })

      await focusWorldCanvas(page)

      await page.keyboard.down("a")
      await waitForPlayerPosition(page, (position) => position.x <= 130, "the player to reach the Library lane")
      await page.keyboard.up("a")

      await page.keyboard.down("w")
      await waitForPlayerPosition(page, (position) => position.y <= 130, "the player to reach the Library")
      await page.keyboard.up("w")

      await page.keyboard.press("e")

      await page.getByLabel("Close world panel").waitFor({ state: "visible" })
      await page.getByText("Scholar Scrolls", { exact: true }).waitFor({ state: "visible" })

      await page.getByRole("button", { name: "Read full manuscript" }).first().click()
      await page.waitForURL(/\/item\//)
      await page.getByLabel("Close entry").waitFor({ state: "visible" })

      await page.getByLabel("Close entry").click()

      await page.waitForURL(/\/world$/)
      await page.getByLabel("Close world panel").waitFor({ state: "visible" })
      await page.getByText("Scholar Scrolls", { exact: true }).waitFor({ state: "visible" })
    })

    await runStep(browser, "iphone 14 pro max viewport fit", async (page) => {
      await page.goto(`${BASE_URL}/world`, { waitUntil: "domcontentloaded" })
      await page.getByRole("heading", { name: "Village At Night" }).waitFor({ state: "visible" })
      await page.locator("canvas").first().waitFor({ state: "visible" })

      const viewport = page.viewportSize()
      assert.ok(viewport, "Viewport size is missing")

      const pageMetrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }))

      assert.ok(
        pageMetrics.scrollWidth <= pageMetrics.innerWidth + 1,
        `Page scroll width exceeds viewport width: ${JSON.stringify(pageMetrics)}`,
      )

      const mapCard = await page.getByTestId("world-map-card").boundingBox()
      const canvasShell = await page.getByTestId("world-canvas-shell").boundingBox()
      const canvas = await page.locator("canvas").first().boundingBox()

      assert.ok(mapCard, "World map card is missing")
      assert.ok(mapCard.width <= viewport.width + 1, `Map card width exceeds viewport: ${JSON.stringify({ viewport, mapCard })}`)
      assert.ok(mapCard.x >= -1, `Map card starts off-screen: ${JSON.stringify({ viewport, mapCard })}`)
      assert.ok(
        mapCard.x + mapCard.width <= viewport.width + 1,
        `Map card right edge exceeds viewport: ${JSON.stringify({ viewport, mapCard })}`,
      )

      assertRectWithin(mapCard, canvasShell, "Canvas shell within map card")
      assertRectWithin(canvasShell, canvas, "Canvas within shell")
    }, devices["iPhone 14 Pro Max"])

    await runStep(browser, "iphone 14 pro max publications panel fit", async (page) => {
      await seedWorldSession(page, {
        activeSectionId: "publications",
        dialogueState: { isOpen: false, npcId: null, speaker: "", lines: [], lineIndex: 0 },
        playerPosition: { x: 320, y: 352 },
      })

      await page.goto(`${BASE_URL}/world`, { waitUntil: "domcontentloaded" })
      await page.getByTestId("world-section-panel").waitFor({ state: "visible" })
      await page.getByText("Scholar Scrolls", { exact: true }).waitFor({ state: "visible" })

      const viewport = page.viewportSize()
      assert.ok(viewport, "Viewport size is missing")

      const mapCard = await page.getByTestId("world-map-card").boundingBox()
      const panel = await page.getByTestId("world-section-panel").boundingBox()
      const closeButton = await page.getByTestId("world-section-panel-close").boundingBox()
      const scrollMetrics = await page.evaluate(() => {
        const scrollArea = document.querySelector(".manuscript-scrollable-area")
        if (!scrollArea) return null
        return {
          clientHeight: scrollArea.clientHeight,
          scrollHeight: scrollArea.scrollHeight,
        }
      })

      assert.ok(mapCard, "World map card is missing")
      assert.ok(panel, "World section panel is missing")
      assert.ok(closeButton, "World section panel close button is missing")
      assert.ok(scrollMetrics, "Publications scroll area is missing")
      assert.ok(panel.y <= 16, `Panel should anchor near the viewport top: ${JSON.stringify({ viewport, panel })}`)
      assert.ok(
        panel.height >= viewport.height - 32,
        `Panel height is still too constrained on mobile: ${JSON.stringify({ viewport, panel })}`,
      )
      assert.ok(
        panel.height > mapCard.height + 120,
        `Panel is still trapped inside the map card: ${JSON.stringify({ mapCard, panel })}`,
      )
      assert.ok(
        scrollMetrics.clientHeight >= 220,
        `Publications scroll area is too short on mobile: ${JSON.stringify(scrollMetrics)}`,
      )
      assert.ok(
        closeButton.width >= 44 && closeButton.height >= 44,
        `Close button touch target is too small: ${JSON.stringify(closeButton)}`,
      )

      await page.getByLabel("Close world panel").click()
      await page.getByTestId("world-section-panel").waitFor({ state: "hidden" })
    }, devices["iPhone 14 Pro Max"])

    await runStep(browser, "mobile joystick movement and interact", async (page) => {
      await page.goto(`${BASE_URL}/world`, { waitUntil: "domcontentloaded" })
      await page.getByRole("heading", { name: "Village At Night" }).waitFor({ state: "visible" })

      const initialPosition = await getPlayerPosition(page)
      await dragJoystick(page, 28, 0)
      await waitForPlayerPosition(page, (position) => position.x >= initialPosition.x + 12, "mobile joystick movement")

      await page.goto(`${BASE_URL}/world`, { waitUntil: "domcontentloaded" })
      await page.getByRole("heading", { name: "Village At Night" }).waitFor({ state: "visible" })

      const interactButton = page.getByTestId("world-interact-button")
      await interactButton.waitFor({ state: "visible" })

      await interactButton.dispatchEvent("pointerdown")
      await page.waitForTimeout(300)
      await interactButton.dispatchEvent("pointerup")

      await page.getByText("Avery", { exact: true }).waitFor({ state: "visible" })
      await page
        .getByText("The campfire is still the center of the whole world here.", { exact: true })
        .waitFor({ state: "visible" })
    }, devices["iPhone 13"])

    console.log("All Playwright smoke checks passed.")
  } finally {
    await browser.close()
  }
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
