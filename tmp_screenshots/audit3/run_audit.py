from playwright.sync_api import sync_playwright
import os, time

OUT = os.path.join(os.path.dirname(__file__))
os.makedirs(OUT, exist_ok=True)

VIEWPORTS = [
    ("desktop", 1440, 900),
    ("tablet", 768, 1024),
    ("mobile", 390, 844),
]

def nav_to_section(page, idx):
    """Click the nav dot for section idx."""
    dots = page.locator('[data-section-index]')
    count = dots.count()
    if idx < count:
        dots.nth(idx).click()
        time.sleep(0.8)
    else:
        # fallback: use keyboard
        pass

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    for vp_name, w, h in VIEWPORTS:
        print(f"\n=== {vp_name} ({w}x{h}) ===")
        ctx = browser.new_context(viewport={"width": w, "height": h})
        page = ctx.new_page()
        page.goto("http://localhost:3000")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)

        # Screenshot each section by scrolling the container
        num_sections = 8
        for i in range(num_sections):
            # Scroll section container to section i
            page.evaluate(f"""
                const container = document.getElementById('scroll-container')
                    || document.querySelector('[class*="scroll"]')
                    || document.documentElement;
                const sections = document.querySelectorAll('section, [data-section]');
                if (sections[{i}]) {{
                    sections[{i}].scrollIntoView({{behavior: 'instant', block: 'nearest', inline: 'start'}});
                }}
            """)
            time.sleep(0.7)
            path = os.path.join(OUT, f"{vp_name}_s{i:02d}.png")
            page.screenshot(path=path)
            print(f"  Saved {os.path.basename(path)}")

        # Also test overlays on desktop
        if vp_name == "desktop":
            page.goto("http://localhost:3000")
            page.wait_for_load_state("networkidle")
            time.sleep(1)

            # Try to open Archive Codex overlay
            try:
                codex_btn = page.locator("text=Archive").first
                if codex_btn.is_visible():
                    codex_btn.click()
                    time.sleep(0.8)
                    page.screenshot(path=os.path.join(OUT, "desktop_overlay_codex.png"))
                    print("  Saved desktop_overlay_codex.png")
                    page.keyboard.press("Escape")
                    time.sleep(0.5)
            except Exception as e:
                print(f"  Codex overlay: {e}")

            # Try Letter overlay
            try:
                letter_btn = page.locator("text=Letter").first
                if letter_btn.is_visible():
                    letter_btn.click()
                    time.sleep(0.8)
                    page.screenshot(path=os.path.join(OUT, "desktop_overlay_letter.png"))
                    print("  Saved desktop_overlay_letter.png")
                    page.keyboard.press("Escape")
                    time.sleep(0.5)
            except Exception as e:
                print(f"  Letter overlay: {e}")

        ctx.close()

    browser.close()
    print("\nDone!")
