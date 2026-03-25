# 🏰 Manh's Cozy Corner - Medieval Personal Website

A horizontally scrolling personal website with a cozy medieval campfire aesthetic, built with Next.js and featuring immersive storytelling elements.

## 🌟 Overview

This project is a unique personal portfolio website that breaks away from traditional vertical scrolling. Instead, it presents content as a horizontal journey through different "sections" of a medieval story, complete with atmospheric lighting, interactive elements, and a bottom navigation trail that resembles a wanderer's path.

## Quick start
```bash
git clone https://github.com/qmanhbeo/qmanhbeo-site
cd qmanhbeo-site

npm.cmd install
# dont run "npm audit fix --force" yet
npm.cmd run dev

```

Deployed at https://qmanhbeo-site-ecru.vercel.app/

Next todos:
- Add icon for tab (like at the top of the browser, next to tab's name).
- Maybe change tab name to something else if want to
- Add all everything to archive
- Make Letter actually work
- Add photos,
- And think about real stories to add to the reflections/descriptions
- Add links to spell scrolls
- Maybe even put those projects INSIDE this website, usable from the web
- Add links to papers, maybe even paper's repos and manuscripts
- Fix fellowship's buttons' hover lights
- Add more social media links
- Add real relfections to campfire notes

- Add Toggle for "Fun mode" or "Wander mode"
- Turns into a 2D pixel game, a small town with some buildings.
- Add a “Fun Mode” toggle to the existing Next.js site. When flipped, the normal layout gives way to a small pixel world. Same content, different door. The world: A campfire at the center. Paths lead out to a few small buildings — one for projects, one for papers, one for notes, one for contact. Walk in, content appears. The stack: Phaser.js for the game layer. It lives alongside the existing site, not replacing it. The order:
1. Find a tileset you love on itch.io first
2. Get a character walking on a map
3. Add buildings with entry triggers
+ projects = workshop / guild hall
+ papers = archive / library
+ notes = tavern board / study hut
+ contact = post office / messenger cabin
+ center campfire = the emotional anchor
+ ...
+ everything reachable in under 20 seconds
4. Connect each building to the existing content components
5. Wire up the Fun Mode toggle last
- Add 2d pixel characters around the map. Me and my friends. The character design part should be the fun part. Use Phaser sprite sheet.

```
Option A (easiest): Pixel character generators

These are amazing for quick NPCs.

Good ones:

https://www.piskelapp.com

(draw your own)

https://charactercreator.org

(simple RPG sprites)

https://itch.io/game-assets/tag-character

Search:

pixel rpg character generator

You can customize:

hair

clothes

colors

skin tone

Then export the sprite sheet.

Option B: Modify existing sprites

Download a base character pack from itch.io and tweak it.

Example packs:

Tiny RPG Character Asset Pack

16x16 RPG characters

32x32 fantasy villagers

Then change:

hair color

jacket color

accessories

Boom — now it’s you and your friends.

Option C (fun): Draw them yourself

Tools that make this easy:

Aseprite (best)

Piskel (free)

Pixilart

Even very simple sprites work.

Example scale:

32x32 pixels

At that resolution you only need like 10–15 pixels of detail.

3. Turning friends into NPCs

This is where it becomes really charming.

Examples:

Sydney → reading in the library
Ross → standing near the project workshop
My Anh → sitting near the campfire

When the player walks near them:

Press E to talk

Dialogue pops up:

Sydney: "Manh spends way too much time coding."

or

Ross: "Have you checked the Projects Hall?"

It becomes a living version of your social world.

4. Environmental storytelling

NPCs don't even need dialogue.

Just placing them somewhere says something.

Example:

friend near bakery → "food memories"
friend near map → "travel buddy"
friend near library → "study friend"

That’s game design thinking.

Simply:

one map

4–6 buildings

simple walking

simple NPCs

content popups
```
- No AI yet. But could add later
- Something like: Simple OpenAI API call (hidden env key server side ofc) for character interactions. 
- I set up memory/context for each character (this is a cool way for me to keep track of my own relationships with people).
- User interacts with an NPC. First dialogues are fully pre-written. Only once they conversate long enough, show option to chat freely, or "leave a message".
- API call feeds inputs about NPC's context/background + whatever the user asks 
- Output is parsed to game
- Yeah, it's like an effort to build my own digital twin. Something simple as that will work.



- Oh, add also weather/background/decoration change based on time of year (or even time of day, but for now leave as night only). Just some simple Lunar New Year/Christmas/... concepts that can be reused every year. Simple if-thens



- Add also projects directly to the site. Like, web-UI usable apps within the scrolls. For example, the real estate data scraper, or news fetcher, or stock data fetcher. Idk if those python scripts can be added to web app and how, but we'll figure it out.

---

*"In the quiet hours of night, by firelight and thought, stories come alive in the digital realm."*



/// repush for vercel