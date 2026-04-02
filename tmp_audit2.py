"""
UI/UX audit v2 - navigates via scrollLeft + aria-label buttons
"""
import os
from playwright.sync_api import sync_playwright

SCREENSHOT_DIR = "tmp_screenshots/audit4"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

VIEWPORT = {"width": 1440, "height": 900}
MOBILE_VIEWPORT = {"width": 390, "height": 844}

issues = []

def log(section, severity, description):
    msg = f"[{severity}] {section}: {description}"
    issues.append(msg)
    print(msg)

def goto_section(page, index, label):
    """Navigate to section by clicking its aria-label button, then wait for scroll."""
    btn = page.locator(f'button[aria-label="Go to {label}"]')
    btn.click()
    page.wait_for_timeout(1000)

def screenshot(page, name):
    path = f"{SCREENSHOT_DIR}/{name}.png"
    page.screenshot(path=path)
    print(f"  -> {path}")
    return path

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # ── DESKTOP ──────────────────────────────────────────────────
        print("\n=== DESKTOP (1440x900) ===")
        ctx = browser.new_context(viewport=VIEWPORT)
        page = ctx.new_page()

        console_errors = []
        page.on("console", lambda m: console_errors.append(f"{m.type}: {m.text}") if m.type in ("error", "warning") else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGEERROR: {e}"))

        page.goto("http://localhost:3000", wait_until="networkidle")
        page.wait_for_timeout(1500)

        # Check what nav buttons are available
        nav_btns = page.locator('button[aria-label^="Go to"]').all()
        labels = [b.get_attribute("aria-label") for b in nav_btns]
        print(f"  Nav buttons found: {labels}")

        sections = [
            ("Hearth", "Hero"),
            ("Annals", "About"),
            ("Relics", "Projects"),
            ("Scrolls", "Publications"),
            ("Cartography", "Map"),
            ("Tales", "Blog"),
            ("Missive", "Letter"),
            ("Chronicle", "Chronicle"),
        ]

        # Try auto-detecting section labels from buttons
        detected_labels = [b.get_attribute("aria-label").replace("Go to ", "") for b in nav_btns]
        if detected_labels:
            sections = [(lbl, lbl) for lbl in detected_labels]
            print(f"  Using detected sections: {[s[0] for s in sections]}")

        for i, (nav_label, short_name) in enumerate(sections):
            print(f"\n--- [{i}] {short_name} ---")
            try:
                goto_section(page, i, nav_label)
            except Exception as e:
                print(f"  Nav failed: {e}")

            screenshot(page, f"d_{i:02d}_{short_name}")

            # Check broken images (only in viewport area)
            broken = page.evaluate("""() => {
                return Array.from(document.querySelectorAll('img'))
                    .filter(img => {
                        const r = img.getBoundingClientRect();
                        return r.width > 0 && (!img.complete || img.naturalWidth === 0);
                    })
                    .map(img => img.src.replace('http://localhost:3000', ''));
            }""")
            if broken:
                log(short_name, "HIGH", f"Broken images: {broken}")

            # Overflow within visible section
            section_el = page.evaluate("""() => {
                const els = Array.from(document.querySelectorAll('section'));
                return els.map(s => ({
                    overflow: s.scrollWidth > s.clientWidth + 5,
                    sw: s.scrollWidth, cw: s.clientWidth,
                    cls: s.className.slice(0,50)
                })).filter(x => x.overflow);
            }""")
            if section_el:
                log(short_name, "MEDIUM", f"Section overflow: {section_el}")

            # Small interactive targets
            small = page.evaluate("""() => {
                return Array.from(document.querySelectorAll('button, a[href], [role="button"]'))
                    .filter(el => {
                        const r = el.getBoundingClientRect();
                        return r.width > 0 && r.height > 0 && (r.width < 28 || r.height < 28);
                    })
                    .map(el => ({
                        text: (el.innerText || el.getAttribute('aria-label') || '').slice(0,40),
                        w: Math.round(el.getBoundingClientRect().width),
                        h: Math.round(el.getBoundingClientRect().height)
                    }));
            }""")
            if small:
                log(short_name, "LOW", f"Small tap targets: {small[:6]}")

        # ── OVERLAY: Archive Codex ───────────────────────────────────
        print("\n--- Overlay: Archive Codex ---")
        # Navigate to Hero first
        try:
            goto_section(page, 0, sections[0][0])
        except:
            pass
        page.wait_for_timeout(500)

        codex_btn = page.locator('button:has-text("Archive"), button:has-text("Codex"), button:has-text("Enter")').first
        if codex_btn.count() > 0:
            codex_btn.click()
            page.wait_for_timeout(800)
            screenshot(page, "overlay_codex_open")
            # Test search
            search = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]').first
            if search.count() > 0:
                search.fill("reinforcement")
                page.wait_for_timeout(500)
                screenshot(page, "overlay_codex_search")
            else:
                log("ArchiveCodex", "LOW", "No search input found in codex overlay")
            # Close
            page.keyboard.press("Escape")
            page.wait_for_timeout(400)
            screenshot(page, "overlay_codex_closed")
        else:
            log("Hero", "MEDIUM", "Archive Codex button not found")

        # ── OVERLAY: Letter ──────────────────────────────────────────
        print("\n--- Overlay: Letter ---")
        letter_btn = page.locator('button:has-text("Send a Letter"), button:has-text("Letter")').first
        if letter_btn.count() > 0:
            letter_btn.click()
            page.wait_for_timeout(800)
            screenshot(page, "overlay_letter_open")
            page.keyboard.press("Escape")
            page.wait_for_timeout(400)
        else:
            log("Hero", "MEDIUM", "Letter overlay button not found")

        # ── CONSOLE ERRORS ───────────────────────────────────────────
        for err in console_errors[:20]:
            sev = "HIGH" if "error" in err.lower() or "PAGEERROR" in err else "LOW"
            log("Console", sev, err)

        ctx.close()

        # ── MOBILE ──────────────────────────────────────────────────
        print("\n=== MOBILE (390x844) ===")
        ctx_m = browser.new_context(viewport=MOBILE_VIEWPORT,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15")
        page_m = ctx_m.new_page()
        mob_errors = []
        page_m.on("console", lambda m: mob_errors.append(f"{m.type}: {m.text}") if m.type in ("error", "warning") else None)
        page_m.goto("http://localhost:3000", wait_until="networkidle")
        page_m.wait_for_timeout(1500)
        screenshot(page_m, "m_00_initial")

        mob_sections = [s[0] for s in sections[:5]]
        for i, lbl in enumerate(mob_sections):
            try:
                goto_section(page_m, i, lbl)
            except Exception as e:
                print(f"  Mobile nav failed ({lbl}): {e}")
            screenshot(page_m, f"m_{i+1:02d}_{lbl}")

            # Font size check
            small_text = page_m.evaluate("""() => {
                return Array.from(document.querySelectorAll('p, span, li, a, button, h1, h2, h3'))
                    .filter(el => {
                        const r = el.getBoundingClientRect();
                        if (!r.width || !r.height) return false;
                        return parseFloat(getComputedStyle(el).fontSize) < 11;
                    })
                    .map(el => ({tag: el.tagName, fs: getComputedStyle(el).fontSize, text: (el.innerText||'').slice(0,30)}));
            }""")
            if small_text:
                log(f"Mobile/{lbl}", "MEDIUM", f"Text <11px: {small_text[:3]}")

            # Horizontal overflow
            ov = page_m.evaluate("""() => ({sw: document.body.scrollWidth, vw: window.innerWidth})""")
            if ov["sw"] > ov["vw"] + 10:
                log(f"Mobile/{lbl}", "HIGH", f"Horizontal scroll overflow: body={ov['sw']} > vp={ov['vw']}")

        for err in mob_errors[:10]:
            log("Mobile/Console", "MEDIUM", err)

        ctx_m.close()
        browser.close()

        # ── SUMMARY ─────────────────────────────────────────────────
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
                key = it[:80]
                if key not in seen:
                    print(f"  {it}")
                    seen.add(key)
        print("="*60)

if __name__ == "__main__":
    run()
