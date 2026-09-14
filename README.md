# Seynox IT Solutions — Website

Marketing site for Seynox IT Solutions. Static HTML pages (`.html`), no build
step — files are deployed as-is.

## Live pipeline

`git push origin main` → Hostinger's Git integration auto-pulls and deploys to
`seynox.com` (hPanel → Websites → seynox.com → Git). No manual deploy step.

## Folder structure

```
components/         Shared partials, pulled into pages via <dc-import name="...">
  site-header.html
  site-footer.html
  page-hero.html
  cta-band.html
  proof-band.html
  lead-form.html

pages/               One file per URL. Grouped by section for discoverability.
  home.html                  -> /
  services.html              -> /services        (overview)
  about.html                  -> /about
  contact.html                -> /contact
  faq.html                    -> /faq
  field-notes.html            -> /field-notes
  handover-pack.html          -> /handover-pack
  industries.html             -> /industries      (overview)
  locations.html              -> /locations       (overview)
  pricing.html                 -> /pricing
  privacy.html                 -> /privacy
  terms.html                   -> /terms
  services/
    managed-it.html                  -> /managed-it
    cloud-microsoft-365.html         -> /cloud-microsoft-365
    cybersecurity.html               -> /cybersecurity
    it-consulting.html               -> /it-consulting
  industries/
    accounting-it-support.html            -> /accounting-it-support
    legal-it-support.html                 -> /legal-it-support
    professional-services-it.html         -> /professional-services-it
  locations/
    it-support-vancouver.html       -> /it-support-vancouver
    it-support-burnaby.html         -> /it-support-burnaby
    it-support-surrey.html          -> /it-support-surrey
    it-support-coquitlam.html       -> /it-support-coquitlam
    it-support-langley.html         -> /it-support-langley
    it-support-chilliwack.html      -> /it-support-chilliwack
    it-support-white-rock.html      -> /it-support-white-rock
    it-support-delta.html           -> /it-support-delta

scripts/             Vanilla JS, loaded by every page
  support.js           Page runtime (renders each page's <x-dc> content, handles
                        component loading). Generated — treat as vendored, avoid
                        hand-editing unless you understand the whole file.
  seynox-logo.js        <seynox-logo> custom element (WebGL mark, SVG fallback)

styles/tokens.css    Design system: brand colors, fonts, base resets. Linked
                     from every page/component — the single source of truth.
uploads/             Images referenced by pages
.htaccess            Clean-URL rewrite rules (see below)
favicon.svg           Generated from the same shape math as scripts/seynox-logo.js
sitemap.xml, robots.txt
```

## Clean URLs — how they work

Every page file lives at a nested physical path (e.g.
`pages/locations/it-support-vancouver.html`) but is served at a flat clean URL
(`/it-support-vancouver`). `.htaccess` does an internal rewrite (URL bar never
changes) mapping each slug to its real file.

Each page's `<head>` also has a matching, **flat** `<base href="/<slug>">` tag
— e.g. `<base href="/it-support-vancouver">` even though the real file is
nested. This doesn't need to point at a real file; it only needs to:

1. Keep every page's relative asset paths (component fetches, etc.) resolving
   against the site root, regardless of how deep the real file is nested.
2. Give `scripts/support.js` a slug-shaped last path segment to read, so it
   knows which component is the page's root (see `dcNameFromPath` in
   `scripts/support.js`).

If you add a page, you need three things in sync: the physical file, a
`.htaccess` rule for its slug, and the `<base href="/slug">` tag in its
`<head>`. Copy an existing page in the same section as a template.

## Adding a new location page

1. Copy an existing file in `pages/locations/` as a starting point.
2. Update its `<base href>`, `<title>`, canonical/OG tags, and body copy.
3. Add its slug to the location alternation in `.htaccess`
   (`RewriteRule ^(it-support-(vancouver|...))/?$ ...`).
4. Add a nav link in `components/site-header.html` (and footer, if listed
   there) and an entry in `sitemap.xml`.

## Components

Components are fetched client-side by name: `<dc-import name="site-header">`
in a page triggers a fetch of `/site-header.html`, which `.htaccess` rewrites
to `components/site-header.html`. Component names must stay in sync with
their filename (case-sensitive) in both the `dc-import` tag and the
`.htaccess` component rule.

## Static assets are cached for 7 days at the edge (important)

Hostinger's CDN serves `styles/tokens.css`, `scripts/*.js`, images, etc. with
`Cache-Control: public, max-age=604800`, and it does **not** purge on deploy.
Editing one of these files and pushing is not enough — visitors (and the CDN
itself) can keep serving the old version for up to a week.

When you change any file under `styles/` or `scripts/`, bump the version query
string on every reference to it (e.g. `tokens.css?v=2` -> `?v=3`):

```
grep -rl 'tokens.css?v=2' pages components | xargs sed -i '' 's/tokens.css?v=2/tokens.css?v=3/'
```

Also note: `.htaccess` is **not** overwritten by Hostinger's git auto-deploy on
repeat deploys (it's left alone to protect manual server-side rules). If you
change `.htaccess`, you must also push it directly:

```
cat .htaccess | ssh -p 65002 -i ~/.ssh/hostinger_seynox u734557115@191.101.13.47 \
  "cat > domains/seynox.com/public_html/.htaccess"
```

## Domain

Site domain is `seynox.com`. Email addresses still use `@seynox.ca`
intentionally — that's a separate, unrelated business decision, not a bug.
