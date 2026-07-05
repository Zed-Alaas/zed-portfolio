# zed.alaas — Portfolio

A hand-built, single-page developer portfolio. Dark theme, acid-green accent, and interactive everything: a real terminal visitors can type into, a mouse-reactive particle field, smooth-scroll animations, magnetic buttons and a custom cursor.

**No frameworks. No build step. No templates.** Just HTML, CSS and vanilla JavaScript (with GSAP + Lenis from a CDN).

## Run it locally

Any static server works:

```bash
npx serve .
# or
python -m http.server 8000
```

…or just double-click `index.html`.

## Customize — your to-do list

Search the code for `TODO` comments. The quick hits:

1. **Your links** — in `index.html`, replace the placeholder GitHub / LinkedIn URLs (contact section + "This Portfolio" project card).
2. **Stats** — in the About section, tweak `data-count` numbers (years coding, projects built) to your real story.
3. **Projects** — each `<article class="work-row">` is one project. Duplicate one to add more; remove the `wip` class + tag when something ships.
4. **Copy** — the About paragraphs and terminal responses (`js/main.js`, `COMMANDS` object) are written in your voice; make them yours.
5. **Accent color** — change `--accent` in `css/style.css` (or type `theme` in the site's terminal to preview options).

## Easter eggs built in

Type in the hero terminal: `help`, `whoami`, `skills`, `projects`, `contact`, `theme`, `clear`, and `sudo hire-me`.

## Deploy (free)

- **Vercel**: `npx vercel` in this folder, done.
- **Netlify**: drag the folder into app.netlify.com/drop.
- **GitHub Pages**: push to a repo → Settings → Pages → deploy from branch.

## Under the hood

- **GSAP + ScrollTrigger** — hero reveal, scroll animations, counters
- **Lenis** — smooth scrolling
- **Canvas API** — the particle constellation (DPR-capped, pauses off-screen and when the tab is hidden)
- **Accessibility** — semantic HTML, `prefers-reduced-motion` respected everywhere, keyboard-friendly accordions, aria labels
- Everything degrades gracefully: with JS disabled the site is still fully readable.
