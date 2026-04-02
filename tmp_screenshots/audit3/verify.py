from playwright.sync_api import sync_playwright
import os, time

OUT = os.path.dirname(__file__)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # Tablet — check spell scrolls and scholar scrolls
    for vp_name, w, h in [("tablet", 768, 1024), ("desktop", 1440, 900), ("mobile", 390, 844)]:
        ctx = browser.new_context(viewport={"width": w, "height": h})
        page = ctx.new_page()
        page.goto("http://localhost:3000")
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)

        # Section 3: Spell Scrolls
        page.evaluate("""
            const sections = document.querySelectorAll('section, [data-section]');
            if (sections[3]) sections[3].scrollIntoView({behavior: 'instant', inline: 'start'});
        """)
        time.sleep(0.8)
        page.screenshot(path=os.path.join(OUT, f"fix_{vp_name}_s03_spell.png"))

        # Section 4: Scholar Scrolls
        page.evaluate("""
            const sections = document.querySelectorAll('section, [data-section]');
            if (sections[4]) sections[4].scrollIntoView({behavior: 'instant', inline: 'start'});
        """)
        time.sleep(0.8)
        page.screenshot(path=os.path.join(OUT, f"fix_{vp_name}_s04_scholar.png"))

        # Section 5: Blog
        page.evaluate("""
            const sections = document.querySelectorAll('section, [data-section]');
            if (sections[5]) sections[5].scrollIntoView({behavior: 'instant', inline: 'start'});
        """)
        time.sleep(0.8)
        page.screenshot(path=os.path.join(OUT, f"fix_{vp_name}_s05_blog.png"))

        ctx.close()

    browser.close()
    print("Done!")
