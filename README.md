# 📖 Bookworm

A tiny mobile-first incremental web game about reading too much and loving it.

Tap a book to read. Hire bookworms, librarians, audiobooks, and stranger
things. Unlock witty upgrades (reading glasses, sticky notes, caffeine IV,
cybernetic eyes…). Finish books that fill a virtual shelf. When the shelf
gets long enough, re-read with new eyes for permanent **Knowledge**.

No build step, no dependencies, no analytics. Three files.

## Play

Open `index.html` in any modern browser, or push to GitHub and turn on
GitHub Pages.

## Hosting on GitHub Pages

1. Push these files to your repo (root of any branch).
2. **Settings → Pages → Build and deployment → Deploy from a branch.**
3. Pick the branch and `/ (root)` as the folder.
4. Save. Pages will publish at `https://<user>.github.io/<repo>/`.

The included `.nojekyll` file tells Pages not to run Jekyll over the source.

## Saves

Saves live in `localStorage` under `bookworm.save.v1`. The **More** tab has
buttons to export, import, or wipe the save. Backgrounded tabs autosave.
On return, you earn 50% of your passive rate for the time you were away
(capped at 24 hours).

## Files

- `index.html` — markup and SVG book art
- `styles.css` — parchment by day, lamplight by night
- `game.js`   — game loop, data, save/load

## Tips for first-time players

- Tap the book. A lot.
- The first **Bookworm** costs 15 words. After that, the price climbs gently.
- Each tab on the bottom holds something different — Helpers earn for you,
  Upgrades make you stronger, the Library is your shelf.
- The little glow on a tab means *something’s affordable in there*.
- Re-reading (prestige) trades your library for permanent boosts. The
  longer you wait, the more knowledge you’ll keep.

Happy reading.
