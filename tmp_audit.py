"""
UI/UX audit script for qmanhbeo-site.
Visits each of the 8 horizontal sections, captures screenshots, and logs issues.
"""
import os
import time
from playwright.sync_api import sync_playwright

SCREENSHOT_DIR = "tmp_screenshots/audit4"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

VIEWPORT = {"width": 1440, "height": 900}
MOBILE_VIEWPORT = {"width": 390, "height": 844}  # iPhone 14

issues = []

def log_issue(section, severity, description):
    msg = f"[{severity}] {section}: {description}"
    issues.append(msg)
    print(msg)

def audit_section(page, section_name, index, nav_label=None):
    """Navigate to a section by clicking its nav button and audit it."""
    # Click nav button if provided
    if nav_label:
        nav_btn = page.locator(f'[title="{nav_label}"], [aria-label="{nav_label}"]').first
        if nav_btn.count() == 0:
            # Try clicking by index in the nav
            nav_btns = page.locator('nav button, [role="navigation"] button').all()
            if index < len(nav_btns):
                nav_btns[index].click()
        else:
            nav_btn.click()
        page.wait_for_timeout(800)

    shot_path = f"{SCREENSHOT_DIR}/{index:02d}_{section_name}.png"
    page.screenshot(path=shot_path, full_page=False)
    print(f"  Screenshot: {shot_path}")
    return shot_path


def run_audit():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # ── DESKTOP AUDIT ──────────────────────────────────────────────
        print("\n=== DESKTOP AUDIT (1440x900) ===")
        ctx = browser.new_context(viewport=VIEWPORT)
        page = ctx.new_page()

        # Capture console errors
        console_errors = []
        page.on("console", lambda msg: console_errors.append(f"{msg.type}: {msg.text}") if msg.type in ("error", "warning") else None)
        page.on("pageerror", lambda err: console_errors.append(f"PAGEERROR: {err}"))

        page.goto("http://localhost:3000", wait_until="networkidle")
        page.wait_for_timeout(1500)

        # Initial state screenshot
        page.screenshot(path=f"{SCREENSHOT_DIR}/00_initial.png")
        print("  Screenshot: 00_initial.png")

        # Check for horizontal overflow on body
        overflow = page.evaluate("""() => {
            const body = document.body;
            const docEl = document.documentElement;
            return {
                bodyScrollWidth: body.scrollWidth,
                bodyClientWidth: body.clientWidth,
                docScrollWidth: docEl.scrollWidth,
                docClientWidth: docEl.clientWidth,
            };
        }""")
        print(f"  Overflow check: {overflow}")
        if overflow["bodyScrollWidth"] > overflow["bodyClientWidth"] + 5:
            log_issue("Global", "MEDIUM", f"Body horizontal overflow: scrollWidth={overflow['bodyScrollWidth']} > clientWidth={overflow['bodyClientWidth']}")

        # Get all nav buttons
        page.wait_for_timeout(500)
        nav_buttons = page.locator('button[title]').all()
        print(f"  Found {len(nav_buttons)} nav buttons")

        section_names = ["Hero", "About", "Projects", "Publications", "Map", "Blog", "Letter", "Chronicle"]

        for i, name in enumerate(section_names):
            print(f"\n--- Section {i}: {name} ---")
            # Click nav button by index if possible
            nav_buttons = page.locator('button[title]').all()
            if i < len(nav_buttons):
                try:
                    nav_buttons[i].click()
                    page.wait_for_timeout(900)
                except Exception as e:
                    print(f"  Could not click nav btn {i}: {e}")

            shot = f"{SCREENSHOT_DIR}/{i+1:02d}_{name}_desktop.png"
            page.screenshot(path=shot)
            print(f"  Screenshot saved: {shot}")

            # Check for text truncation / overflow per section
            section_overflow = page.evaluate(f"""() => {{
                const sections = document.querySelectorAll('section, [data-section]');
                const results = [];
                sections.forEach((s, idx) => {{
                    if (s.scrollWidth > s.clientWidth + 5) {{
                        results.push({{idx, scrollWidth: s.scrollWidth, clientWidth: s.clientWidth, class: s.className.slice(0,60)}});
                    }}
                }});
                return results;
            }}""")
            if section_overflow:
                log_issue(name, "MEDIUM", f"Section element overflow detected: {section_overflow}")

            # Check for broken images in this section
            broken_imgs = page.evaluate("""() => {
                const imgs = Array.from(document.querySelectorAll('img'));
                return imgs.filter(img => !img.complete || img.naturalWidth === 0)
                           .map(img => ({src: img.src, alt: img.alt}));
            }""")
            if broken_imgs:
                log_issue(name, "HIGH", f"Broken images: {broken_imgs}")

            # Check button/link hit targets (< 44px is WCAG fail)
            small_targets = page.evaluate("""() => {
                const els = Array.from(document.querySelectorAll('button, a, [role="button"]'));
                return els.filter(el => {
                    const r = el.getBoundingClientRect();
                    return (r.width > 0 && r.height > 0) && (r.width < 28 || r.height < 28);
                }).map(el => ({
                    tag: el.tagName,
                    text: (el.innerText || el.title || el.getAttribute('aria-label') || '').slice(0,40),
                    w: Math.round(el.getBoundingClientRect().width),
                    h: Math.round(el.getBoundingClientRect().height)
                }));
            }""")
            if small_targets:
                log_issue(name, "LOW", f"Small tap targets (<28px): {small_targets[:5]}")

        # Check overlay functionality (Archive Codex)
        print("\n--- Overlay: Archive Codex ---")
        # Go back to Hero
        nav_buttons = page.locator('button[title]').all()
        if nav_buttons:
            nav_buttons[0].click()
            page.wait_for_timeout(800)

        # Try to open codex overlay
        codex_btn = page.locator('button:has-text("Codex"), button:has-text("Archive"), [aria-label*="codex" i], [aria-label*="archive" i]').first
        if codex_btn.count() > 0:
            codex_btn.click()
            page.wait_for_timeout(600)
            page.screenshot(path=f"{SCREENSHOT_DIR}/overlay_codex.png")
            print("  Screenshot: overlay_codex.png")
            # Check if overlay is visible
            overlay = page.locator('[class*="overlay" i], [class*="codex" i], [class*="Overlay"]').first
            if overlay.count() == 0:
                log_issue("ArchiveCodex", "HIGH", "Codex overlay button found but overlay did not open")
            # Close with Escape
            page.keyboard.press("Escape")
            page.wait_for_timeout(400)
        else:
            log_issue("Hero", "MEDIUM", "Could not find Archive Codex open button")

        # Console errors summary
        if console_errors:
            for err in console_errors[:20]:
                log_issue("Console", "HIGH" if "error" in err.lower() else "LOW", err)

        ctx.close()

        # ── MOBILE AUDIT ──────────────────────────────────────────────
        print("\n=== MOBILE AUDIT (390x844) ===")
        ctx_mobile = browser.new_context(
            viewport=MOBILE_VIEWPORT,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
        )
        page_m = ctx_mobile.new_page()
        mobile_errors = []
        page_m.on("console", lambda msg: mobile_errors.append(f"{msg.type}: {msg.text}") if msg.type in ("error", "warning") else None)

        page_m.goto("http://localhost:3000", wait_until="networkidle")
        page_m.wait_for_timeout(1500)
        page_m.screenshot(path=f"{SCREENSHOT_DIR}/mobile_00_initial.png")
        print("  Screenshot: mobile_00_initial.png")

        mobile_nav_buttons = page_m.locator('button[title]').all()
        print(f"  Mobile nav buttons found: {len(mobile_nav_buttons)}")

        for i, name in enumerate(section_names[:4]):  # first 4 sections on mobile
            mobile_nav_buttons = page_m.locator('button[title]').all()
            if i < len(mobile_nav_buttons):
                try:
                    mobile_nav_buttons[i].click()
                    page_m.wait_for_timeout(800)
                except Exception as e:
                    print(f"  Mobile nav click failed: {e}")
            shot = f"{SCREENSHOT_DIR}/mobile_{i+1:02d}_{name}.png"
            page_m.screenshot(path=shot)
            print(f"  Screenshot saved: {shot}")

            # Check font size legibility (< 12px is problematic)
            small_text = page_m.evaluate("""() => {
                const els = Array.from(document.querySelectorAll('p, span, li, a, button, h1, h2, h3, h4'));
                return els.filter(el => {
                    const r = el.getBoundingClientRect();
                    if (r.width === 0 || r.height === 0) return false;
                    const fs = parseFloat(getComputedStyle(el).fontSize);
                    return fs < 11;
                }).map(el => ({
                    tag: el.tagName,
                    text: (el.innerText||'').slice(0,30),
                    fontSize: getComputedStyle(el).fontSize
                }));
            }""")
            if small_text:
                log_issue(f"Mobile/{name}", "MEDIUM", f"Text too small (<11px): {small_text[:3]}")

            # Check for horizontal scroll on mobile
            mob_overflow = page_m.evaluate("""() => ({
                bodyScrollWidth: document.body.scrollWidth,
                windowWidth: window.innerWidth
            })""")
            if mob_overflow["bodyScrollWidth"] > mob_overflow["windowWidth"] + 10:
                log_issue(f"Mobile/{name}", "HIGH", f"Horizontal overflow: scrollWidth={mob_overflow['bodyScrollWidth']} > windowWidth={mob_overflow['windowWidth']}")

        if mobile_errors:
            for err in mobile_errors[:10]:
                log_issue("Mobile/Console", "MEDIUM", err)

        ctx_mobile.close()
        browser.close()

        # ── SUMMARY ───────────────────────────────────────────────────
        print("\n" + "="*60)
        print("UI/UX AUDIT SUMMARY")
        print("="*60)
        if not issues:
            print("No issues found.")
        else:
            high = [i for i in issues if "[HIGH]" in i]
            med  = [i for i in issues if "[MEDIUM]" in i]
            low  = [i for i in issues if "[LOW]" in i]
            print(f"\nHIGH ({len(high)}):")
            for i in high: print(f"  {i}")
            print(f"\nMEDIUM ({len(med)}):")
            for i in med: print(f"  {i}")
            print(f"\nLOW ({len(low)}):")
            for i in low: print(f"  {i}")
        print("="*60)

if __name__ == "__main__":
    run_audit()
