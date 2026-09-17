# Seynox IT Solutions — Website

Marketing site for Seynox IT Solutions. A single self-contained `index.html`
(no build step, no bundler) covering 12 pages via a client-side hash router.

## Live pipeline

`git push origin main` → Hostinger's Git integration auto-pulls and deploys to
`seynox.com` (hPanel → Websites → seynox.com → Git). No manual deploy step.

## Folder structure

```
index.html         the entire site — all HTML/CSS/JS inline
design-system.md    typography / spacing / color / component reference —
                     read this before styling anything new
.htaccess            serves index.html for any path that isn't a real file,
                      so old bookmarked/indexed URLs still load the app
favicon.svg
robots.txt
sitemap.xml
```

The only external requests are Google Fonts and the Tailwind CDN script
(`cdn.tailwindcss.com`) — nothing to `npm install`, nothing to build.

## Routing

Pages live at hash routes, not real paths: `/#/managed-it`,
`/#/industries/legal`, etc. `window.location.hash` drives which `.page` div
is shown (see the router `<script>` near the end of `index.html`, search for
`var PAGES = {`). `/#/promise`, `/#/pricing`, `/#/insights`, `/#/services`,
`/#/industries` are aliases that show the homepage and scroll to that
section (`HOME_ANCHORS` in the same script) — they are not separate pages.

The previous site used real paths (`/managed-it`, `/cloud-microsoft-365`,
etc.). A small redirect map at the top of the router script
(`OLD_PATH_REDIRECTS`) sends anyone landing on one of those old URLs with no
hash yet to the closest equivalent `#/...` route, so old bookmarks and
search-indexed links don't just dead-end on the homepage. Extend that map if
you notice more old links in the wild.

## Known gaps (carried over honestly, not hidden)

- **No privacy or terms page.** The previous site had `/privacy` and
  `/terms`; this theme doesn't include equivalents. Don't fabricate legal
  copy — get real text from whoever owns that decision, then add pages for
  it.
- **No per-location landing pages** (Vancouver, Burnaby, Surrey, etc. each
  had their own page before). If local-SEO landing pages matter, that's a
  deliberate follow-up, not an oversight.
- **The contact form has no backend** (this is a static site). It opens the
  visitor's own mail client with a prefilled email to `hello@seynox.ca`
  rather than silently pretending to submit — a real fix, but it does
  depend on the visitor completing the send in their mail app. If a "we
  actually got your form" experience matters, that needs a form-handling
  service (Formspree, a Cloudflare Worker, etc.), which is a real backend
  decision, not something to bolt on silently.

## Design system

`design-system.md` is the source of truth for colors, type scale, spacing,
and component patterns (buttons, cards, nav, FAQ accordion, etc.). Read it
before adding a new section or page so new work matches the existing system
instead of introducing a near-duplicate pattern. If it and the code ever
disagree, the code is correct — update the doc.

## Running it locally

Just open `index.html` in a browser, or serve it over `http://`:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.
