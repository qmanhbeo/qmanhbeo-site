from playwright.sync_api import sync_playwright
import os, time

OUT = os.path.dirname(__file__)
os.makedirs(OUT, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # === DESKTOP ===
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()
    page.goto("http://localhost:3000")
    page.wait_for_load_state("networkidle")
    time.sleep(1.5)

    for i in range(8):
        page.evaluate(f"""
            const sections = document.querySelectorAll('section');
            if (sections[{i}]) sections[{i}].scrollIntoView({{behavior: 'instant', inline: 'start'}});
        """)
        time.sleep(0.9)
        page.screenshot(path=os.path.join(OUT, f"d_s{i:02d}.png"))
        print(f"d_s{i:02d}.png")

    # Hover over nav dots
    page.evaluate("const sections = document.querySelectorAll('section'); if(sections[0]) sections[0].scrollIntoView({behavior:'instant',inline:'start'});")
    time.sleep(0.5)
    # Try hovering over each nav dot to check tooltip
    nav_dots = page.locator('[aria-label*="Navigate"]').all()
    if nav_dots:
        nav_dots[3].hover()
        time.sleep(0.5)
        page.screenshot(path=os.path.join(OUT, "d_nav_hover.png"))
        print("d_nav_hover.png")

    # Open Archive Codex and scroll list
    page.evaluate("const sections = document.querySelectorAll('section'); if(sections[0]) sections[0].scrollIntoView({behavior:'instant',inline:'start'});")
    time.sleep(0.5)
    archive_btn = page.locator("text=Enter the Archive").first
    if archive_btn.is_visible():
        archive_btn.click()
        time.sleep(1)
        page.screenshot(path=os.path.join(OUT, "d_codex_open.png"))
        print("d_codex_open.png")
        # Try searching
        search = page.locator("input[type='text'], input[placeholder*='Search']").first
        if search.is_visible():
            search.fill("vietnam")
            time.sleep(0.5)
            page.screenshot(path=os.path.join(OUT, "d_codex_search.png"))
            print("d_codex_search.png")
            search.fill("")
            time.sleep(0.3)
        # Click second item in list
        items = page.locator(".codex-item, [class*='entry'], [class*='result']").all()
        if len(items) >= 2:
            items[1].click()
            time.sleep(0.5)
            page.screenshot(path=os.path.join(OUT, "d_codex_item2.png"))
            print("d_codex_item2.png")
        page.keyboard.press("Escape")
        time.sleep(0.5)

    # Letter overlay
    page.evaluate("const sections = document.querySelectorAll('section'); if(sections[0]) sections[0].scrollIntoView({behavior:'instant',inline:'start'});")
    time.sleep(0.3)
    letter_btn = page.locator("text=Send a Letter").first
    if letter_btn.is_visible():
        letter_btn.click()
        time.sleep(1)
        page.screenshot(path=os.path.join(OUT, "d_letter_open.png"))
        print("d_letter_open.png")
        # Fill form
        name_input = page.locator("input").first
        if name_input.is_visible():
            name_input.fill("Test User")
        page.keyboard.press("Escape")
        time.sleep(0.5)

    # Publications: cycle to next manuscript
    page.evaluate("const sections = document.querySelectorAll('section'); if(sections[4]) sections[4].scrollIntoView({behavior:'instant',inline:'start'});")
    time.sleep(0.8)
    next_btn = page.locator("[aria-label='Next manuscript']").first
    if next_btn.is_visible():
        next_btn.click()
        time.sleep(1)
        page.screenshot(path=os.path.join(OUT, "d_pub_p2.png"))
        print("d_pub_p2.png")
        next_btn.click()
        time.sleep(1)
        page.screenshot(path=os.path.join(OUT, "d_pub_p3.png"))
        print("d_pub_p3.png")

    ctx.close()

    # === MOBILE ===
    ctx = browser.new_context(viewport={"width": 390, "height": 844})
    page = ctx.new_page()
    page.goto("http://localhost:3000")
    page.wait_for_load_state("networkidle")
    time.sleep(1.5)

    for i in range(8):
        page.evaluate(f"""
            const sections = document.querySelectorAll('section');
            if (sections[{i}]) sections[{i}].scrollIntoView({{behavior: 'instant', inline: 'start'}});
        """)
        time.sleep(0.9)
        page.screenshot(path=os.path.join(OUT, f"m_s{i:02d}.png"))
        print(f"m_s{i:02d}.png")

    # Mobile: open Archive Codex
    page.evaluate("const sections = document.querySelectorAll('section'); if(sections[0]) sections[0].scrollIntoView({behavior:'instant',inline:'start'});")
    time.sleep(0.5)
    archive_btn = page.locator("text=Enter the Archive").first
    if archive_btn.is_visible():
        archive_btn.click()
        time.sleep(1)
        page.screenshot(path=os.path.join(OUT, "m_codex_open.png"))
        print("m_codex_open.png")
        page.keyboard.press("Escape")
        time.sleep(0.5)

    # Mobile: open Letter overlay
    page.evaluate("const sections = document.querySelectorAll('section'); if(sections[0]) sections[0].scrollIntoView({behavior:'instant',inline:'start'});")
    time.sleep(0.3)
    letter_btn = page.locator("text=Send a Letter").first
    if letter_btn.is_visible():
        letter_btn.click()
        time.sleep(1)
        page.screenshot(path=os.path.join(OUT, "m_letter_open.png"))
        print("m_letter_open.png")
        page.keyboard.press("Escape")
        time.sleep(0.5)

    # Mobile: publications
    page.evaluate("const sections = document.querySelectorAll('section'); if(sections[4]) sections[4].scrollIntoView({behavior:'instant',inline:'start'});")
    time.sleep(0.8)
    page.screenshot(path=os.path.join(OUT, "m_pub_detail.png"))
    print("m_pub_detail.png")

    ctx.close()

    # === TABLET ===
    ctx = browser.new_context(viewport={"width": 768, "height": 1024})
    page = ctx.new_page()
    page.goto("http://localhost:3000")
    page.wait_for_load_state("networkidle")
    time.sleep(1.5)

    for i in range(8):
        page.evaluate(f"""
            const sections = document.querySelectorAll('section');
            if (sections[{i}]) sections[{i}].scrollIntoView({{behavior: 'instant', inline: 'start'}});
        """)
        time.sleep(0.9)
        page.screenshot(path=os.path.join(OUT, f"t_s{i:02d}.png"))
        print(f"t_s{i:02d}.png")

    ctx.close()

    browser.close()
    print("\nAll done.")
