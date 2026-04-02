# -*- coding: utf-8 -*-
"""UI/UX audit v3 - proper section navigation, viewport-only image check"""
import sys
import os

# Force UTF-8 output on Windows
sys.stdout.reconfigure(encoding="utf-8")

from playwright.sync_api import sync_playwright

SCREENSHOT_DIR = "tmp_screenshots/audit4"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

VIEWPORT = {"width": 1440, "height": 900}
MOBILE_VIEWPORT = {"width": 390, "height": 844}

issues = []

NAV_SECTIONS = [
    ("Hearth",      "Hero"),
    ("Lore",        "About"),
    ("Journey",     "Projects"),
    ("Forge",       "Publications"),
    ("Manuscripts", "Map"),
    ("Notes",       "Blog"),
    ("Letters",     "Letter"),
    ("Fellowship",  "Chronicle"),
]

def log(section, severity, description):
    msg = f"[{severity}] {section}: {description}"
    issues.append(msg)
    print(msg)

def goto_section(page, label):
    btn = page.locator(f'button[aria-label="Go to {label}"]').first
    btn.click()
    page.wait_for_timeout(900)

def shot(page, name):
    path = f"{SCREENSHOT_DIR}/{name}.png"
    page.screenshot(path=path)
    print(f"  screenshot -> {name}.png")
    return path

def check_visible_broken_images(page):
    """Only flag images that are in viewport AND not loaded."""
    return page.evaluate("""() => {
        const vw = window.innerWidth, vh = window.innerHeight;
        return Array.from(document.querySelectorAll('img')).filter(img => {
            const r = img.getBoundingClientRect();
            const inVP = r.left < vw && r.right > 0 && r.top < vh && r.bottom > 0;
            return inVP && r.width > 0 && (!img.complete || img.naturalWidth === 0);
        }).map(img => img.getAttribute('src') || img.src);
    }""")

def check_small_targets(page):
    return page.evaluate("""() => {
        return Array.from(document.querySelectorAll('button, a[href], [role="button"]'))
            .filter(el => {
                const r = el.getBoundingClientRect();
                const vw = window.innerWidth, vh = window.innerHeight;
                const inVP = r.left < vw && r.right > 0 && r.top < vh && r.bottom > 0;
                return inVP && r.width > 0 && r.height > 0 && (r.width < 28 || r.height < 28);
            })
            .map(el => ({
                text: (el.innerText || el.getAttribute('aria-label') || '').slice(0,40),
                w: Math.round(el.getBoundingClientRect().width),
                h: Math.round(el.getBoundingClientRect().height)
            }));
    }""")

def check_contrast_ratio(page):
    """Sample foreground/background colors of key text elements."""
    return page.evaluate("""() => {
        const results = [];
        const els = Array.from(document.querySelectorAll('p, h1, h2, h3, span, button, a'))
            .filter(el => {
                const r = el.getBoundingClientRect();
                return r.width > 10 && r.height > 10 && r.top > 0 && r.bottom < window.innerHeight;
            }).slice(0, 5);
        els.forEach(el => {
            const cs = getComputedStyle(el);
            results.push({
                tag: el.tagName,
                text: (el.innerText || '').slice(0, 30),
                color: cs.color,
                bg: cs.backgroundColor
            });
        });
        return results;
    }""")

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # ── DESKTOP ───────────────────────────────────────────────────
        print("\n=== DESKTOP (1440x900) ===")
        ctx = browser.new_context(viewport=VIEWPORT)
        page = ctx.new_page()
        console_errors = []
        page.on("console", lambda m: console_errors.append(f"{m.type}: {m.text}") if m.type in ("error", "warning") else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGEERROR: {e}"))

        page.goto("http://localhost:3000", wait_until="networkidle")
        page.wait_for_timeout(2000)
        shot(page, "d_00_initial")

        for nav_label, short_name in NAV_SECTIONS:
            print(f"\n--- {short_name} ({nav_label}) ---")
            try:
                goto_section(page, nav_label)
            except Exception as e:
                log(short_name, "HIGH", f"Navigation failed: {e}")
                continue

            shot(page, f"d_{short_name.lower()}")

            # Broken images in viewport
            broken = check_visible_broken_images(page)
            if broken:
                log(short_name, "HIGH", f"Broken/unloaded images in viewport: {broken}")

            # Section-level overflow
            sec_overflow = page.evaluate("""() => {
                return Array.from(document.querySelectorAll('section'))
                    .filter(s => s.scrollWidth > s.clientWidth + 10)
                    .map(s => ({sw: s.scrollWidth, cw: s.clientWidth, cls: s.className.slice(0,60)}));
            }""")
            if sec_overflow:
                log(short_name, "MEDIUM", f"Section overflow: {sec_overflow}")

            # Small tap targets visible on screen
            small = check_small_targets(page)
            if small:
                log(short_name, "LOW", f"Small tap targets (<28px): {small[:5]}")

            # Color sampling for reference
            colors = check_contrast_ratio(page)
            if colors:
                print(f"  Color samples: {colors[:2]}")

        # ── OVERLAY: Archive Codex ─────────────────────────────────────
        print("\n--- Overlay: Archive Codex ---")
        goto_section(page, "Hearth")
        page.wait_for_timeout(500)
        codex_btn = page.locator('button:has-text("Enter the Archive"), button:has-text("Archive")').first
        if codex_btn.count() > 0:
            codex_btn.click()
            page.wait_for_timeout(1000)
            shot(page, "overlay_codex")
            # Check overlay visible
            overlay_visible = page.evaluate("""() => {
                const ov = document.querySelector('[class*="overlay"], [class*="Overlay"], [class*="codex"], [class*="Codex"]');
                if (!ov) return false;
                const r = ov.getBoundingClientRect();
                return r.width > 100 && r.height > 100;
            }""")
            if not overlay_visible:
                log("ArchiveCodex", "HIGH", "Overlay button clicked but overlay not visible")

            # Search test
            search_inp = page.locator('input[type="search"], input[type="text"]').first
            if search_inp.count() > 0:
                search_inp.fill("energy")
                page.wait_for_timeout(600)
                shot(page, "overlay_codex_search")
            else:
                log("ArchiveCodex", "MEDIUM", "No search input found in overlay")

            page.keyboard.press("Escape")
            page.wait_for_timeout(500)
            shot(page, "overlay_codex_after_close")
        else:
            log("Hero", "MEDIUM", "Archive Codex button not found")

        # ── OVERLAY: Letter ───────────────────────────────────────────
        print("\n--- Overlay: Send a Letter ---")
        letter_btn = page.locator('button:has-text("Send a Letter")').first
        if letter_btn.count() > 0:
            letter_btn.click()
            page.wait_for_timeout(1000)
            shot(page, "overlay_letter")
            page.keyboard.press("Escape")
            page.wait_for_timeout(400)
            shot(page, "overlay_letter_closed")
        else:
            log("Hero", "LOW", "Send a Letter button not found on Hero")

        # ── CONSOLE ERRORS ────────────────────────────────────────────
        if console_errors:
            for err in console_errors[:15]:
                sev = "HIGH" if "error" in err.lower() or "PAGEERROR" in err else "LOW"
                log("Console", sev, err)

        ctx.close()

        # ── MOBILE ────────────────────────────────────────────────────
        print("\n=== MOBILE (390x844) ===")
        ctx_m = browser.new_context(
            viewport=MOBILE_VIEWPORT,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15"
        )
        page_m = ctx_m.new_page()
        mob_errors = []
        page_m.on("console", lambda m: mob_errors.append(f"{m.type}: {m.text}") if m.type in ("error", "warning") else None)
        page_m.goto("http://localhost:3000", wait_until="networkidle")
        page_m.wait_for_timeout(2000)
        shot(page_m, "m_initial")

        for nav_label, short_name in NAV_SECTIONS:
            print(f"\n--- Mobile/{short_name} ---")
            try:
                goto_section(page_m, nav_label)
            except Exception as e:
                log(f"Mobile/{short_name}", "MEDIUM", f"Nav failed: {e}")
                continue

            shot(page_m, f"m_{short_name.lower()}")

            # Horizontal overflow
            ov = page_m.evaluate("""() => ({sw: document.body.scrollWidth, vw: window.innerWidth})""")
            if ov["sw"] > ov["vw"] + 10:
                log(f"Mobile/{short_name}", "HIGH", f"H-overflow: body.scrollWidth={ov['sw']} > vp={ov['vw']}")

            # Tiny text
            tiny = page_m.evaluate("""() => {
                return Array.from(document.querySelectorAll('p, span, li, a, button'))
                    .filter(el => {
                        const r = el.getBoundingClientRect();
                        if (!r.width || !r.height) return false;
                        return parseFloat(getComputedStyle(el).fontSize) < 10;
                    }).map(el => ({tag: el.tagName, fs: getComputedStyle(el).fontSize}));
            }""")
            if tiny:
                log(f"Mobile/{short_name}", "MEDIUM", f"Text <10px: {tiny[:3]}")

        for err in mob_errors[:10]:
            log("Mobile/Console", "MEDIUM", err)

        ctx_m.close()
        browser.close()

        # ── SUMMARY ──────────────────────────────────────────────────
        print("\n" + "="*60)
        print("AUDIT SUMMARY")
        print("="*60)
        by_sev = {"HIGH": [], "MEDIUM": [], "LOW": []}
        for iss in issues:
            for sev in by_sev:
                if f"[{sev}]" in iss:
                    by_sev[sev].append(iss)
                    break
        for sev, items in by_sev.items():
            print(f"\n{sev} ({len(items)}):")
            seen = set()
            for it in items:
                key = it[:100]
                if key not in seen:
                    print(f"  {it}")
                    seen.add(key)
        print("="*60)

if __name__ == "__main__":
    run()
